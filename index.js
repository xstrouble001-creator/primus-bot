import { handlePixelBomb, handleClaim } from "./commands/pixelbomb.js";
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import config from './config.js';
import { handleWSGAnswer } from './commands/wsg.js';
import { checkPermissions } from './lib/handler.js';
import { loadSettings, saveSettings } from './lib/database.js';
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
    const sessionFolder = `sessions_${sessionName}`;

    if (retryCount > 5) {
        console.error(`❌ [${sessionName}] Too many reconnect attempts — stopping.`);
        if (onPairingCode) onPairingCode(null, 'Too many failed connection attempts.');
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        getMessage: async () => ({ conversation: '' })
    });

    const isRegistered = Boolean(state.creds?.registered);
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('group-participants.update', ({ id }) => {
        groupCaches.get(sessionName)?.delete(id);
    });

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (!isRegistered && !sock.authState.creds.registered && !pairingRequested) {
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
            if (statusCode === 428) {
                console.log(`⚠️ [${sessionName}] Connection replaced (Status 428). Cooling down for 10s...`);
                setTimeout(() => startBot(sessionEntry, retryCount + 1, onPairingCode), 10000);
                return;
            }
            const reconnect = statusCode !== DisconnectReason.loggedOut;
            if (reconnect) {
                console.log(`⚠️ [${sessionName}] Connection closed (status ${statusCode}). Reconnecting in 3s...`);
                setTimeout(() => startBot(sessionEntry, retryCount + 1, onPairingCode), 3000);
            } else {
                console.log(`❌ [${sessionName}] Session logged out. Clearing stale session.`);
                fs.rmSync(sessionFolder, { recursive: true, force: true });
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

        // --- PER-USER TIMED MUTE (independent of admin bypass) ---
        if (isGroup && text && settings.mutedUsers?.[from]?.[sender]) {
            const expiresAt = settings.mutedUsers[from][sender];
            if (Date.now() < expiresAt) {
                await sock.sendMessage(from, { delete: msg.key }).catch((e) => console.error('❌ [MUTEUSER DELETE FAILED]', e));
                return;
            } else {
                delete settings.mutedUsers[from][sender];
                saveSettings(settings);
            }
        }

        // --- ANTITAGADMINS: delete messages that mention a group admin, by non-admins ---
        if (isGroup && !isOwnerOrSudo && !isAdmin && settings.antitagAdminsGroups?.includes(from) && text) {
            const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJids.length > 0) {
                try {
                    const groupMetadata = await getGroupMetadata(sessionName, sock, from);
                    const adminJids = groupMetadata.participants
                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                        .map(p => p.id.split(':')[0].split('@')[0]);
                    const taggedAnAdmin = mentionedJids.some(jid => adminJids.includes(jid.split(':')[0].split('@')[0]));
                    if (taggedAnAdmin) {
                        const senderNameForTag = getMentionName(sender) || senderNum;
                        await sock.sendMessage(from, { delete: msg.key }).catch((e) => console.error('❌ [ANTITAGADMINS DELETE FAILED]', e));
                        await sock.sendMessage(from, { text: `⚠️ [ANTITAGADMINS] @${senderNameForTag} tagging admins is not allowed here!`, mentions: [sender] });
                        return;
                    }
                } catch (e) {
                    console.error('❌ [ANTITAGADMINS ERROR]:', e.message);
                }
            }
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
                if (totalMentions >= 3) {
                    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
                    await sock.sendMessage(from, { text: `⚠️ [ANTITAG] @${senderName} mass tagging (4+ users) is forbidden!`, mentions: [sender] });
                    return;
                }
            }
        }


        const wsgHandled = await handleWSGAnswer(sock, msg, { from, isGroup, sender, body: text });
        if (wsgHandled) return;

        const prefix = config.prefix || '#';
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const context = { from, isGroup, sender, pushName: msg.pushName || 'User', commands, sessionName, isAdmin, isBotAdmin, isSudo: isOwnerOrSudo, isOwner: (msg.key.fromMe || owners.includes(senderNum)) };

        // --- SUB-COMMAND ROUTING FOR GAMES ---
        if (cmdName === "pixelbomb" || cmdName === "pb") return await handlePixelBomb(sock, msg, args, context);
        if (cmdName === 'claim') {
            await handleClaim(sock, msg, args, context);
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

if (import.meta.url === `file://${process.argv[1]}`) {
    startAllSessions();
}
