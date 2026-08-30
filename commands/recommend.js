import { sendAnimatedLoader } from '../lib/animator.js';
import { fetchMovie, getRottenTomatoes } from '../lib/omdb.js';
import { genres, getRandomTitle } from '../lib/movieList.js';

export default {
    name: 'recommend',
    aliases: ['suggestmovie'],
    description: `Get a random movie recommendation, optionally by genre.\nUsage: .recommend [${genres.join('|')}]`,
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const genre = args[0]?.toLowerCase();

        if (genre && !genres.includes(genre)) {
            return await sock.sendMessage(from, { text: `⚡ [SYNTAX ERROR] Unknown genre.\nAvailable: ${genres.join(', ')}` }, { quoted: msg });
        }

        await sendAnimatedLoader(sock, from, msg);

        try {
            const title = getRandomTitle(genre);
            const movie = await fetchMovie(title);

            if (!movie) {
                return await sock.sendMessage(from, { text: '❌ [SYSTEM ERROR] Could not fetch a recommendation right now, try again.' }, { quoted: msg });
            }

            const caption = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚁 𝙴 𝙲 𝙾 𝙼 𝙼 𝙴 𝙽 𝙳 ⚡\n\n` +
                `❖──────────【 ${genre ? genre.toUpperCase() : 'RANDOM PICK'} 】──────────❖\n│\n` +
                `│ 🎬 𝚃𝚒𝚝𝚕𝚎     : ${movie.Title} (${movie.Year})\n` +
                `│ ⭐ 𝙸𝙼𝙳𝙱      : ${movie.imdbRating}/10\n` +
                `│ 🍅 𝚁𝚘𝚝𝚝𝚎𝚗 𝚃  : ${getRottenTomatoes(movie)}\n` +
                `│ 🎭 𝙶𝚎𝚗𝚛𝚎     : ${movie.Genre}\n│\n` +
                `│ 📜 ${movie.Plot}\n│\n` +
                `❖─────────────────────────────❖\n\n` +
                `💡 _Not feeling it? Run .recommend again for another pick._\n\n` +
                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            if (movie.Poster && movie.Poster !== 'N/A') {
                await sock.sendMessage(from, { image: { url: movie.Poster }, caption }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [RECOMMEND ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
