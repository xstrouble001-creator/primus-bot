import { makeWASocket, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import config from './config.js';
import { useSupabaseAuthState, clearSupabaseAuthState } from './lib/supabaseAuthState.js';
import { checkPermissions } from './lib/handler.js';
import { loadSettings } from './lib/database.js';
import { renderWSGGrid } from './lib/wsgCanvas.js';
import { formatWordList } from './commands/wsg.js';
import { handleClaim } from './commands/pixelbomb.js';
import { handleUndercoverCommands } from './commands/undercover.js';
import { rememberName, getMentionName } from './lib/nameCache.js';
import { getAntilinkStrikes, updateAntilinkStrikes } from './lib/db.js';

process.on('uncaughtException', (err) => {
    console.error('❌ [UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ [UNHANDLED REJECTION]', err);
});

export const commands = new Map();
export const aliases = new Map();
const emojiPool = ['🔥', '⚡', '👑', '🚀', '💎', '🎯', '💀', '🌀', '🤖', '💫'];
const groupCaches = new Map();
const GROUP_CACHE_TTL = 5 * 60 * 1000;

const getGroupMetadata = async (sessionName, sock, from) => {
    if (!groupCaches.has(sessionName)) groupCaches.set(sessionName, new Map());
    const groupCache = groupCaches.get(sessionName);
    const cached = groupCache.get(from);
    if (cached && Date.now() - cached.ts < GROUP_CACHE_TTL) return cached.data;
    const data = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
    groupCache.set(from, { data, ts: Date.now() });
    return data;
};

export const loadCommands = async () => {
    commands.clear();
    aliases.clear();
    if (!fs.existsSync('./commands')) fs.mkdirSync('./commands');
    const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const module = await import(`./commands/${file}`);
            const cmd = module.default;
            if (cmd?.name) {
                commands.set(cmd.name.toLowerCase(), cmd);
                if (Array.isArray(cmd.aliases)) {
                    cmd.aliases.forEach(a => aliases.set(a.toLowerCase(), cmd.name.toLowerCase()));
                }
            }
        } catch (e) {
            console.error(`❌ Load error [${file}]:`, e.message);
        }
    }
    console.log(`⚡ [LOADED] ${commands.size} commands active.`);
};

export const startBot = async (sessionEntry, retryCount = 0, onPairingCode = null) => {
    const { name: sessionName, number: sessionNumber } = sessionEntry;

    if (retryCount > 5) {
        console.error(`❌ [${sessionName}] Too many reconnect attempts — stopping.`);
        if (onPairingCode) onPairingCode(null, 'Too many failed connection attempts.');
        return;
    }

    const { state, saveCreds } = await useSupabaseAuthState(sessionName);
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS('Chrome'),
        syncFullHistory: false,
        getMessage: async () => ({ conversation: '' })
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('group-participants.update', ({ id }) => {
        groupCaches.get(sessionName)?.delete(id);
    });

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (!sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            setTimeout(async () => {
                const phoneNumber = String(sessionNumber || '').replace(/[^0-9]/g, '');
                if (phoneNumber) {
                    try {
                        console.log(`📱 [${sessionName}] Requesting pairing code for: ${phoneNumber}`);
                        const code = await sock.requestPairingCode(phoneNumber);
                        console.log(`\n===================================`);
                        console.log(`🔑 [${sessionName}] PAIRING CODE: ${code}`);
                        console.log(`==================================-\n`);
                        if (onPairingCode) onPairingCode(code, null);
                    } catch (err) {
                        console.error(`❌ [${sessionName}] Pairing Error:`, err.message);
                        pairingRequested = false;
                        if (onPairingCode) onPairingCode(null, err.message);
                    }
                }
            }, 6000);
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reconnect = statusCode !== DisconnectReason.loggedOut;
            if (reconnect) {
                console.log(`⚠️ [${sessionName}] Connection closed (status ${statusCode}). Reconnecting in 3s...`);
                setTimeout(() => startBot(sessionEntry, retryCount + 1, onPairingCode), 3000);
            } else {
                console.log(`❌ [${sessionName}] Session logged out. Clearing stale session.`);
                await clearSupabaseAuthState(sessionName);
                setTimeout(() => startBot(sessionEntry, 0, onPairingCode), 3000);
            }
        } else if (connection === 'open') {
            pairingRequested = false;
            console.log(`\n⚡ [${sessionName}] PRIMUS MD IS ONLINE & READY | Prefix: "${config.prefix}"\n`);
            setTimeout(() => { retryCount = 0; }, 30000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg?.message) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const mType = Object.keys(msg.message)[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage')
            ? msg.message[mType].message
            : msg.message;

        const text = (
            unwrap?.conversation ||
            unwrap?.extendedTextMessage?.text ||
            unwrap?.imageMessage?.caption ||
            unwrap?.videoMessage?.caption ||
            unwrap?.buttonsResponseMessage?.selectedButtonId ||
            unwrap?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            ''
        ).trim();

        const isSticker = Boolean(unwrap?.stickerMessage);
        const rawSender = isGroup ? msg.key.participant : (msg.key.fromMe ? sock.user.id : from);
        const sender = rawSender ? rawSender.split(':')[0].split('@')[0] + '@s.whatsapp.net' : '';
        const senderNum = sender ? sender.split('@')[0].replace(/[^0-9]/g, '') : '';

        if (sender && msg.pushName) rememberName(sender, msg.pushName);

        const botOwnerJid = sock.user?.id || '';
        const botNumber = botOwnerJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        const settings = loadSettings() || {};
        const owners = [botNumber, ...(settings.owners || []), ...(config.ownerNumber || [])].map(n => String(n).replace(/[^0-9]/g, ''));
        const sudoUsers = [...(settings.sudo || []), ...(config.sudo || [])].map(n => String(n).replace(/[^0-9]/g, ''));
        const isOwnerOrSudo = msg.key.fromMe || owners.includes(senderNum) || sudoUsers.includes(senderNum);

        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            try {
                const groupMetadata = await getGroupMetadata(sessionName, sock, from);
                const cleanSenderJid = sender.split('@')[0];
                const cleanBotJid = botOwnerJid.split(':')[0].split('@')[0];

                const matchesJid = (p, cleanNum) => {
                    const candidates = [p.id, p.phoneNumber, p.lid].filter(Boolean);
                    return candidates.some(c => c.split(':')[0].split('@')[0] === cleanNum);
                };

                const participantObj = groupMetadata.participants.find(p => matchesJid(p, cleanSenderJid));
                const botObj = groupMetadata.participants.find(p => matchesJid(p, cleanBotJid));

                isAdmin = Boolean(participantObj && (participantObj.admin === 'admin' || participantObj.admin === 'superadmin')) || isOwnerOrSudo;
                isBotAdmin = Boolean(botObj && (botObj.admin === 'admin' || botObj.admin === 'superadmin'));
            } catch (e) {
                console.error(`[${sessionName}] Group Metadata Admin Check Error:`, e);
            }
        }

        if (text) {
            console.log(`📩 [INCOMING] From: ${senderNum} | Group: ${isGroup} | Admin: ${isAdmin} | Text: "${text}"`);
        }

        // --- GROUP PROTECTIONS (ANTILINK, ANTISTICKER, ANTITAG) ---
        if (isGroup && !isOwnerOrSudo && !isAdmin) {
            const senderName = getMentionName(sender) || senderNum;

            if (isSticker && settings.antistickerGroups?.includes(from)) {
                await sock.sendMessage(from, { delete: msg.key }).catch((e) => console.error('❌ [ANTISTICKER DELETE FAILED]', e));
                await sock.sendMessage(from, { text: `⚠️ [ANTISTICKER] @${senderName} stickers are forbidden here!`, mentions: [sender] });
                return;
            }

            const antilinkMode = settings.antilink?.[from];
            if (antilinkMode) {
                const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?)/gi;
                if (linkRegex.test(text)) {
                    await sock.sendMessage(from, { delete: msg.key }).catch((e) => console.error('❌ [ANTILINK DELETE FAILED]', e));

                    if (antilinkMode === 'kick') {
                        await sock.sendMessage(from, { text: `🚫 [ANTILINK] @${senderName} sent a link/invite and was removed instantly.`, mentions: [sender] });
                        try {
                            await sock.groupParticipantsUpdate(from, [sender], 'remove');
                        } catch (e) {
                            console.error('❌ [ANTILINK KICK FAILED]', e);
                            await sock.sendMessage(from, { text: '❌ Kick failed — please confirm the bot is an admin.' });
                        }
                    } else if (antilinkMode === 'warn') {
                        const strikes = getAntilinkStrikes(from, sender) + 1;
                        if (strikes >= 4) {
                            updateAntilinkStrikes(from, sender, 0);
                            await sock.sendMessage(from, { text: `🚨 [ANTILINK] @${senderName} reached 4/4 link warnings. Removing...`, mentions: [sender] });
                            try {
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                            } catch (e) {
                                console.error('❌ [ANTILINK KICK FAILED]', e);
                                await sock.sendMessage(from, { text: '❌ Kick failed — please confirm the bot is an admin.' });
                            }
                        } else {
                            updateAntilinkStrikes(from, sender, strikes);
                            await sock.sendMessage(from, { text: `⚠️ [ANTILINK] @${senderName} — link warning ${strikes}/4. Reaching 4 gets you removed.`, mentions: [sender] });
                        }
                    } else {
                        await sock.sendMessage(from, { text: `⚠️ [ANTILINK] @${senderName} links are strictly prohibited here!`, mentions: [sender] });
                    }
                    return;
                }
            }

            if (settings.antitagGroups?.includes(from)) {
                const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
                const totalMentions = mentions.length + (quotedParticipant ? 1 : 0);
                if (totalMentions >= 4) {
                    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
                    await sock.sendMessage(from, { text: `⚠️ [ANTITAG] @${senderName} mass tagging (4+ users) is forbidden!`, mentions: [sender] });
                    return;
                }
            }
        }

        // --- WORD SEARCH GAME LISTENER ---
        if (global.wsgGames && global.wsgGames[from] && text) {
            const game = global.wsgGames[from];
            const userGuess = text.trim().toUpperCase();
            if (game.words.includes(userGuess) && !game.found.includes(userGuess)) {
                game.found.push(userGuess);
                game.scores[sender] = (game.scores[sender] || 0) + 20;
                const wordLoc = game.wordLocations.find(l => l.word === userGuess);
                if (wordLoc) {
                    game.foundLocations.push(wordLoc);
                }

                const updatedImageBuffer = await renderWSGGrid(game.grid, game.foundLocations);
                const updatedWordList = formatWordList(game.words, game.found);
                const displayName = msg.pushName || senderNum;

                let replyText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂    𝙼 𝙳 ⚡\n\n`;
                replyText += `❖──────────【 𝚆𝙾𝚁𝙳  𝚂𝙴𝙰𝚁𝙲𝙷 】──────────❖\n`;
                replyText += `│ 🎉 𝙶𝚛𝚎𝚊𝚝  𝙹𝚘𝚋  ${displayName}! (@${senderNum}) 🎯 +𝟸𝟶  𝙿𝚘𝚒𝚗𝚝𝚜!\n`;
                replyText += `│ 📌 𝙵𝚘𝚞𝚗𝚍  𝚆𝚘𝚛𝚍 : ${userGuess}\n`;
                replyText += `❖─────────────────────────────❖\n\n`;
                replyText += `📋 𝚄𝙿𝙳𝙰𝚃𝙴𝙳  𝚆𝙾𝚁𝙳  𝙻𝙸𝚂𝚃:\n${updatedWordList}\n\n`;
                replyText += `📊 𝙿𝚛𝚘𝚐𝚛𝚎𝚜𝚜 : ${game.found.length} / ${game.words.length} 𝚆𝚘𝚛𝚍𝚜  𝙵𝚘𝚞𝚗𝚍\n\n`;
                replyText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

                if (game.found.length === game.words.length) {
                    clearTimeout(game.timer);
                    replyText += `\n\n❖──────────【 𝙶𝙰𝙼𝙴  𝙾𝚅𝙴𝚁 】──────────❖\n`;
                    let topUser = null, topScore = -1;
                    for (const [user, score] of Object.entries(game.scores)) {
                        if (score > topScore) { topScore = score; topUser = user; }
                    }
                    const winnerNum = topUser ? topUser.split('@')[0] : '𝙽𝚘𝚗𝚎';
                    replyText += `│ 🏆 𝚆𝙸𝙽𝙽𝙴𝚁 : @${winnerNum} 𝚠𝚒𝚝𝚑  ${topScore}  𝙿𝙾𝙸𝙽𝚃𝚂!\n`;
                    replyText += `❖─────────────────────────────❖\n\n└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
                    delete global.wsgGames[from];
                    await sock.sendMessage(from, { image: updatedImageBuffer, caption: replyText, mentions: [sender, topUser].filter(Boolean) }, { quoted: msg });
                    return;
                } else {
                    await sock.sendMessage(from, { image: updatedImageBuffer, caption: replyText, mentions: [sender] }, { quoted: msg });
                    return;
                }
            }
        }

        const prefix = config.prefix || '#';
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const context = { from, isGroup, sender, pushName: msg.pushName || 'User', commands, sessionName, isAdmin, isBotAdmin };

        // --- SUB-COMMAND ROUTING FOR GAMES ---
        if (cmdName === 'claim') {
            await handleClaim(sock, msg, args, context);
            return;
        }

        if (['ucstart', 'clue', 'vote', 'guess'].includes(cmdName)) {
            await handleUndercoverCommands(sock, msg, args, context, cmdName);
            return;
        }

        const targetName = commands.has(cmdName) ? cmdName : aliases.get(cmdName);
        const command = commands.get(targetName);

        if (!command) {
            console.log(`⚠️ Command not found: ${cmdName}`);
            return;
        }

        console.log(`⚙️ [EXECUTING]: ${prefix}${cmdName}`);

        const allowed = await checkPermissions(sock, msg, command, context);
        if (!allowed) {
            console.log(`🛑 Permission denied for: ${prefix}${cmdName}`);
            return;
        }

        try {
            await command.execute(sock, msg, args, context);
            const autoEmojiEnabled = settings.autoEmoji !== false && config.autoEmoji !== false;
            if (autoEmojiEnabled && isOwnerOrSudo) {
                const randomEmoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
                await sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } }).catch(() => {});
            }
        } catch (err) {
            console.error(`❌ [${sessionName}] Execution error [${prefix}${cmdName}]:`, err);
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    });
};

global.startBot = startBot;

const startAllSessions = async () => {
    await loadCommands();
    const sessionList = Array.isArray(config.sessions) && config.sessions.length
        ? config.sessions
        : [{ name: 'default', number: config.ownerNumber?.[0] }];
    for (const sessionEntry of sessionList) {
        startBot(sessionEntry);
    }
};

// Only auto-start when index.js is run directly (e.g. `node index.js` or via pm2).
if (import.meta.url === `file://${process.argv[1]}`) {
    startAllSessions();
}
