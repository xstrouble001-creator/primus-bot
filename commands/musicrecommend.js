import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'musicrecommend',
    aliases: ['recommendmusic', 'genre'],
    description: 'Get music recommendations based on a genre',
    category: 'music',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        if (!args.length) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚖𝚞𝚜𝚒𝚌𝚛𝚎𝚌𝚘𝚖𝚖𝚎𝚗𝚍 <𝚐𝚎𝚗𝚛𝚎>\n💡 𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚖𝚞𝚜𝚒𝚌𝚛𝚎𝚌𝚘𝚖𝚖𝚎𝚗𝚍 𝚙𝚑𝚘𝚗𝚔` 
            }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        const genre = args.join(' ');

        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&entity=song&limit=6`;
            const res = await axios.get(url);
            const tracks = res.data?.results;

            if (!tracks || tracks.length === 0) {
                await sock.sendMessage(from, { delete: loaderKey });
                return sock.sendMessage(from, { 
                    text: `❌ 𝙽𝚘 𝚛𝚎𝚌𝚘𝚖𝚖𝚎𝚗𝚍𝚊𝚝𝚒𝚘𝚗𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 "${genre}".` 
                }, { quoted: msg });
            }

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────【 𝙼𝚄𝚂𝙸𝙲  𝚁𝙴𝙲𝙾𝙼𝙼𝙴𝙽𝙳𝙰𝚃𝙸𝙾𝙽𝚂 】──────❖\n`;
            text += `│ 🎧 𝙶𝚎𝚗𝚛𝚎 / 𝚂𝚝𝚢𝚕𝚎: ${genre.toUpperCase()}\n`;
            text += `❖─────────────────────────────❖\n\n`;

            tracks.forEach((track, index) => {
                text += `│ ${index + 1}. 🎶 *${track.trackName}*\n`;
                text += `│    👤 ${track.artistName}\n`;
                text += `│\n`;
            });

            text += `❖─────────────────────────────❖\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text }, { quoted: msg });

        } catch (err) {
            console.error('❌ Music Recommend Error:', err);
            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text: `❌ 𝙴𝚛𝚛𝚘𝚛: 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑 𝚛𝚎𝚌𝚘𝚖𝚖𝚎𝚗𝚍𝚊𝚝𝚒𝚘𝚗𝚜.` }, { quoted: msg });
        }
    }
};
