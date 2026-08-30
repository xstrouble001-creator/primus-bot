import { sendAnimatedLoader } from '../lib/animator.js';
import { fetchMovie } from '../lib/omdb.js';
import { movieLists, genres } from '../lib/movieList.js';

export default {
    name: 'top10',
    aliases: ['top'],
    description: `Get a top 10 curated movie list by genre.\nUsage: .top10 <${genres.join('|')}>`,
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const genre = args[0]?.toLowerCase();

        if (!genre || !movieLists[genre]) {
            return await sock.sendMessage(from, { text: `⚡ [SYNTAX ERROR] Usage: .top10 <genre>\nAvailable: ${genres.join(', ')}` }, { quoted: msg });
        }

        await sendAnimatedLoader(sock, from, msg);

        try {
            const titles = movieLists[genre];
            const results = await Promise.all(
                titles.map((t) => fetchMovie(t).catch(() => null))
            );

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚃 𝙾 𝙿 𝟷 𝟶 ⚡\n\n`;
            text += `❖──────────【 ${genre.toUpperCase()} 】──────────❖\n│\n`;

            results.forEach((movie, i) => {
                if (!movie) return;
                text += `│ ${i + 1}. ${movie.Title} (${movie.Year}) — ⭐ ${movie.imdbRating}\n`;
            });

            text += `│\n❖─────────────────────────────❖\n\n`;
            text += `💡 _Run .movie <title> for full details on any of these_\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text }, { quoted: msg });
        } catch (err) {
            console.error('❌ [TOP10 ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
