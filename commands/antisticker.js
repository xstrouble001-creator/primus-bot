import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'antisticker',
    aliases: ['nosticker'],
    description: 'Toggle automatic removal of stickers in the group',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from, isGroup, isAdmin, isBotAdmin } = context;

        if (!isGroup) {
            return sock.sendMessage(from, { text: `❌ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜.` }, { quoted: msg });
        }

        if (!isAdmin) {
            return sock.sendMessage(from, { text: `❌ 𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍.` }, { quoted: msg });
        }

        if (!isBotAdmin) {
            return sock.sendMessage(from, { text: `❌ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚖𝚊𝚔𝚎 𝚝𝚑𝚎 𝚋𝚘𝚝 𝚊𝚗 𝚊𝚍𝚖𝚒𝚗 𝚏𝚒𝚛𝚜𝚝.` }, { quoted: msg });
        }

        const option = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(option)) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚊𝚗𝚝𝚒𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚘𝚗 | .𝚊𝚗𝚝𝚒𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚘𝚏𝚏` 
            }, { quoted: msg });
        }

        const settings = loadSettings();
        if (!settings.antistickerGroups) settings.antistickerGroups = [];

        const isEnabled = settings.antistickerGroups.includes(from);

        if (option === 'on') {
            if (isEnabled) {
                return sock.sendMessage(from, { text: `⚠️ 𝙰𝚗𝚝𝚒𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝙴𝙽𝙰𝙱𝙻𝙴𝙳 in this group.` }, { quoted: msg });
            }
            settings.antistickerGroups.push(from);
            saveSettings(settings);

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 𝙰𝙽𝚃𝙸-𝚂𝚃𝙸𝙲𝙺𝙴𝚁 】──────────❖\n`;
            text += `│ 🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜 : 𝙴𝙽𝙰𝙱𝙻𝙴𝙳 [🔒]\n`;
            text += `│ 🚫 𝚂𝚝𝚒𝚌𝚔𝚎𝚛𝚜 𝚠𝚒𝚕𝚕 𝚋𝚎 𝚊𝚞𝚝𝚘-𝚍𝚎𝚕𝚎𝚝𝚎𝚍!\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            return sock.sendMessage(from, { text }, { quoted: msg });

        } else {
            if (!isEnabled) {
                return sock.sendMessage(from, { text: `⚠️ 𝙰𝚗𝚝𝚒𝚜𝚝𝚒𝚌𝚔𝚎𝚛 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳 in this group.` }, { quoted: msg });
            }
            settings.antistickerGroups = settings.antistickerGroups.filter(id => id !== from);
            saveSettings(settings);

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 𝙰𝙽𝚃𝙸-𝚂𝚃𝙸𝙲𝙺𝙴𝚁 】──────────❖\n`;
            text += `│ 🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜 : 𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳 [🔓]\n`;
            text += `│ 🟢 𝚂𝚝𝚒𝚌𝚔𝚎𝚛𝚜 𝚊𝚛𝚎 𝚗𝚘𝚠 𝚊𝚕𝚕𝚘𝚠𝚎𝚍.\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            return sock.sendMessage(from, { text }, { quoted: msg });
        }
    }
};
