import { renderWSGGrid, maskWord } from '../lib/wsgCanvas.js';
import { addXP, getAllPlayers, getPlayerDisplay } from '../lib/wsgPlayers.js';
import { getRank } from '../lib/rankSystem.js';
import { displayName } from '../lib/wsgNames.js';
import { buildCard } from '../lib/cardStyle.js';
import { CATEGORIES } from '../lib/wsgCategories.js';
import { resolveCanonicalJid } from '../lib/jidResolver.js';


const GRID_DIM = 10;
const WORDS_PER_MATCH = 10;
const POINTS_PER_WORD = 20;
const XP_PER_WORD = 50;
const CARD_RESEND_INTERVAL = 3;

function formatWordList(wordLocations, foundWords) {
    return wordLocations.map((loc, idx) => `${idx + 1}. ${maskWord(loc.word, foundWords)}`).join('\n');
}

function formatTimeRemaining(endTime) {
    const msLeft = Math.max(0, endTime - Date.now());
    const totalSec = Math.floor(msLeft / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildScoreboard(lobby) {
    const entries = Object.entries(lobby.scores || {});
    entries.sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return '│ No one has scored yet.';
    return entries.map(([jid, pts], idx) => {
        const p = getPlayerDisplay(jid);
        return `│ ${idx + 1}. Lvl ${p.level} ${displayName(jid)} ${p.rank}. ${pts}pts`;
    }).join('\n');
}

function placeWords(words) {
    const grid = Array(GRID_DIM).fill(null).map(() => Array(GRID_DIM).fill(""));
    const wordLocations = [];

    for (const word of words) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            attempts++;
            const dir = Math.floor(Math.random() * 2);
            const r = Math.floor(Math.random() * (dir === 1 ? GRID_DIM - word.length : GRID_DIM));
            const c = Math.floor(Math.random() * (dir === 0 ? GRID_DIM - word.length : GRID_DIM));

            let fits = true;
            const cells = [];
            for (let i = 0; i < word.length; i++) {
                const cr = dir === 1 ? r + i : r;
                const cc = dir === 0 ? c + i : c;
                if (grid[cr][cc] !== "" && grid[cr][cc] !== word[i]) {
                    fits = false;
                    break;
                }
                cells.push({ r: cr, c: cc });
            }

            if (fits) {
                for (let i = 0; i < word.length; i++) {
                    grid[cells[i].r][cells[i].c] = word[i];
                }
                wordLocations.push({ word, cells });
                placed = true;
            }
        }
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_DIM; r++) {
        for (let c = 0; c < GRID_DIM; c++) {
            if (grid[r][c] === "") grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
    }

    return { grid, wordLocations };
}

async function sendMatchCard(sock, from, lobby, msg) {
    const imageBuffer = await renderWSGGrid(lobby.grid, lobby.wordLocations, lobby.found, {
        category: lobby.category,
        timeLabel: formatTimeRemaining(lobby.endTime),
        ownerName: displayName(lobby.host)
    });

    const card = buildCard({
        sections: [
            {
                title: '𝚆𝙾𝚁𝙳𝚂',
                lines: formatWordList(lobby.wordLocations, lobby.found).split('\n')
            },
            {
                title: '𝚂𝙲𝙾𝚁𝙴𝙱𝙾𝙰𝚁𝙳',
                lines: buildScoreboard(lobby).split('\n').map(l => l.replace(/^│ /, ''))
            }
        ]
    });

    await sock.sendMessage(from, { image: imageBuffer, caption: card }, msg ? { quoted: msg } : {});
}

async function endMatch(sock, from, lobby, reason) {
    delete global.activeLobbies[from];

    const entries = Object.entries(lobby.scores || {}).sort((a, b) => b[1] - a[1]);
    const resultLines = entries.length > 0
        ? entries.map(([jid, pts], idx) => {
            const p = getPlayerDisplay(jid);
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤';
            return `${medal} ${displayName(jid)} — Lvl ${p.level} ${p.rank} — ${pts}pts`;
        })
        : ['No one scored this match.'];

    const reasonLabel = reason === 'STOPPED' ? 'Match stopped by owner' : reason === 'TIME_UP' ? "Time's up!" : 'All words found!';

    const card = buildCard({
        sections: [
            {
                title: '𝙼𝙰𝚃𝙲𝙷 𝚁𝙴𝚂𝚄𝙻𝚃𝚂',
                lines: [reasonLabel, ...resultLines]
            }
        ]
    });

    await sock.sendMessage(from, { text: card, mentions: entries.map(([jid]) => jid) });
}

async function wsgCommand(sock, msg, args, context) {
    const { from, sender: rawSender, isSudo, isOwner } = context;
    const sub = args[0]?.toLowerCase();
    global.activeLobbies = global.activeLobbies || {};
    const sender = context.isGroup ? await resolveCanonicalJid(sock, from, rawSender) : rawSender;

    if (sub === 'help') {
        const card = buildCard({
            sections: [
                {
                    title: '𝙷𝙾𝚆 𝚃𝙾 𝙿𝙻𝙰𝚈',
                    lines: [
                        'A grid of letters hides 10 words.',
                        'Only whitelisted players can answer.',
                        'Type a word directly in chat to claim it.'
                    ]
                },
                {
                    title: '𝚂𝙲𝙾𝚁𝙸𝙽𝙶',
                    lines: [
                        `${POINTS_PER_WORD}pts per word (match ranking)`,
                        `${XP_PER_WORD}XP per word (100XP = level up)`,
                        'Ranks: Gold, Platinum, Diamond, Master, Mythic'
                    ]
                },
                {
                    title: '𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂',
                    lines: [
                        `#wsg <category> [mins] — create a lobby`,
                        `#sudogame @user — add a player`,
                        `#wsg start — begin the match`,
                        `#wsg stop — end early`,
                        `#wsg leaderboard / #wsg group`
                    ]
                }
            ],
            tip: `Categories: ${Object.keys(CATEGORIES).join(', ')}`
        });
        await sock.sendMessage(from, { text: card }, { quoted: msg });
        return;
    }

    if (sub === 'leaderboard' || sub === 'group') {
        let players = Object.entries(getAllPlayers());

        if (sub === 'group') {
            if (!context.isGroup) {
                await sock.sendMessage(from, { text: '⚠️ This command can only be used in groups.' }, { quoted: msg });
                return;
            }
            const groupMetadata = await sock.groupMetadata(from);
            const memberIds = groupMetadata.participants.map(p => p.id);
            players = players.filter(([jid]) => memberIds.includes(jid));
        }

        players.sort((a, b) => (b[1].level * 1000 + b[1].xp) - (a[1].level * 1000 + a[1].xp));

        if (players.length === 0) {
            await sock.sendMessage(from, { text: '📋 No players found yet.' }, { quoted: msg });
            return;
        }

        const medal = (idx) => idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
        const lines = [];
        players.slice(0, 15).forEach(([jid, p], idx) => {
            const rank = getRank(p.level);
            lines.push(`${medal(idx)} ${displayName(jid)}`);
            lines.push(`     Lvl ${p.level} · ${rank} · ${p.xp} XP`);
        });

        const card = buildCard({
            sections: [{ title: sub === 'group' ? '𝙶𝚁𝙾𝚄𝙿 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳' : '𝙶𝙻𝙾𝙱𝙰𝙻 𝙻𝙴𝙰𝙳𝙴𝚁𝙱𝙾𝙰𝚁𝙳', lines }]
        });
        await sock.sendMessage(from, { text: card, mentions: players.slice(0, 15).map(([jid]) => jid) }, { quoted: msg });
        return;
    }

    if (sub === 'start') {
        const lobby = global.activeLobbies[from];
        if (!lobby || lobby.state !== 'lobby') {
            await sock.sendMessage(from, { text: '⚠️ No pending lobby to start! Create one first with `#wsg <category> [mins]`.' }, { quoted: msg });
            return;
        }
        if (!lobby.players || lobby.players.length === 0) {
            await sock.sendMessage(from, { text: '⚠️ No players in the lobby yet! Add some with #sudogame @user first.' }, { quoted: msg });
            return;
        }

        lobby.state = 'ingame';
        const words = [...CATEGORIES[lobby.category]].sort(() => 0.5 - Math.random()).slice(0, WORDS_PER_MATCH);
        const { grid, wordLocations } = placeWords(words);

        lobby.grid = grid;
        lobby.wordLocations = wordLocations;
        lobby.words = wordLocations.map(w => w.word);
        lobby.found = [];
        lobby.scores = {};
        lobby.endTime = Date.now() + lobby.timeMinutes * 60 * 1000;
        lobby.answerCountSinceCard = 0;

        await sendMatchCard(sock, from, lobby, msg);

        const matchStartTime = lobby.endTime;
        setTimeout(async () => {
            if (global.activeLobbies[from] && global.activeLobbies[from].state === 'ingame' && global.activeLobbies[from].endTime === matchStartTime) {
                await endMatch(sock, from, global.activeLobbies[from], 'TIME_UP');
            }
        }, lobby.timeMinutes * 60 * 1000);

        return;
    }

    if (sub === 'stop') {
        const lobby = global.activeLobbies[from];
        if (!isSudo && !isOwner) {
            await sock.sendMessage(from, { text: '⚠️ Only the owner/sudo can stop the match.' }, { quoted: msg });
            return;
        }
        if (!lobby) {
            await sock.sendMessage(from, { text: '⚠️ No active lobby or match to stop.' }, { quoted: msg });
            return;
        }
        await endMatch(sock, from, lobby, 'STOPPED');
        return;
    }

    const categoryInput = sub;
    if (!categoryInput || !CATEGORIES[categoryInput]) {
        await sock.sendMessage(from, { text: `⚠️ Invalid category! Available: ${Object.keys(CATEGORIES).join(', ')}` }, { quoted: msg });
        return;
    }
    if (global.activeLobbies[from]) {
        await sock.sendMessage(from, { text: '⚠️ A lobby or match is already active in this group!' }, { quoted: msg });
        return;
    }

    const timeMinutes = parseInt(args[1]) || 2;
    const hostData = getPlayerDisplay(sender);

    global.activeLobbies[from] = {
        state: 'lobby',
        host: sender,
        category: categoryInput,
        timeMinutes,
        gameName: 'word search',
        triggerCmd: 'wsg',
        players: [{ id: sender, level: hostData.level }],
        scores: {},
        found: [],
        createdAt: Date.now()
    };

    const lobby = global.activeLobbies[from];
    const playersListText = lobby.players.map((p, idx) => {
        const pd = getPlayerDisplay(p.id);
        return `│ ${idx === 0 ? '👑' : '⚪'} ${idx + 1}. ${displayName(p.id)} [LVL ${pd.level} ${pd.rank}]${p.id === lobby.host ? ' (Host)' : ''}`;
    }).join('\n');

    const card = buildCard({
        sections: [
            {
                title: '𝙻𝙾𝙱𝙱𝚈 𝚂𝚃𝙰𝚃𝚄𝚂',
                lines: [
                    'LOBBY CREATED... WAITING FOR PLAYERS',
                    `👑 Lobby Owner : ${displayName(sender)}`,
                    `🎮 Game : ${lobby.gameName.toUpperCase()}`,
                    `⏱️ Time Set : ${timeMinutes} ${timeMinutes === 1 ? 'Minute' : 'Minutes'}`,
                    `📂 Category : ${categoryInput.toUpperCase()}`
                ]
            },
            {
                title: '𝙿𝙻𝙰𝚈𝙴𝚁𝚂 𝚉𝙾𝙽𝙴',
                lines: playersListText.split('\n').map(l => l.replace(/^│ /, ''))
            }
        ],
        tip: `Use #sudogame @player to add players, then #${lobby.triggerCmd} start to launch!`
    });

    await sock.sendMessage(from, { text: card, mentions: [sender] }, { quoted: msg });
}

export default {
    name: 'wsg',
    aliases: ['wordsearch'],
    description: 'Word Search Game',
    async execute(sock, msg, args, context) {
        return await wsgCommand(sock, msg, args, context);
    }
};

export async function handleWSGAnswer(sock, msg, context) {
    const { from, sender, body } = context;
    const lobby = global.activeLobbies?.[from];
    if (!lobby || lobby.state !== 'ingame') return false;

    let canonicalSender = sender;
    const alreadyWhitelisted = lobby.players.some(p => p.id === sender);

    if (!alreadyWhitelisted) {
        try {
            canonicalSender = await resolveCanonicalJid(sock, from, sender);
        } catch (e) {
            console.error('❌ [WSG ANSWER] JID resolve failed, skipping this message:', e.message);
            return false;
        }
    }

    const isWhitelisted = lobby.players.some(p => p.id === canonicalSender);
    if (!isWhitelisted) return false;

    const cleanWord = (body || '').trim().toUpperCase();
    if (!lobby.words.includes(cleanWord) || lobby.found.includes(cleanWord)) return false;

    lobby.found.push(cleanWord);
    lobby.scores[canonicalSender] = (lobby.scores[canonicalSender] || 0) + POINTS_PER_WORD;
    addXP(canonicalSender, XP_PER_WORD);
    lobby.answerCountSinceCard = (lobby.answerCountSinceCard || 0) + 1;

    await sock.sendMessage(from, {
        text: `✅ ${displayName(canonicalSender)} found ${cleanWord} — +${XP_PER_WORD}xp`,
        mentions: [canonicalSender]
    }, { quoted: msg });

    if (lobby.found.length === lobby.words.length) {
        await endMatch(sock, from, lobby, 'ALL_FOUND');
        return true;
    }

    if (lobby.answerCountSinceCard >= CARD_RESEND_INTERVAL) {
        lobby.answerCountSinceCard = 0;
        await sendMatchCard(sock, from, lobby, null);
    }

    return true;
}
