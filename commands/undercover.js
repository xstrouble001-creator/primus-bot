if (!global.undercoverGames) {
    global.undercoverGames = {};
}

const WORD_PAIRS = [
    { civilian: 'Coffee', undercover: 'Tea' },
    { civilian: 'Dog', undercover: 'Cat' },
    { civilian: 'iPhone', undercover: 'Android' },
    { civilian: 'Burger', undercover: 'Pizza' },
    { civilian: 'Guitar', undercover: 'Violin' },
    { civilian: 'Batman', undercover: 'Superman' }
];

export default {
    name: 'undercover',
    description: 'Lobby for Undercover secret word game',
    category: 'games',
    execute: async (sock, msg, args, context) => {
        const { from, isGroup, sender } = context;

        if (!isGroup) {
            await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚒𝚜  𝚐𝚊𝚖𝚎  𝚌𝚊𝚗  𝚘𝚗𝚕𝚢  𝚋𝚎  𝚙𝚕𝚊𝚢𝚎𝚍  𝚒𝚗  𝚐𝚛𝚘𝚞𝚙  𝚌𝚑𝚊𝚝𝚜!' }, { quoted: msg });
            return;
        }

        const subCmd = args[0]?.toLowerCase();

        if (subCmd === 'join') {
            if (!global.undercoverGames[from]) {
                await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘  𝚄𝚗𝚍𝚎𝚛𝚌𝚘𝚟𝚎𝚛  𝚕𝚘𝚋𝚋𝚢  𝚊𝚌𝚝𝚒𝚟𝚎!  𝚂𝚝𝚊𝚛𝚝  𝚘𝚗𝚎  𝚠𝚒𝚝𝚑  #𝚞𝚗𝚍𝚎𝚛𝚌𝚘𝚟𝚎𝚛' }, { quoted: msg });
                return;
            }
            const game = global.undercoverGames[from];
            if (game.state !== 'lobby') {
                await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚎  𝚐𝚊𝚖𝚎  𝚑𝚊𝚜  𝚊𝚕𝚛𝚎𝚊𝚍𝚢  𝚜𝚝𝚊𝚛𝚝𝚎𝚍!' }, { quoted: msg });
                return;
            }
            if (game.players.includes(sender)) {
                await sock.sendMessage(from, { text: '⚠️ 𝚈𝚘𝚞  𝚊𝚛𝚎  𝚊𝚕𝚛𝚎𝚊𝚍𝚢  𝚒𝚗  𝚝𝚑𝚎  𝚕𝚘𝚋𝚋𝚢!' }, { quoted: msg });
                return;
            }
            game.players.push(sender);

            let joinText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            joinText += `❖──────────【 𝚄𝙽𝙳𝙴𝚁𝙲𝙾𝚅𝙴𝚁 】──────────❖\n`;
            joinText += `│ ✅ @${sender.split('@')[0]}  𝚓𝚘𝚒𝚗𝚎𝚍  𝚝𝚑𝚎  𝚕𝚘𝚋𝚋𝚢!\n`;
            joinText += `│ 👥 𝚃𝚘𝚝𝚊𝚕  𝙿𝚕𝚊𝚢𝚎𝚛𝚜 : ${game.players.length}\n`;
            joinText += `❖─────────────────────────────❖\n\n`;
            joinText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: joinText, mentions: [sender] }, { quoted: msg });
            return;
        }

        if (global.undercoverGames[from]) {
            await sock.sendMessage(from, { text: '⚠️ 𝙰𝚗  𝚄𝚗𝚍𝚎𝚛𝚌𝚘𝚟𝚎𝚛  𝚐𝚊𝚖𝚎/𝚕𝚘𝚋𝚋𝚢  𝚒𝚜  𝚊𝚕𝚛𝚎𝚊𝚍𝚢  𝚊𝚌𝚝𝚒𝚟𝚎  𝚒𝚗  𝚝𝚑𝚒𝚜  𝚐𝚛𝚘𝚞𝚙!' }, { quoted: msg });
            return;
        }

        global.undercoverGames[from] = {
            state: 'lobby',
            players: [sender],
            roles: {},
            words: {},
            turnIndex: 0,
            clues: {},
            votes: {},
            eliminated: []
        };

        let lobbyText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        lobbyText += `❖──────────【 𝚄𝙽𝙳𝙴𝚁𝙲𝙾𝚅𝙴𝚁  𝙻𝙾𝙱𝙱𝚈 】──────────❖\n`;
        lobbyText += `│ 👤 @${sender.split('@')[0]}  𝚜𝚝𝚊𝚛𝚝𝚎𝚍  𝚊  𝚐𝚊𝚖𝚎  𝚕𝚘𝚋𝚋𝚢!\n`;
        lobbyText += `│ 👥 𝙿𝚕𝚊𝚢𝚎𝚛𝚜 : 𝟷\n`;
        lobbyText += `│ 📌 𝙾𝚝𝚑𝚎𝚛𝚜  𝚝𝚢𝚙𝚎  #𝚞𝚗𝚍𝚎𝚛𝚌𝚘𝚟𝚎𝚛  𝚓𝚘𝚒𝚗  𝚝𝚘  𝚎𝚗𝚝𝚎𝚛!\n`;
        lobbyText += `│ 🚀 𝚃𝚢𝚙𝚎  #𝚞𝚌𝚜𝚝𝚊𝚛𝚝  𝚠𝚑𝚎𝚗  𝚛𝚎𝚊𝚍𝚢 (𝙼𝚒𝚗  𝟹  𝚙𝚕𝚊𝚢𝚎𝚛𝚜)\n`;
        lobbyText += `❖─────────────────────────────❖\n\n`;
        lobbyText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: lobbyText, mentions: [sender] }, { quoted: msg });
    }
};

export async function handleUndercoverCommands(sock, msg, args, context, cmdName) {
    const { from, sender } = context;

    if (!global.undercoverGames || !global.undercoverGames[from]) {
        await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘  𝚊𝚌𝚝𝚒𝚟𝚎  𝚄𝚗𝚍𝚎𝚛𝚌𝚘𝚟𝚎𝚛  𝚐𝚊𝚖𝚎!' }, { quoted: msg });
        return;
    }

    const game = global.undercoverGames[from];

    if (cmdName === 'ucstart') {
        if (game.state !== 'lobby') {
            await sock.sendMessage(from, { text: '⚠️ 𝙶𝚊𝚖𝚎  𝚑𝚊𝚜  𝚊𝚕𝚛𝚎𝚊𝚍𝚢  𝚜𝚝𝚊𝚛𝚝𝚎𝚍!' }, { quoted: msg });
            return;
        }
        if (game.players.length < 3) {
            await sock.sendMessage(from, { text: '⚠️ 𝙽𝚎𝚎𝚍  𝚊𝚝  𝚕𝚎𝚊𝚜𝚝  𝟹  𝚙𝚕𝚊𝚢𝚎𝚛𝚜  𝚝𝚘  𝚜𝚝𝚊𝚛𝚝!' }, { quoted: msg });
            return;
        }

        const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
        const shuffled = [...game.players].sort(() => Math.random() - 0.5);

        const undercoverCount = game.players.length >= 6 ? 2 : 1;
        const undercovers = shuffled.slice(0, undercoverCount);
        const civilians = shuffled.slice(undercoverCount);

        undercovers.forEach(p => {
            game.roles[p] = 'Undercover';
            game.words[p] = pair.undercover;
        });

        civilians.forEach(p => {
            game.roles[p] = 'Civilian';
            game.words[p] = pair.civilian;
        });

        game.state = 'clue_phase';
        game.turnIndex = 0;

        for (const p of game.players) {
            let dmText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            dmText += `❖──────────【 𝚂𝙴𝙲𝚁𝙴𝚃  𝚆𝙾𝚁𝙳 】──────────❖\n`;
            dmText += `│ 🤫 𝚈𝚘𝚞𝚛  𝚂𝚎𝚌𝚛𝚎𝚝  𝚆𝚘𝚛𝚍 : *${game.words[p]}*\n`;
            dmText += `│ 🎭 𝚁𝚘𝚕𝚎 : *${game.roles[p]}*\n`;
            dmText += `❖─────────────────────────────❖\n\n`;
            dmText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            await sock.sendMessage(p, { text: dmText }).catch(() => {});
        }

        const activePlayer = game.players[game.turnIndex];

        let startText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        startText += `❖──────────【 𝙶𝙰𝙼𝙴  𝚂𝚃𝙰𝚁𝚃𝙴𝙳 】──────────❖\n`;
        startText += `│ 📩 𝚂𝚎𝚌𝚛𝚎𝚝  𝚠𝚘𝚛𝚍𝚜  𝚑𝚊𝚟𝚎  𝚋𝚎𝚎𝚗  𝚜𝚎𝚗𝚝  𝚟𝚒𝚊  𝙳𝙼!\n`;
        startText += `│ 🗣️ @${activePlayer.split('@')[0]}  𝚒𝚜  𝚞𝚙  𝚏𝚒𝚛𝚜𝚝!\n`;
        startText += `│ 📌 𝚃𝚢𝚙𝚎  #𝚌𝚕𝚞𝚎 <𝚠𝚘𝚛𝚍>  𝚝𝚘  𝚐𝚒𝚟𝚎  𝚢𝚘𝚞𝚛  𝚌𝚕𝚞𝚎.\n`;
        startText += `❖─────────────────────────────❖\n\n`;
        startText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: startText, mentions: [activePlayer] }, { quoted: msg });
        return;
    }

    if (cmdName === 'clue') {
        if (game.state !== 'clue_phase') {
            await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘𝚝  𝚒𝚗  𝚝𝚑𝚎  𝚌𝚕𝚞𝚎  𝚙𝚑𝚊𝚜𝚎!' }, { quoted: msg });
            return;
        }

        const activePlayer = game.players[game.turnIndex];
        if (sender !== activePlayer) {
            await sock.sendMessage(from, { text: `⚠️ 𝙸𝚝  𝚒𝚜  @${activePlayer.split('@')[0]}'𝚜  𝚝𝚞𝚛𝚗  𝚝𝚘  𝚐𝚒𝚟𝚎  𝚊  𝚌𝚕𝚞𝚎!`, mentions: [activePlayer] }, { quoted: msg });
            return;
        }

        const clueText = args.join(' ').trim();
        if (!clueText) {
            await sock.sendMessage(from, { text: '⚠️ 𝙿𝚕𝚎𝚊𝚜𝚎  𝚙𝚛𝚘𝚟𝚒𝚍𝚎  𝚊  𝚘𝚗𝚎-𝚠𝚘𝚛𝚍  𝚌𝚕𝚞𝚎!' }, { quoted: msg });
            return;
        }

        game.clues[sender] = clueText;
        game.turnIndex++;

        if (game.turnIndex < game.players.length) {
            const nextPlayer = game.players[game.turnIndex];
            await sock.sendMessage(from, { text: `✅ 𝙲𝚕𝚞𝚎  𝚛𝚎𝚌𝚘𝚛𝚍𝚎𝚍!\n\n👉 Next up: @${nextPlayer.split('@')[0]} (Type #clue <word>)`, mentions: [nextPlayer] }, { quoted: msg });
        } else {
            game.state = 'voting_phase';
            game.votes = {};

            let voteText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            voteText += `❖──────────【 𝚅𝙾𝚃𝙸𝙽𝙶  𝙿𝙷𝙰𝚂𝙴 】──────────❖\n`;
            voteText += `│ 📝 𝙰𝚕𝚕  𝚌𝚕𝚞𝚎𝚜  𝚑𝚊𝚟𝚎  𝚋𝚎𝚎𝚗  𝚐𝚒𝚟𝚎𝚗!\n\n`;
            Object.entries(game.clues).forEach(([p, c]) => {
                voteText += `│ 👤 @${p.split('@')[0]} : *${c}*\n`;
            });
            voteText += `\n│ 🗳️ 𝙲𝚊𝚜𝚝  𝚢𝚘𝚞𝚛  𝚟𝚘𝚝𝚎  𝚞𝚜𝚒𝚗𝚐  #𝚟𝚘𝚝𝚎 @𝚞𝚜𝚎𝚛\n`;
            voteText += `❖─────────────────────────────❖\n\n`;
            voteText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: voteText, mentions: game.players }, { quoted: msg });
        }
        return;
    }

    if (cmdName === 'vote') {
        if (game.state !== 'voting_phase') {
            await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘𝚝  𝚒𝚗  𝚝𝚑𝚎  𝚟𝚘𝚝𝚒𝚗𝚐  𝚙𝚑𝚊𝚜𝚎!' }, { quoted: msg });
            return;
        }
        if (!game.players.includes(sender)) {
            await sock.sendMessage(from, { text: '⚠️ 𝙾𝚗𝚕𝚢  𝚊𝚌𝚝𝚒𝚟𝚎  𝚙𝚕𝚊𝚢𝚎𝚛𝚜  𝚌𝚊𝚗  𝚟𝚘𝚝𝚎!' }, { quoted: msg });
            return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentioned || !game.players.includes(mentioned)) {
            await sock.sendMessage(from, { text: '⚠️ 𝙿𝚕𝚎𝚊𝚜𝚎  𝚝𝚊𝚐  𝚊  𝚟𝚊𝚕𝚒𝚍  𝚊𝚌𝚝𝚒𝚟𝚎  𝚙𝚕𝚊𝚢𝚎𝚛  𝚝𝚘  𝚟𝚘𝚝𝚎  𝚏𝚘𝚛!' }, { quoted: msg });
            return;
        }

        game.votes[sender] = mentioned;

        if (Object.keys(game.votes).length === game.players.length) {
            const voteCounts = {};
            Object.values(game.votes).forEach(v => {
                voteCounts[v] = (voteCounts[v] || 0) + 1;
            });

            let maxVotes = 0;
            let eliminated = null;
            Object.entries(voteCounts).forEach(([p, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    eliminated = p;
                }
            });

            const elimRole = game.roles[eliminated];
            game.eliminated.push(eliminated);
            game.players = game.players.filter(p => p !== eliminated);

            let resultText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            resultText += `❖──────────【 𝚅𝙾𝚃𝙴  𝚁𝙴𝚂𝚄𝙻𝚃𝚂 】──────────❖\n`;
            resultText += `│ 💀 @${eliminated.split('@')[0]}  𝚠𝚊𝚜  𝚎𝚕𝚒𝚖𝚒𝚗𝚊𝚝𝚎𝚍!\n`;
            resultText += `│ 🎭 𝚃𝚑𝚎𝚒𝚛  𝚛𝚘𝚕𝚎  𝚠𝚊𝚜 : *${elimRole}*\n`;
            resultText += `❖─────────────────────────────❖\n\n`;

            const remainingUndercover = game.players.filter(p => game.roles[p] === 'Undercover').length;
            const remainingCivilians = game.players.filter(p => game.roles[p] === 'Civilian').length;

            if (remainingUndercover === 0) {
                resultText += `🎉 *CIVILIANS WIN!* All Undercover agents were eliminated!\n\n`;
                delete global.undercoverGames[from];
            } else if (remainingUndercover >= remainingCivilians) {
                resultText += `🎉 *UNDERCOVER WINS!* They equaled or outnumbered the Civilians!\n\n`;
                delete global.undercoverGames[from];
            } else {
                game.state = 'clue_phase';
                game.turnIndex = 0;
                game.clues = {};
                const nextUp = game.players[0];
                resultText += `🔄  Starting next round! @${nextUp.split('@')[0]} is up first with #clue <word>`;
            }

            resultText += `\n\n└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            await sock.sendMessage(from, { text: resultText, mentions: [eliminated] }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: `✅ Vote recorded! (${Object.keys(game.votes).length}/${game.players.length} votes)` }, { quoted: msg });
        }
    }
}
