export default {
    name: 'betatest',
    description: 'Sample beta command — dev access only.',
    category: 'alpha',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        await sock.sendMessage(from, {
            text:
                `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙱 𝙴 𝚃 𝙰 ⚡\n\n` +
                `❖──────────【 🧪 𝙱𝙴𝚃𝙰 𝚃𝙴𝚂𝚃 】──────────❖\n` +
                `│\n` +
                `│ ✅ 𝙰𝙲𝙲𝙴𝚂𝚂    : 𝙶𝚁𝙰𝙽𝚃𝙴𝙳\n` +
                `│ 🔬 𝚂𝚃𝙰𝚃𝚄𝚂   : 𝙱𝙴𝚃𝙰 𝙴𝙽𝚅𝙸𝚁𝙾𝙽𝙼𝙴𝙽𝚃\n` +
                `│ 👨‍💻 𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴 : 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 𝙻𝙴𝚅𝙴𝙻\n` +
                `│\n` +
                `│ 𝙱𝚎𝚝𝚊 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢.\n` +
                `│ 𝙰𝚍𝚍 𝚢𝚘𝚞𝚛 𝚕𝚘𝚐𝚒𝚌 𝚒𝚗𝚜𝚒𝚍𝚎 𝚎𝚡𝚎𝚌𝚞𝚝𝚎().\n` +
                `│\n` +
                `❖─────────────────────────────❖\n\n` +
                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
        }, { quoted: msg });
    }
};
