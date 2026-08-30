import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'reels',
    aliases: ['reel', 'tiktokreel'],
    description: 'Fetch trending short video reels by genre or topic',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        if (!args.length) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚛𝚎𝚎𝚕𝚜 <𝚐𝚎𝚗𝚛𝚎/𝚝𝚘𝚙𝚒𝚌>\n💡 𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚛𝚎𝚎𝚕𝚜 𝚊𝚗𝚒𝚖𝚎` 
            }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        const query = args.join(' ');

        try {
            const apiRes = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(query)}`).catch(() => null);
            
            // Fallback public search endpoint for videos
            const searchUrl = `https://cors-proxy.elfsight.com/https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=5`;
            const res = await axios.get(searchUrl);
            const videoData = res.data?.data?.videos?.[0] || res.data?.data?.[0];

            if (!videoData) {
                await sock.sendMessage(from, { delete: loaderKey });
                return sock.sendMessage(from, { text: `❌ 𝙽𝚘 𝚛𝚎𝚎𝚕𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 "${query}".` }, { quoted: msg });
            }

            const playUrl = videoData.play || videoData.wmplay;
            const videoBuffer = await axios.get(playUrl, { responseType: 'arraybuffer' });

            let captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            captionText += `❖──────────【 𝚃𝙸𝙺𝚃𝙾𝙺  𝚁𝙴𝙴𝙻 】──────────❖\n`;
            captionText += `│ 📌 𝚃𝚘𝚙𝚒𝚌   : ${query.toUpperCase()}\n`;
            captionText += `│ 👤 𝙰𝚞𝚝𝚑𝚘𝚛  : @${videoData.author?.unique_id || 'unknown'}\n`;
            captionText += `│ 📝 𝚃𝚒𝚝𝚕𝚎   : ${videoData.title || 'No Title'}\n`;
            captionText += `❖─────────────────────────────❖\n\n`;
            captionText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { 
                video: Buffer.from(videoBuffer.data), 
                mimetype: 'video/mp4',
                caption: captionText 
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ Reels Command Error:', err);
            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text: `❌ 𝙴𝚛𝚛𝚘𝚛: 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑/𝚙𝚕𝚊𝚢 𝚛𝚎𝚎𝚕.` }, { quoted: msg });
        }
    }
};
