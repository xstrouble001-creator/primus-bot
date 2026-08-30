export default {
    name: 'ping',
    description: 'Check bot response speed and network latency',
    category: 'general',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const start = Date.now();
        
        // Initializing ping probe
        const sent = await sock.sendMessage(from, { 
            text: `📡 𝙸𝙽𝙸𝚃𝙸𝙰𝚃𝙸𝙽𝙶  𝙿𝙸𝙽𝙶  𝙿𝚁𝙾𝙱𝙴...` 
        }, { quoted: msg });

        const latency = Date.now() - start;

        const pingText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
            `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝚂𝙿𝙴𝙴𝙳 】──────────❖\n` +
            `│ 🛰️ 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎  𝙻𝚊𝚝𝚎𝚗𝚌𝚢 : ${latency}𝚖𝚜\n` +
            `│ 🌐 𝙽𝚎𝚝𝚠𝚘𝚛𝚔  𝚂𝚝𝚊𝚝𝚞𝚜  : 𝙾𝙽𝙻𝙸𝙽𝙴 [100%]\n` +
            `│ ⚙️ 𝙲𝚘𝚛𝚎  𝙴𝚗𝚐𝚒𝚗𝚎    : 𝙱𝚊𝚒𝚕𝚎𝚢𝚜 𝙼𝙳\n` +
            `❖─────────────────────────────❖\n\n` +
            `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: pingText, edit: sent.key });
    }
};
