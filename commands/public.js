import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'public',
    description: 'Make the bot accessible to everyone (default mode)',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwnerOrSudo } = context;
        if (!isOwnerOrSudo) {
            return await sock.sendMessage(from, { text: '❌ This command is restricted to the bot owner/dev/sudo.' }, { quoted: msg });
        }

        const settings = loadSettings() || {};
        settings.workMode = 'public';
        saveSettings(settings);

        await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙱𝙾𝚃  𝙼𝙾𝙳𝙴 】──────────❖\n` +
`│ 🌐 𝙼𝚘𝚍𝚎        : 𝙿𝚄𝙱𝙻𝙸𝙲\n` +
`│ 👥 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝙴𝚟𝚎𝚛𝚢𝚘𝚗𝚎\n` +
`│ ⚡ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙰𝚌𝚝𝚒𝚟𝚎\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙱𝚘𝚝 𝚖𝚘𝚍𝚎 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚜𝚠𝚒𝚝𝚌𝚑𝚎𝚍 𝚝𝚘 *𝙿𝚞𝚋𝚕𝚒𝚌*.\n` +
`🌐 𝙴𝚟𝚎𝚛𝚢𝚘𝚗𝚎 𝚌𝚊𝚗 𝚗𝚘𝚠 𝚛𝚞𝚗\n` +
`   𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚠𝚒𝚝𝚑𝚘𝚞𝚝 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚒𝚘𝚗.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
