import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

export default {
    name: 'roll',
    category: 'fun',
    description: 'Rolls a randomized die (1-6 or custom max number).\nUsage: .roll [max_number]',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        
        let max = 6;
        if (args[0] && !isNaN(args[0])) {
            max = parseInt(args[0]);
        }
        const result = Math.floor(Math.random() * max) + 1;

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙳 𝙸 𝙴  𝚁 𝙾 𝙻 𝙻 ⚡\n\n`;
        text += `❖──────────【 𝚁𝙴𝚂𝚄𝙻𝚃 】──────────❖\n`;
        text += `│ 🎲 Range: 1 to ${max}\n`;
        text += `│ 🎯 Rolled: *${result}*\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
