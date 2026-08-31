import fs from 'fs';

// Database Helper Functions
const DB_PATH = "database/pixelbomb.json";

function loadStats() {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ global: {}, groups: {} }, null, 2));
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return { global: {}, groups: {} };
    }
}

function saveStats(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function updatePlayerStats(chatId, jid, name, points, isWinner) {
    const db = loadStats();
    if (!db.global) db.global = {};
    if (!db.groups) db.groups = {};
    if (!db.groups[chatId]) db.groups[chatId] = {};

    // Update Global
    if (!db.global[jid]) db.global[jid] = { name, wins: 0, matches: 0, score: 0 };
    db.global[jid].name = name;
    db.global[jid].matches += 1;
    db.global[jid].score += points;
    if (isWinner) db.global[jid].wins += 1;

    // Update Group
    if (!db.groups[chatId][jid]) db.groups[chatId][jid] = { name, wins: 0, matches: 0, score: 0 };
    db.groups[chatId][jid].name = name;
    db.groups[chatId][jid].matches += 1;
    db.groups[chatId][jid].score += points;
    if (isWinner) db.groups[chatId][jid].wins += 1;

    saveStats(db);
}

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_FAMILY = 'WSGRoboto';

let fontRegistered = false;
function ensureFontRegistered() {
    if (fontRegistered) return;
    try {
        GlobalFonts.registerFromPath(path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'), FONT_FAMILY);
        fontRegistered = true;
    } catch (e) {
        console.error('❌ [PIXELBOMB CANVAS] Failed to register bundled font, falling back to system font:', e.message);
    }
}

// Active game lobbies in memory: { [chatId]: gameObject }
const games = {};

// Primus MD UI Card Formatter
function formatCard(title, statusBlock, bodyBlock, footerTip) {
    let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\n\n`;
    text += `❖──────────【 ${title} 】──────────❖\n`;
    text += statusBlock;
    if (bodyBlock) {
        text += `❖──────────【 𝙿𝙻𝙰𝚈𝙴𝚁𝚂 𝙕𝙾𝙽𝙴 】──────────❖\n`;
        text += bodyBlock;
    }
    text += `❖─────────────────────────────❖\n`;
    if (footerTip) text += `${footerTip}\n`;
    text += `└─ 𝑷𝒐𝑘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
    return text;
}

// Canvas Grid Generator
async function generateGridImage(game) {
    const size = game.gridDimension;
    const tileSize = 100;
    const gap = 10;
    const padding = 20;
    const width = size * tileSize + (size - 1) * gap + padding * 2;
    const height = width;

    ensureFontRegistered();
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    let tileNum = 1;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const x = padding + c * (tileSize + gap);
            const y = padding + r * (tileSize + gap);
            const tile = game.grid.find(t => t.id === tileNum);

            if (!tile.revealed) {
                // Hidden Tile (Dark Cyberpunk Style)
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, tileSize, tileSize);

                // Tile Number
                ctx.fillStyle = '#f8fafc';
                ctx.font = `bold 28px ${fontRegistered ? FONT_FAMILY : 'sans-serif'}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tileNum.toString(), x + tileSize / 2, y + tileSize / 2);
            } else {
                // Revealed Tile
                if (tile.type === 'RED') {
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(x, y, tileSize, tileSize);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold 22px ${fontRegistered ? FONT_FAMILY : 'sans-serif'}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔴 RED', x + tileSize / 2, y + tileSize / 2);
                } else if (tile.type === 'GREEN') {
                    ctx.fillStyle = '#16a34a';
                    ctx.fillRect(x, y, tileSize, tileSize);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold 20px ${fontRegistered ? FONT_FAMILY : 'sans-serif'}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🟢 GREEN', x + tileSize / 2, y + tileSize / 2);
                } else if (tile.type === 'BOMB') {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(x, y, tileSize, tileSize);
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, tileSize, tileSize);
                    ctx.fillStyle = '#ef4444';
                    ctx.font = `bold 22px ${fontRegistered ? FONT_FAMILY : 'sans-serif'}`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('💣 -30', x + tileSize / 2, y + tileSize / 2);
                }
            }
            tileNum++;
        }
    }

    return canvas.toBuffer('image/png');
}

// Generate Board State Data
function initGrid(dimension) {
    const totalTiles = dimension * dimension;
    const tiles = [];
    
    const bombCount = dimension === 4 ? 2 : (dimension === 5 ? 3 : 4);
    const remaining = totalTiles - bombCount;
    const redCount = Math.floor(remaining / 2);
    const greenCount = remaining - redCount;

    const pool = [
        ...Array(bombCount).fill('BOMB'),
        ...Array(redCount).fill('RED'),
        ...Array(greenCount).fill('GREEN')
    ].sort(() => Math.random() - 0.5);

    for (let i = 1; i <= totalTiles; i++) {
        tiles.push({
            id: i,
            type: pool[i - 1],
            revealed: false
        });
    }

    return tiles;
}

// Smart AI Tile Picker
function getAIPick(game) {
    const unrevealed = game.grid.filter(t => !t.revealed);
    if (unrevealed.length === 0) return null;

    const size = game.gridDimension;
    const greenTiles = game.grid.filter(t => t.revealed && t.type === 'GREEN');

    for (const g of greenTiles) {
        const id = g.id;
        const neighbors = [id - 1, id + 1, id - size, id + size].filter(n => n >= 1 && n <= size * size);
        const validNeighbor = unrevealed.find(u => neighbors.includes(u.id));
        if (validNeighbor && Math.random() > 0.3) {
            return validNeighbor.id;
        }
    }

    const randIndex = Math.floor(Math.random() * unrevealed.length);
    return unrevealed[randIndex].id;
}

// Main Command Handler
export async function handlePixelBomb(sock, msg, args, context) {
    const { from, sender, pushName } = context;
    const command = args[0] ? args[0].toLowerCase() : '';
    // Leaderboard Command (#pb top / #pb top global)
    if (command === "top" || command === "leaderboard") {
        const isGlobal = args[1] && args[1].toLowerCase() === "global";
        const db = loadStats();
        const pool = isGlobal ? db.global : (db.groups[from] || {});
        
        const sorted = Object.entries(pool)
            .map(([jid, data]) => ({ jid, ...data }))
            .sort((a, b) => b.wins - a.wins || b.score - a.score);

        if (sorted.length === 0) {
            const emptyMsg = formatCard(
                isGlobal ? "🏆 𝙶𝙻𝙾𝙱𝙰𝙻 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳 🏆" : "🏆 𝙶𝚁𝙾𝚄𝙿 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳 🏆",
                `│ ⚠️ No match history recorded yet!\n│ Play a game of #pb to start ranking.\n`,
                null,
                "💡 Type #pb to launch a game!"
            );
            return await sock.sendMessage(from, { text: emptyMsg }, { quoted: msg });
        }

        const mentions = [];
        let body = "";
        const medals = ["🥇", "🥈", "🥉"];

        sorted.slice(0, 10).forEach((p, idx) => {
            const medal = medals[idx] || "👤";
            const winRate = p.matches > 0 ? Math.round((p.wins / p.matches) * 100) : 0;
            const tag = p.jid === "BOT" ? "🤖 Primus AI" : `@${p.jid.split("@")[0]}`;
            if (p.jid !== "BOT") mentions.push(p.jid);

            body += `│ ${medal} #${idx + 1} ${tag}\n│    ├ 📊 Wins: ${p.wins} | Matches: ${p.matches} (${winRate}% Win Rate)\n│    └ 🎯 Total Score: ${p.score > 0 ? "+" : ""}${p.score} pts\n│\n`;
        });

        // User Stats
        const userRankIdx = sorted.findIndex(p => p.jid === sender);
        let userStatBlock = "";
        if (userRankIdx !== -1) {
            const u = sorted[userRankIdx];
            userStatBlock = `│ 👤 Your Rank: #${userRankIdx + 1} | 🥇 Wins: ${u.wins} | 🎯 Score: ${u.score} pts\n`;
        }

        const leaderText = formatCard(
            isGlobal ? "🏆 𝙶𝙻𝙾𝙱𝙰𝙻 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳 🏆" : "🏆 𝙶𝚁𝙾𝚄𝙿 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳 🏆",
            body,
            userStatBlock,
            isGlobal ? "💡 Showing global rankings across all groups" : "💡 Type #pb top global to view overall rankings!"
        );

        return await sock.sendMessage(from, { text: leaderText, mentions }, { quoted: msg });
    }


    // Help Command Manual
    if (command === "help") {
        const helpText = formatCard(
            "💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 𝙼𝙰𝙽𝚄𝙰𝙻 ⚡",
            "│ 📖 𝙷𝚘𝚠 𝚝𝚘 𝙿𝚕𝚊𝚢:\n│ Players take turns flipping tiles to score.\n│ Watch out for hidden bombs!\n│\n│ 🔴 RED Tile   : +20 pts (Red) / -10 pts (Green)\n│ 🟢 GREEN Tile : +20 pts (Green) / -10 pts (Red)\n│ 💣 BOMB Tile  : -30 pts immediately\n",
            "│ 🛠️ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜:\n│ • #pixelbomb         : Start setup\n│ • #pixelbomb 1|2     : Single/Multi\n│ • #pixelbomb easy    : 4x4 (16 tiles)\n│ • #pixelbomb medium  : 5x5 (25 tiles)\n│ • #pixelbomb hard    : 6x6 (36 tiles)\n│ • #pixelbomb add @x  : Add player\n│ • #pixelbomb start   : Launch game\n│ • #pixelbomb cancel  : End session\n│ • #claim <number>    : Flip a tile\n│ • #pb top            : View Group Leaderboard\n│ • #pb top global     : View Global Leaderboard\n\n│ 🏆 𝚁𝙰𝙽𝙺𝙸𝙽𝙶 𝚂𝚈𝚂𝚃𝙴𝙼:\n│ Ranks are saved automatically after every match.\n│ Ranking Priority: 🥇 Wins > 🎯 Score > 📊 Win %\n",
            "💡 Ready? Type #pixelbomb or #pb to begin!"
        );
        return await sock.sendMessage(from, { text: helpText }, { quoted: msg });
    }

    let game = games[from];

    // Cancel Command
    if (command === 'cancel') {
        if (games[from]) {
            delete games[from];
            const cancelMsg = formatCard('💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 ⚡', `│ 🛑 Game lobby cancelled.\n`, null, null);
            return await sock.sendMessage(from, { text: cancelMsg }, { quoted: msg });
        } else {
            return await sock.sendMessage(from, { text: `⚠️ No active Pixel Bomb game to cancel!` }, { quoted: msg });
        }
    }

    // Initialize New Game Setup
    if (!game) {
        games[from] = {
            state: 'SETUP_MODE',
            host: sender,
            hostName: pushName || 'Host',
            mode: null,
            gridDimension: 4,
            players: [],
            scores: {},
            currentTurnIndex: 0,
            grid: []
        };

        const setupText = formatCard(
            '💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 ⚡',
            `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂 : GAME INITIALIZATION\n│ 👑 𝙷𝚘𝚜𝚝 : @${sender.split('@')[0]}\n│\n│ 📌 Select Game Mode:\n│    1️⃣ Reply "#pixelbomb 1" for Single Player\n│    2️⃣ Reply "#pixelbomb 2" for Multiplayer\n`,
            null,
            null
        );
        return await sock.sendMessage(from, { text: setupText, mentions: [sender] }, { quoted: msg });
    }

    // Mode Selection
    if (game.state === 'SETUP_MODE') {
        if (command === '1') {
            game.mode = 'SINGLE';
            game.state = 'SETUP_DIFFICULTY';
        } else if (command === '2') {
            game.mode = 'MULTI';
            game.state = 'SETUP_DIFFICULTY';
        } else {
            const setupText = formatCard(
                '💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 ⚡',
                `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂 : GAME INITIALIZATION\n│ 👑 𝙷𝚘𝚜𝚝 : @${sender.split('@')[0]}\n│\n│ 📌 Select Game Mode:\n│    1️⃣ Reply "#pixelbomb 1" for Single Player\n│    2️⃣ Reply "#pixelbomb 2" for Multiplayer\n`,
                null,
                null
            );
            return await sock.sendMessage(from, { text: setupText, mentions: [sender] }, { quoted: msg });
        }

        const diffText = formatCard(
            '💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 ⚡',
            `│ 🛡️ 𝙼𝙾𝙳𝙴 : ${game.mode}\n│\n│ 📌 Select Grid Size / Difficulty:\n│    1️⃣ "#pixelbomb easy"   (4x4 Grid)\n│    2️⃣ "#pixelbomb medium" (5x5 Grid)\n│    3️⃣ "#pixelbomb hard"   (6x6 Grid)\n`,
            null,
            null
        );
        return await sock.sendMessage(from, { text: diffText }, { quoted: msg });
    }

    // Difficulty Selection
    if (game.state === 'SETUP_DIFFICULTY') {
        if (['easy', 'medium', 'hard'].includes(command)) {
            if (command === 'easy') game.gridDimension = 4;
            if (command === 'medium') game.gridDimension = 5;
            if (command === 'hard') game.gridDimension = 6;

            game.grid = initGrid(game.gridDimension);

            if (game.mode === 'SINGLE') {
                game.players = [
                    { jid: sender, name: pushName || 'Player', team: 'RED' },
                    { jid: 'BOT', name: 'Primus AI', team: 'GREEN' }
                ];
                game.scores[sender] = 0;
                game.scores['BOT'] = 0;
                game.state = 'PLAYING';

                const imgBuffer = await generateGridImage(game);
                const playText = formatCard(
                    '💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 ⚡',
                    `│ 🛡️ 𝙼𝙾𝙳𝙴 : SINGLE PLAYER (${game.gridDimension}x${game.gridDimension})\n│ 🎯 𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚃𝚞𝚛𝚗 : @${sender.split('@')[0]} [RED]\n│\n│ 🔴 TEAM RED [You]  : ${game.scores[sender]} Pts\n│ 🟢 TEAM GREEN [Bot] : ${game.scores['BOT']} Pts\n`,
                    `│ 🔴 @${sender.split('@')[0]} (Team Red)\n│ 🟢 🤖 Primus AI (Team Green)\n`,
                    `💡 Type #claim <1-${game.gridDimension * game.gridDimension}> to reveal a tile!`
                );
                return await sock.sendMessage(from, { image: imgBuffer, caption: playText, mentions: [sender] }, { quoted: msg });
            } else {
                game.state = 'LOBBY';
                game.players.push({ jid: sender, name: pushName || 'Host', team: 'RED' });
                game.scores[sender] = 0;

                return renderLobby(sock, from, game, msg);
            }
        }
    }

    // Lobby Commands
    if (game.state === 'LOBBY') {
                // Explicit Team Switch Logic
        if (command === "team") {
            const targetTeam = args[1] ? args[1].toUpperCase() : "";
            if (!["RED", "GREEN"].includes(targetTeam)) {
                return await sock.sendMessage(from, { text: "⚠️ Please specify a valid team: #pb team red OR #pb team green" }, { quoted: msg });
            }

            let player = game.players.find(p => p.jid === sender);
            const redCount = game.players.filter(p => p.team === "RED" && p.jid !== sender).length;
            const greenCount = game.players.filter(p => p.team === "GREEN" && p.jid !== sender).length;

            if (targetTeam === "RED" && redCount >= greenCount + 1) {
                return await sock.sendMessage(from, { text: "⚠️ Team RED has too many players! Choose GREEN for balance." }, { quoted: msg });
            }
            if (targetTeam === "GREEN" && greenCount >= redCount + 1) {
                return await sock.sendMessage(from, { text: "⚠️ Team GREEN has too many players! Choose RED for balance." }, { quoted: msg });
            }

            if (!player) {
                if (game.players.length >= 6) {
                    return await sock.sendMessage(from, { text: "⚠️ Lobby is full! (Max 6 players)" }, { quoted: msg });
                }
                player = { jid: sender, name: pushName || "Player", team: targetTeam };
                game.players.push(player);
                game.scores[sender] = 0;
            } else {
                player.team = targetTeam;
            }

            return renderLobby(sock, from, game, msg);
        }

        if (command === 'add') {
            if (sender !== game.host) return;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentioned.length === 0) return;

            for (const jid of mentioned) {
                if (!game.players.some(p => p.jid === jid)) {
                    const tagNum = jid.split('@')[0];
                    const team = game.players.filter(p => p.team === 'RED').length <= game.players.filter(p => p.team === 'GREEN').length ? 'RED' : 'GREEN';
                    game.players.push({ jid, name: `@${tagNum}`, team });
                    game.scores[jid] = 0;
                }
            }
            return renderLobby(sock, from, game, msg);
        }

        if (command === "start") {
            if (sender !== game.host) return;
            const redPlayers = game.players.filter(p => p.team === "RED");
            const greenPlayers = game.players.filter(p => p.team === "GREEN");

            if (redPlayers.length === 0 || greenPlayers.length === 0) {
                return await sock.sendMessage(from, { text: "⚠️ Cannot start match! Both Team RED and Team GREEN must have at least 1 player." }, { quoted: msg });
            }

            if (sender !== game.host) return;
            game.state = 'PLAYING';

            const imgBuffer = await generateGridImage(game);
            const currentP = game.players[game.currentTurnIndex];
            const playText = formatCard(
                '🎮 𝙼𝙰𝚃𝙲𝙷 𝙸𝙽 𝙿𝚁𝙾𝙶𝚁𝙴𝚂𝚂',
                `│ 🛡️ 𝙶𝚛𝚒𝚍 : ${game.gridDimension}x${game.gridDimension}\n│ 🎯 𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚃𝚞𝚛𝚗 : ${currentP.name} [${currentP.team}]\n`,
                renderPlayerScores(game),
                `💡 Type #claim <1-${game.gridDimension * game.gridDimension}> to reveal a square!`
            );
            return await sock.sendMessage(from, { image: imgBuffer, caption: playText, mentions: game.players.map(p => p.jid) }, { quoted: msg });
        }
    }
}

// Handler for #claim command
export async function handleClaim(sock, msg, args, context) {
    const { from, sender } = context;
    const game = games[from];

    if (!game || game.state !== 'PLAYING') return;

    const currentP = game.players[game.currentTurnIndex];
    if (currentP.jid !== sender) {
        return await sock.sendMessage(from, { text: `⚠️ It's not your turn! Waiting for ${currentP.name}`, mentions: [currentP.jid] }, { quoted: msg });
    }

    const tileId = parseInt(args[0]);
    const maxTile = game.gridDimension * game.gridDimension;

    if (isNaN(tileId) || tileId < 1 || tileId > maxTile) {
        return await sock.sendMessage(from, { text: `⚠️ Please select a valid tile between 1 and ${maxTile}.` }, { quoted: msg });
    }

    const tile = game.grid.find(t => t.id === tileId);
    if (tile.revealed) {
        return await sock.sendMessage(from, { text: `⚠️ Tile ${tileId} has already been claimed! Pick another.` }, { quoted: msg });
    }

    // Process Move
    processTilePick(game, currentP, tile);

    // Check Win Condition
    if (game.grid.every(t => t.revealed)) {
        return await finishGame(sock, from, game, msg);
    }

    // Next Turn
    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
    let nextP = game.players[game.currentTurnIndex];

    // Single Player AI Turn Handler
    if (game.mode === 'SINGLE' && nextP.jid === 'BOT') {
        const aiTileId = getAIPick(game);
        if (aiTileId) {
            const aiTile = game.grid.find(t => t.id === aiTileId);
            processTilePick(game, nextP, aiTile);
            if (game.grid.every(t => t.revealed)) {
                return await finishGame(sock, from, game, msg);
            }
        }
        game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
        nextP = game.players[game.currentTurnIndex];
    }

    // Render Updated Game State
    const imgBuffer = await generateGridImage(game);
    const redTotal = game.players.filter(p => p.team === 'RED').reduce((sum, p) => sum + (game.scores[p.jid] || 0), 0);
    const greenTotal = game.players.filter(p => p.team === 'GREEN').reduce((sum, p) => sum + (game.scores[p.jid] || 0), 0);

    const playText = formatCard(
        '🎮 𝙼𝙰𝚃𝙲𝙷 𝙸𝙽 𝙿𝚁𝙾𝙶𝚁𝙴𝚂𝚂',
        `│ 🛡️ 𝙶𝚛𝚒𝚍 : ${game.gridDimension}x${game.gridDimension}\n│ 🎯 𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚃𝚞𝚛𝚗 : ${nextP.name} [${nextP.team}]\n│\n│ 🔴 TEAM RED : ${redTotal} Pts\n│ 🟢 TEAM GREEN : ${greenTotal} Pts\n`,
        renderPlayerScores(game),
        `💡 Type #claim <1-${maxTile}> to reveal a square!`
    );

    return await sock.sendMessage(from, { image: imgBuffer, caption: playText, mentions: game.players.map(p => p.jid) }, { quoted: msg });
}

// Utility: Tile Scoring Rules
function processTilePick(game, player, tile) {
    tile.revealed = true;
    if (tile.type === 'RED') {
        if (player.team === 'RED') game.scores[player.jid] += 20;
        else game.scores[player.jid] -= 10;
    } else if (tile.type === 'GREEN') {
        if (player.team === 'GREEN') game.scores[player.jid] += 20;
        else game.scores[player.jid] -= 10;
    } else if (tile.type === 'BOMB') {
        game.scores[player.jid] -= 30;
    }
}

// Utility: Render Lobby View
async function renderLobby(sock, from, game, msg) {
    const redPlayers = game.players.filter(p => p.team === 'RED').map(p => `│    • ${p.name}`).join('\n') || '│    (None)';
    const greenPlayers = game.players.filter(p => p.team === 'GREEN').map(p => `│    • ${p.name}`).join('\n') || '│    (None)';

    const bodyText = `│ 🔴 [TEAM RED]\n${redPlayers}\n│ \n│ 🟢 [TEAM GREEN]\n${greenPlayers}\n`;
    const lobbyText = formatCard(
        '𝙻𝙾𝙱𝙱𝚈 𝚂𝚃𝙰𝚃𝚄𝚂',
        `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂 : WAITING FOR PLAYERS\n│ 📌 𝚃𝚒𝚙: Use #pixelbomb add @player to add players\n│ 👑 𝙻𝚘𝚋𝚋𝚢 𝙾𝚠𝚗𝚎𝚛 : ${game.hostName}\n│ 🎮 𝙶𝚊𝚖𝚎 : PIXEL BOMB\n│ 📐 𝙶𝚛𝚒𝚍 : ${game.gridDimension}x${game.gridDimension}\n│ 📂 𝙼𝚘𝚍𝚎 : ${game.mode}\n`,
        bodyText,
        `💡 Type #pb team red / #pb team green to choose side | #pb start to launch`
    );

    const lobbyMentions = [game.host, ...game.players.map(p => p.jid)];
    return await sock.sendMessage(from, { text: lobbyText, mentions: lobbyMentions }, { quoted: msg });
}

// Utility: Render Player Scores List
function renderPlayerScores(game) {
    return game.players.map(p => {
        const icon = p.team === 'RED' ? '🔴' : '🟢';
        return `│ ${icon} ${p.name} [${p.team}] : ${game.scores[p.jid] || 0} pts`;
    }).join('\n') + '\n';
}

// Game Finish Logic


async function finishGame(sock, from, game, msg) {
    const redTotal = game.players.filter(p => p.team === "RED").reduce((sum, p) => sum + (game.scores[p.jid] || 0), 0);
    const greenTotal = game.players.filter(p => p.team === "GREEN").reduce((sum, p) => sum + (game.scores[p.jid] || 0), 0);

    const redWon = redTotal > greenTotal;
    const greenWon = greenTotal > redTotal;

    for (const p of game.players) {
        const isWinner = (p.team === "RED" && redWon) || (p.team === "GREEN" && greenWon);
        const playerPoints = game.scores[p.jid] || 0;
        updatePlayerStats(from, p.jid, p.name, playerPoints, isWinner);
    }

    let winnerText = "🤝 IT'S A TIE!";
    if (redWon) winnerText = "🔴 TEAM RED WINS!";
    if (greenWon) winnerText = "🟢 TEAM GREEN WINS!";

    const endCard = formatCard(
        "💣 𝙿𝙸𝚇𝙴𝙻 𝙱𝙾𝙼𝙱 - 𝙶𝙰𝙼𝙴 𝙾𝚅𝙴𝚁 ⚡",
        `│ ${winnerText}\n│\n│ 🔴 Team Red Score   : ${redTotal} pts\n│ 🟢 Team Green Score : ${greenTotal} pts\n`,
        "🏆 Stats auto-saved to leaderboard!",
        "💡 Type #pb to start a new game!"
    );

    delete games[from];
    return await sock.sendMessage(from, { text: endCard }, { quoted: msg });
}
