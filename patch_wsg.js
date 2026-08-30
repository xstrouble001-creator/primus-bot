const fs = require('fs');

const filePath = 'commands/wsg.js';
let code = fs.readFileSync(filePath, 'utf8');

const newWsgCommand = `async function wsgCommand(sock, msg, args, context) {
    const { from, isGroup, sender, isSudo } = context;
    const sub = args[0]?.toLowerCase();

    global.activeLobbies = global.activeLobbies || {};

    if (sub === "username") {
        const name = args.slice(1).join(" ").trim();
        if (!name) {
            await sock.sendMessage(from, { text: "⚠️ *Usage:* #wsg username <your_name>" }, { quoted: msg });
            return;
        }
        setPlayerUsername(sender, name);
        await sock.sendMessage(from, { text: \`✅ *Game username registered as:* \${name}\` }, { quoted: msg });
        return;
    }

    if (sub === "help" || sub === "manual") {
        const manualText = \`⚡ *WORD SEARCH GAME MANUAL* ⚡\\n\\n\` +
            \`📜 *Commands:*\\n\` +
            \`• #wsg <cat> [mins] : Create a game lobby (e.g. #wsg color 3)\\n\` +
            \`• #wsg start : Start the queued lobby\\n\` +
            \`• #wsg username <name> : Register profile (Required!)\\n\` +
            \`• #wsg hint : Cost 15 XP to reveal a letter\\n\` +
            \`• #wsg group : View group leaderboard\\n\` +
            \`• #wsg leaderboard : View global top players\\n\\n\` +
            \`📂 *Categories:*\\n\` +
            \`\${Object.keys(CATEGORIES).join(", ")}\\n\\n\` +
            \`🎯 *XP & Combo System:*\\n\` +
            \`• Correct Guess: +50 XP (+10 match pts)\\n\` +
            \`• 30s Combo: Multiplies XP gain\\n\` +
            \`• Winner Bonus: +20 XP for Match Top 1\\n\`;
        await sock.sendMessage(from, { text: manualText }, { quoted: msg });
        return;
    }

    if (sub === "leaderboard") {
        const db = loadDB();
        const players = Object.entries(db)
            .filter(([_, p]) => p.username)
            .sort((a, b) => (b[1].level * 10000 + b[1].xp) - (a[1].level * 10000 + a[1].xp))
            .slice(0, 10);

        if (players.length === 0) {
            await sock.sendMessage(from, { text: "📋 No registered players in global leaderboard yet." }, { quoted: msg });
            return;
        }

        let lbText = "🏆 *GLOBAL WORD SEARCH LEADERBOARD* 🏆\\n\\n";
        players.forEach(([_, p], idx) => {
            const badge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "👤";
            lbText += \`\${badge} #\${idx + 1} *\${p.username}*\\n│ Lvl \${p.level} (\${getRankTitle(p.level)}) | XP: \${p.xp}\\n\\n\`;
        });
        await sock.sendMessage(from, { text: lbText }, { quoted: msg });
        return;
    }

    if (sub === "group") {
        if (!isGroup) {
            await sock.sendMessage(from, { text: "⚠️ This command can only be used in groups." }, { quoted: msg });
            return;
        }
        const groupMetadata = await sock.groupMetadata(from);
        const groupMemberIds = groupMetadata.participants.map(p => p.id);
        const db = loadDB();

        const groupPlayers = Object.entries(db)
            .filter(([id, p]) => groupMemberIds.includes(id) && p.username)
            .sort((a, b) => (b[1].level * 10000 + b[1].xp) - (a[1].level * 10000 + a[1].xp));

        if (groupPlayers.length === 0) {
            await sock.sendMessage(from, { text: "📋 No registered group members found. Register via #wsg username <name>." }, { quoted: msg });
            return;
        }

        let lbText = "👥 *GROUP LEADERBOARD* 👥\\n\\n";
        groupPlayers.forEach(([id, p], idx) => {
            const badge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "👤";
            lbText += \`\${badge} #\${idx + 1} *\${p.username}* (@\${id.split("@")[0]})\\n│ Lvl \${p.level} (\${getRankTitle(p.level)}) | Total XP: \${p.xp}\\n\\n\`;
        });
        await sock.sendMessage(from, { text: lbText, mentions: groupPlayers.map(p => p[0]) }, { quoted: msg });
        return;
    }

    if (sub === "hint") {
        if (!isGroup || !global.activeLobbies || !global.activeLobbies[from] || global.activeLobbies[from].state !== "ingame") {
            await sock.sendMessage(from, { text: "⚠️ No active WSG match in progress!" }, { quoted: msg });
            return;
        }
        const pData = getPlayerData(sender);
        if (!pData || !pData.username) {
            await sock.sendMessage(from, { text: "⚠️ You haven't set a game nickname! Set it using #wsg username <name>" }, { quoted: msg });
            return;
        }
        if (pData.xp < 15) {
            await sock.sendMessage(from, { text: \`❌ You need at least 15 XP to buy a hint! Current XP: \${pData.xp}\` }, { quoted: msg });
            return;
        }

        const lobby = global.activeLobbies[from];
        const unfound = lobby.wordLocations.filter(w => !lobby.found.includes(w.word));
        if (unfound.length === 0) return;

        addPlayerXP(sender, -15);
        const hintWord = unfound[Math.floor(Math.random() * unfound.length)];
        const startCell = hintWord.cells[0];

        await sock.sendMessage(from, {
            text: \`💡 *HINT BOUGHT (-15 XP)*\\n│ @\${sender.split("@")[0]}, a word starts with letter *'\${hintWord.word[0]}'* at Row \${startCell.row + 1}, Col \${startCell.col + 1}!\`,
            mentions: [sender]
        }, { quoted: msg });
        return;
    }

    if (sub === "start") {
        if (!global.activeLobbies[from] || global.activeLobbies[from].state !== "lobby") {
            await sock.sendMessage(from, { text: "⚠️ No pending lobby to start! Create one first using \`#wsg <category> [time_mins]\` (e.g. \`#wsg color 3\`)" }, { quoted: msg });
            return;
        }

        const lobby = global.activeLobbies[from];
        lobby.state = "ingame";

        const category = lobby.category;
        const allWords = [...CATEGORIES[category]].sort(() => 0.5 - Math.random());
        const words = allWords.slice(0, 10);
        const gridDim = 10;
        const grid = Array(gridDim).fill(null).map(() => Array(gridDim).fill(""));
        const wordLocations = [];

        for (const word of words) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                attempts++;
                const dir = Math.floor(Math.random() * 2);
                const r = Math.floor(Math.random() * (dir === 1 ? gridDim - word.length : gridDim));
                const c = Math.floor(Math.random() * (dir === 0 ? gridDim - word.length : gridDim));

                let fits = true;
                const cells = [];
                for (let i = 0; i < word.length; i++) {
                    const cr = dir === 1 ? r + i : r;
                    const cc = dir === 0 ? c + i : c;
                    if (grid[cr][cc] !== "" && grid[cr][cc] !== word[i]) {
                        fits = false;
                        break;
                    }
                    cells.push({ row: cr, col: cc });
                }

                if (fits) {
                    for (let i = 0; i < word.length; i++) {
                        grid[cells[i].row][cells[i].col] = word[i];
                    }
                    wordLocations.push({ word, cells });
                    placed = true;
                }
            }
        }

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < gridDim; r++) {
            for (let c = 0; c < gridDim; c++) {
                if (grid[r][c] === "") {
                    grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }

        lobby.grid = grid;
        lobby.wordLocations = wordLocations;
        lobby.words = wordLocations.map(w => w.word);
        lobby.startTime = Date.now();
        lobby.endTime = Date.now() + (lobby.timeMinutes * 60 * 1000);

        const imageBuffer = await renderGridCanvas(grid, lobby.words, [], lobby.theme);
        let text = \`🎮 *WORD SEARCH MATCH STARTED!* 🎮\\n\\n\` +
            \`📂 *Category:* \${category.toUpperCase()}\\n\` +
            \`⏱️ *Duration:* \${lobby.timeMinutes} Minute(s)\\n\` +
            \`🔍 *Find these words:*\\n\` +
            \`\${lobby.words.map(w => "• " + w).join("\\n")}\\n\\n\` +
            \`💬 Type the words directly in chat to claim XP!\`;

        await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });

        setTimeout(async () => {
            if (global.activeLobbies[from] && global.activeLobbies[from].state === "ingame") {
                await endWSGMatch(sock, from, "TIME_UP");
            }
        }, lobby.timeMinutes * 60 * 1000);

        return;
    }

    const categoryInput = sub || "animal";
    if (!CATEGORIES[categoryInput]) {
        await sock.sendMessage(from, { text: \`⚠️ Invalid category! Available categories:\\n\${Object.keys(CATEGORIES).join(", ")}\` }, { quoted: msg });
        return;
    }

    if (global.activeLobbies[from]) {
        await sock.sendMessage(from, { text: "⚠️ A match or lobby is already active in this group!" }, { quoted: msg });
        return;
    }

    const timeMinutes = parseInt(args[1]) || 2;
    global.activeLobbies[from] = {
        state: "lobby",
        host: sender,
        category: categoryInput,
        timeMinutes: timeMinutes,
        theme: "cyberpunk",
        scores: {},
        found: [],
        createdAt: Date.now()
    };

    await sock.sendMessage(from, {
        text: \`🎯 *WORD SEARCH LOBBY CREATED!* 🎯\\n\\n\` +
            \`📂 *Category:* \${categoryInput.toUpperCase()}\\n\` +
            \`⏱️ *Duration:* \${timeMinutes} minute(s)\\n\` +
            \`👤 *Host:* @\${sender.split("@")[0]}\\n\\n\` +
            \`▶️ Run *#wsg start* to begin the game!\`,
        mentions: [sender]
    }, { quoted: msg });
}`;

const startIndex = code.indexOf("async function wsgCommand");
const endIndex = code.indexOf("export default {");

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newWsgCommand + "\n\n" + code.substring(endIndex);
    fs.writeFileSync(filePath, code);
    console.log("✅ SUCCESS: wsg.js patched successfully!");
} else {
    console.error("❌ ERROR: Could not locate wsgCommand boundaries in commands/wsg.js");
}
