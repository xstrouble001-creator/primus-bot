import config from '../config.js';
import { loadSettings } from './database.js';

export const checkPermissions = async (sock, msg, command, context) => {
    try {
        const { sender, isGroup, from, isAdmin, isBotAdmin } = context;
        const senderNum = sender ? sender.split('@')[0].replace(/[^0-9]/g, '') : '';
        const settings = loadSettings() || {};
        const botOwnerJid = sock.user?.id || '';
        const botNumber = botOwnerJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');

        const devNumber = String(config.devNumber || '').replace(/[^0-9]/g, '');
        const isDev = senderNum === devNumber || msg.key.fromMe;

        const rawOwners = [
            botNumber,
            ...(Array.isArray(config.owner) ? config.owner : [config.owner]),
            ...(Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]),
            ...(settings.owners || [])
        ];
        const owners = rawOwners.filter(Boolean).map(num => String(num).split('@')[0].replace(/[^0-9]/g, ''));

        const rawSudo = [...(settings.sudo || []), ...(Array.isArray(config.sudo) ? config.sudo : [])];
        const sudoUsers = rawSudo.filter(Boolean).map(num => String(num).split('@')[0].replace(/[^0-9]/g, ''));
        const isOwnerOrSudo = msg.key.fromMe || owners.includes(senderNum) || sudoUsers.includes(senderNum);

        context.isOwner = msg.key.fromMe || owners.includes(senderNum);
        context.isOwnerOrSudo = isOwnerOrSudo;
        context.isDev = isDev;
        context.owners = owners;

        // --- PRIVATE MODE GATE (bot-wide) ---
        // When workMode is 'private', ONLY owner/dev/sudo can run any command.
        if (settings.workMode === 'private' && !isOwnerOrSudo && !isDev) {
            await sock.sendMessage(from, {
                text: `🔒 The bot is currently in *Private Mode*. Only the owner, dev, and sudo users can run commands right now.`
            }, { quoted: msg });
            return false;
        }

        // --- PER-COMMAND PRIVATE GATE ---
        // A command individually locked via #privatize, regardless of workMode.
        if (Array.isArray(settings.privateCommands) && settings.privateCommands.includes(command.name) && !isOwnerOrSudo && !isDev) {
            await sock.sendMessage(from, {
                text: `🔒 The *${command.name}* command is restricted to owner/dev/sudo only.`
            }, { quoted: msg });
            return false;
        }

        // --- ALPHA (DEV-ONLY) GATE ---
        if (command.category === 'domain expansion' && !isDev) {
            await sock.sendMessage(from, {
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙰 𝙲 𝙲 𝙴 𝚂𝚂  𝙳 𝙴 𝙽 𝙸 𝙴 𝙳 ⚡\n\n` +
                      `❖──────────【 🔒 Alpha 𝚉𝙾𝙽𝙴 】──────────❖\n` +
                      `│\n` +
                      `│ ⛔ 𝙲𝙻𝙰𝚂𝚂𝙸𝙵𝙸𝙲𝙰𝚃𝙸𝙾𝙽 : Alpha / 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙴𝙳\n` +
                      `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂          : 𝚄𝙽𝙰𝚄𝚃𝙷𝙾𝚁𝙸𝙕𝙴𝙳 𝙽𝙾𝙳𝙴\n` +
                      `│ 🔑 𝚁𝙴𝙀𝚄𝙸𝚁𝙴𝙳        : 𝙳𝙴𝚅𝙴𝙻𝙾𝒑𝙴𝚁  𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴\n` +
                      `│\n` +
                      `│ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚒𝚜 𝚒𝚗 𝚊𝚌𝚝𝚒𝚟𝚎 𝚍𝚎𝚟𝚎𝚕𝚘𝒑𝚖𝚎𝚗𝚝\n` +
                      `│ 𝚊𝚗𝚍 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍 𝚝𝚘 𝚊𝚞𝚝𝚑𝚘𝚛𝚒𝚣𝚎𝚍 𝚍𝚎𝚟𝚜 𝚘𝚗𝚕𝚢.\n` +
                      `│\n` +
                      `❖─────────────────────────────❖\n\n` +
                      `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
            return false;
        }

        // --- OWNER / SUDO GATE ---
        if (command.ownerOnly && !isOwnerOrSudo) {
            await sock.sendMessage(from, {
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙰 𝙲 𝙲 𝙴 𝚂 𝚂  𝙳 𝙴 𝙽 𝙸 𝙴 𝙳 ⚡\n\n` +
                      `❖──────────【 🔒 𝙾𝚆𝙽𝙴𝚁 𝙾𝙽𝙻𝚈 】──────────❖\n` +
                      `│\n` +
                      `│ ⛔ 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝚄𝙽𝙰𝚄𝚃𝙷𝙾𝚁𝙸𝙕𝙴𝙳\n` +
                      `│ 🔑 𝙰𝙲𝙲𝙴𝚂𝚂 : 𝙾𝚆𝙽𝙴𝚁 / 𝚂𝚄𝙳𝙾 𝚁𝙴𝑸𝚄𝙸𝚁𝙴𝙳\n` +
                      `│\n` +
                      `❖─────────────────────────────❖\n\n` +
                      `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
            return false;
        }

        // --- GROUP ONLY GATE ---
        if (command.groupOnly && !isGroup) {
            await sock.sendMessage(from, {
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙶 𝚁 𝙾 𝚄 𝙿  𝙾 𝙽 𝙻 𝚈 ⚡\n\n` +
                      `❖──────────【 🔒 𝙶𝚁𝙾𝚄𝙿 𝚉𝙾𝙽𝙴 】──────────❖\n` +
                      `│\n` +
                      `│ ⛔ 𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙶𝚁𝙾𝚄𝙿𝚂 𝙾𝙽𝙻𝚈\n` +
                      `│ 💬 𝚄𝚂𝙴    : 𝚄𝚂𝙴 𝙸𝙽𝚂𝙸𝙳𝙴 𝙰 𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃\n` +
                      `│\n` +
                      `❖─────────────────────────────❖\n\n` +
                      `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
            return false;
        }

        // --- BOT ADMIN GATE ---
        if (command.botAdmin && !isBotAdmin) {
            await sock.sendMessage(from, { text: `⚠️ Please make the bot an admin first!` }, { quoted: msg });
            return false;
        }

        // --- ADMIN ONLY GATE ---
        if (command.adminOnly && !isAdmin) {
            await sock.sendMessage(from, { text: `⚠️ This command is restricted to group admins only!` }, { quoted: msg });
            return false;
        }

        return true;
    } catch (e) {
        console.error('❌ [PERMISSION ERROR]:', e);
        return true;
    }
};
