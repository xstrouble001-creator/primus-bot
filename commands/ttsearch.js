import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'ttsearch',
    aliases: ['tiktoksearch', 'tts'],
    description: 'Search and download TikTok videos by query',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        if (!args.length) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚝𝚝𝚜𝚎𝚊𝚛𝚌𝚑 <𝚀𝚞𝚎𝚛𝚢/𝙺𝚎𝚢𝚠𝚘𝚛𝚍>` 
            }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        const query = args.join(' ');

        try {
            const searchUrl = `https://cors-proxy.elfsight.com/https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=1`;
            const res = await axios.get(searchUrl);
            const videoData = res.data?.data?.videos?.[0];

            if (!videoData) {
                await sock.sendMessage(from, { delete: loaderKey });
                return sock.sendMessage(from, { text: `❌ 𝙽𝚘 𝚃𝚒𝚔𝚃𝚘𝚔 𝚟𝚒𝚍𝚎𝚘𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 "${query}".` }, { quoted: msg });
            }

            const playUrl = `https://tikwm.com${videoData.play}`;
            const videoBuffer = await axios.get(playUrl, { responseType: 'arraybuffer' });

            let captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            captionText += `❖──────────【 𝚃𝙸𝙺𝚃𝙾𝙺  𝚂𝙴𝙰𝚁𝙲𝙷 】──────────❖\n`;
            captionText += `│ 🔍 𝚀𝚞𝚎𝚛𝚢   : ${query}\n`;
            captionText += `│ 👤 𝙰𝚞𝚝𝚑𝚘𝚛  : ${videoData.author?.nickname || videoData.author?.unique_id}\n`;
            captionText += `│ 💬 𝚃𝚒𝚝𝚕𝚎   : ${videoData.title}\n`;
            captionText += `│ 👁️ 𝚅𝚒𝚎𝚠𝚜   : ${videoData.play_count || 0}\n`;
            captionText += `│ ❤️ 𝙻𝚒𝚔𝚎𝚜   : ${videoData.digg_count || 0}\n`;
            captionText += `❖─────────────────────────────❖\n\n`;
            captionText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { 
                video: Buffer.from(videoBuffer.data), 
                mimetype: 'video/mp4',
                caption: captionText 
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ TT Search Command Error:', err);
            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text: `❌ 𝙴𝚛𝚛𝚘𝚛: 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑 𝚃𝚒𝚔𝚃𝚘𝚔 𝚟𝚒𝚍𝚎𝚘.` }, { quoted: msg });
        }
    }
};
