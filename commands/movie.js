import { sendAnimatedLoader } from '../lib/animator.js';
import { fetchMovie, getRottenTomatoes } from '../lib/omdb.js';

export default {
    name: 'movie',
    aliases: ['film'],
    description: 'Search for a movie and get full details.\nUsage: .movie <title> | <year (optional)>',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const input = args.join(' ');

        if (!input) {
            return await sock.sendMessage(from, { text: '⚡ [SYNTAX ERROR] Usage: .movie <title>\nExample: .movie Inception' }, { quoted: msg });
        }

        await sendAnimatedLoader(sock, from, msg);

        const [title, year] = input.split('|').map((s) => s?.trim());

        try {
            const movie = await fetchMovie(title, year);

            if (!movie) {
                return await sock.sendMessage(from, { text: `❌ [NOT FOUND] No movie matched "${title}".` }, { quoted: msg });
            }

            const caption = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙼 𝙾 𝚅 𝙸 𝙴 ⚡\n\n` +
                `❖──────────【 ${movie.Title.toUpperCase()} 】──────────❖\n│\n` +
                `│ 📅 𝚈𝚎𝚊𝚛      : ${movie.Year}\n` +
                `│ ⭐ 𝙸𝙼𝙳𝙱      : ${movie.imdbRating}/10\n` +
                `│ 🍅 𝚁𝚘𝚝𝚝𝚎𝚗 𝚃  : ${getRottenTomatoes(movie)}\n` +
                `│ 🎭 𝙶𝚎𝚗𝚛𝚎     : ${movie.Genre}\n` +
                `│ ⏱️ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎   : ${movie.Runtime}\n` +
                `│ 🎬 𝙳𝚒𝚛𝚎𝚌𝚝𝚘𝚛   : ${movie.Director}\n` +
                `│ 🎟️ 𝙲𝚊𝚜𝚝      : ${movie.Actors}\n│\n` +
                `│ 📜 𝙿𝚕𝚘𝚝\n│ ${movie.Plot}\n│\n` +
                `❖─────────────────────────────❖\n\n` +
                `💡 _Tip: .trailer ${movie.Title} for the trailer clip_\n\n` +
                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            if (movie.Poster && movie.Poster !== 'N/A') {
                await sock.sendMessage(from, { image: { url: movie.Poster }, caption }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [MOVIE ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
