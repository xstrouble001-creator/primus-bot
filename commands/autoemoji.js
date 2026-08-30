import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'autoemoji',
    aliases: ['autoreact', 'react'],
    description: 'Toggle auto emoji reaction for messages',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const opt = args[0] ? args[0].toLowerCase() : '';

        let settings = loadSettings() || {};

        if (opt === 'on' || opt === 'enable') {
            settings.autoEmoji = true;
            saveSettings(settings);
            return await sock.sendMessage(from, { text: '⚡ *Auto Emoji Reactions enabled!*' }, { quoted: msg });
        } else if (opt === 'off' || opt === 'disable') {
            settings.autoEmoji = false;
            saveSettings(settings);
            return await sock.sendMessage(from, { text: '⚡ *Auto Emoji Reactions disabled!*' }, { quoted: msg });
        } else {
            const status = settings.autoEmoji ? 'ON' : 'OFF';
            return await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙰𝚄𝚃𝙾 𝙴𝙼𝙾𝙹𝙸 】──────────❖\n` +
`│ ⚡ 𝚂𝚝𝚊𝚝𝚞𝚜      : [ ${status} ]\n` +
`│ 🎭 𝙼𝚘𝚍𝚎        : 𝙰𝚞𝚝𝚘 𝚁𝚎𝚊𝚌𝚝𝚒𝚘𝚗\n` +
`│ 🤖 𝚂𝚢𝚜𝚝𝚎𝚖      : 𝙰𝚌𝚝𝚒𝚟𝚎\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ .autoemoji on\n` +
`➤ .autoemoji off\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
        }
    }
};
