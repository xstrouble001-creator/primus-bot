import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'setowner',
category: 'alpha',
    description: 'Add a new owner by phone number',
    ownerOnly: true,
    execute: async (sock, msg, args, context) => {
        const target = args[0]?.replace(/[^0-9]/g, '');
        if (!target) {
            await sock.sendMessage(context.from, { text: '❌ Please provide a phone number.\nExample: `.setowner 2348039336009`' }, { quoted: msg });
            return;
        }

        const settings = loadSettings() || { owners: [], sudo: [] };
        if (!settings.owners) settings.owners = [];

        if (settings.owners.includes(target)) {
            await sock.sendMessage(context.from, { text: `⚠️ The number +${target} is already an owner.` }, { quoted: msg });
            return;
        }

        settings.owners.push(target);
        saveSettings(settings);

        await sock.sendMessage(context.from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙾𝚆𝙽𝙴𝚁  𝙰𝙳𝙳𝙴𝙳 】──────────❖\n` +
`│ ✅ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝚂𝚄𝙲𝙲𝙴𝚂𝚂\n` +
`│ 👤 𝚃𝚊𝚛𝚐𝚎𝚝      : +${target}\n` +
`│ 👑 𝚁𝚘𝚕𝚎        : 𝙱𝚘𝚝 𝙾𝚠𝚗𝚎𝚛\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙾𝚠𝚗𝚎𝚛 𝚙𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚜 𝚑𝚊𝚟𝚎 𝚋𝚎𝚎𝚗 𝚐𝚛𝚊𝚗𝚝𝚎𝚍.\n` +
`✅ +${target} 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗\n` +
`   𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚊𝚍𝚍𝚎𝚍 𝚊𝚜 𝚊 𝙱𝚘𝚝 𝙾𝚠𝚗𝚎𝚛.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
