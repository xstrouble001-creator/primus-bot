import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

export default {
    name: 'meme',
    category: 'fun',
    description: 'Fetches a random viral internet meme.\nUsage: .meme',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        try {
            const res = await axios.get('https://meme-api.com/gimme');
            const { title, url, author, subreddit } = res.data;
            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙼 𝙴 𝙼 𝙴 ⚡\n\n`;
            text += `❖──────────【 𝙸𝙽𝙵𝙾 】──────────❖\n`;
            text += `│ 📌 𝑻𝒊𝒕𝒍𝒆 : ${title}\n`;
            text += `│ 👤 𝑨𝒖𝒕𝒉𝒐𝒓 : ${author}\n`;
            text += `│ 🌐 𝑺𝒐𝒖𝒓𝒄𝒆 : r/${subreddit}\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { image: { url }, caption: text }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ [ERROR]: Could not fetch meme transmission.` }, { quoted: msg });
        }
    }
};
