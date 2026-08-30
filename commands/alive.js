import config from '../config.js';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'alive',
    aliases: ['runtime'],
    description: 'Displays core engine health status and active runtime',
    category: 'general',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        // Start the loading animation first
        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        const aliveText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
            `❖──────────【 𝙲𝙾𝚁𝙴  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
            `│ 🟢 𝚂𝚢𝚜𝚝𝚎𝚖  : 𝙾𝙿𝙴𝚁𝙰𝚃𝙸𝙾𝙽𝙰𝙻\n` +
            `│ ⚙️ 𝙴𝚗𝚐𝚒𝚗𝚎  : 𝙱𝚊𝚒𝚕𝚎𝚢𝚜 𝙼𝙳\n` +
            `│ ⚡ 𝙿𝚛𝚎𝚏𝚒𝚡  : [ ${config.prefix} ]\n` +
            `❖─────────────────────────────❖\n\n` +
            `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        // Replace the finished 100% loader message with the alive status
        await sock.sendMessage(from, { text: aliveText, edit: loaderKey });
    }
};
