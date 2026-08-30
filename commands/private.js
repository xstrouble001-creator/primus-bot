import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'private',
    description: 'Restrict all commands to only the bot owner, dev, and sudo users',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwnerOrSudo } = context;
        if (!isOwnerOrSudo) {
            return await sock.sendMessage(from, { text: '❌ This command is restricted to the bot owner/dev/sudo.' }, { quoted: msg });
        }

        const settings = loadSettings() || {};
        settings.workMode = 'private';
        saveSettings(settings);

        await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙱𝙾𝚃  𝙼𝙾𝙳𝙴 】──────────❖\n` +
`│ 🔒 𝙼𝚘𝚍𝚎        : 𝙿𝚁𝙸𝚅𝙰𝚃𝙴\n` +
`│ 👑 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝙾𝚠𝚗𝚎𝚛 / 𝙳𝚎𝚟 / 𝚂𝚞𝚍𝚘\n` +
`│ 🛡️ 𝙿𝚎𝚛𝚖𝚒𝚜𝚜𝚒𝚘𝚗  : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙱𝚘𝚝 𝚖𝚘𝚍𝚎 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚜𝚠𝚒𝚝𝚌𝚑𝚎𝚍 𝚝𝚘 *𝙿𝚛𝚒𝚟𝚊𝚝𝚎*.\n` +
`⚡ 𝙾𝚗𝚕𝚢 𝚝𝚑𝚎 𝙾𝚠𝚗𝚎𝚛, 𝙳𝚎𝚟, 𝚊𝚗𝚍 𝚂𝚞𝚍𝚘 𝚞𝚜𝚎𝚛𝚜\n` +
`   𝚌𝚊𝚗 𝚗𝚘𝚠 𝚛𝚞𝚗 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
