import os from 'os';

export default {
    name: 'status',
    aliases: ['botstatus', 'system'],
    description: 'Check system runtime and memory usage',
    category: 'general',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const uptimeSec = Math.floor(process.uptime());
        const hours = Math.floor(uptimeSec / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const seconds = uptimeSec % 60;
        const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
        const usedMem = totalMem - freeMem;

        const statusText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
                           `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
                           `│ ⏱️ 𝚄𝚙𝚝𝚒𝚖𝚎       : ${uptimeStr}\n` +
                           `│ 🧠 𝚁𝙰𝙼  𝚄𝚜𝚊𝚐𝚎   : ${usedMem}𝙼𝙱 / ${totalMem}𝙼𝙱\n` +
                           `│ 💻 𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖    : ${os.platform()} (${os.arch()})\n` +
                           `│ ⚙️ 𝙽𝚘𝚍𝚎   Engine : ${process.version}\n` +
                           `❖─────────────────────────────❖\n\n` +
                           `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: statusText }, { quoted: msg });
    }
};
