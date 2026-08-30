import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'shazam',
    aliases: ['findsong', 'songsearch'],
    description: 'Search songs based on a query or lyrics snippet',
    category: 'music',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        if (!args.length) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚜𝚑𝚊𝚣𝚊𝚖 <𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎, 𝚊𝚛𝚝𝚒𝚜𝚝, 𝚘𝚛 𝚕𝚢𝚛𝚒𝚌𝚜>` 
            }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        const query = args.join(' ');

        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
            const res = await axios.get(url);
            const tracks = res.data?.results;

            if (!tracks || tracks.length === 0) {
                await sock.sendMessage(from, { delete: loaderKey });
                return sock.sendMessage(from, { 
                    text: `❌ 𝙽𝚘 𝚜𝚘𝚗𝚐𝚜 𝚏𝚘𝚞𝚗𝚍 𝚖𝚊𝚝𝚌𝚑𝚒𝚗𝚐 "${query}".` 
                }, { quoted: msg });
            }

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 𝚂 𝙷 𝙰  frame 𝙰 𝙼 】──────────❖\n`;
            text += `│ 🔍 𝚀𝚞𝚎𝚛𝚢: ${query}\n`;
            text += `❖─────────────────────────────❖\n\n`;

            tracks.forEach((track, index) => {
                text += `│ ${index + 1}. 🎵 *${track.trackName}*\n`;
                text += `│    👤 𝙰𝚛𝚝𝚒𝚜𝚝 : ${track.artistName}\n`;
                text += `│    💿 𝙰𝚕𝚋𝚞𝚖  : ${track.collectionName || 'N/A'}\n`;
                text += `│    📅 𝚁𝚎𝚕𝚎𝚊𝚜𝚎 : ${track.releaseDate ? track.releaseDate.split('-')[0] : 'N/A'}\n`;
                text += `│\n`;
            });

            text += `❖─────────────────────────────❖\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text }, { quoted: msg });

        } catch (err) {
            console.error('❌ Shazam Command Error:', err);
            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text: `❌ 𝙴𝚛𝚛𝚘𝚛: 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚊𝚛𝚌𝚑 𝚏𝚘𝚛 𝚜𝚘𝚗𝚐𝚜.` }, { quoted: msg });
        }
    }
};
