import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

export default {
    name: 'cyberflip',
    aliases: ['coinflip', 'flip'],
    category: 'fun',
    description: 'Flips a cybernetic coin (Heads or Tails).\nUsage: .cyberflip',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        
        const outcomes = ['Heads 🪙', 'Tails 🪙'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙲𝚈𝙱𝙴𝚁𝙵𝙻𝙸𝙿 ⚡\n\n`;
        text += `❖──────────【 𝚁𝙴𝚂𝚄𝙻𝚃 】──────────❖\n`;
        text += `│ 🪙 Coin Result: *${result}*\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
