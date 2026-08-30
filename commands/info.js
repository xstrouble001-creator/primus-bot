import config from '../config.js';

export default {
    name: 'info',
    description: 'Displays system specifications and core status',
    category: 'general',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        
        const infoText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
            `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝚂𝙿𝙴𝙲𝚂 】──────────❖\n` +
            `│ 🤖 𝙸𝚍𝚎𝚗𝚝𝚒𝚝𝚢  : ${config.botName}\n` +
            `│ ⚡ 𝙿𝚛𝚎𝚏𝚒𝚡    : [ ${config.prefix} ]\n` +
            `│ 📦 𝙰𝚛𝚌𝚑      : Baileys MD [Modular]\n` +
            `│ 🟢 𝚁𝚞𝚗𝚝𝚒𝚖𝚎   : Node.js ${process.version}\n` +
            `│ 🌐 𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖  : Unknown\n` +
            `│ 🛡️ 𝚂𝚎𝚌𝚞𝚛𝚒𝚝𝚢  : Encrypted E2E\n` +
            `❖─────────────────────────────❖\n\n` +
            `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: infoText }, { quoted: msg });
    }
};
