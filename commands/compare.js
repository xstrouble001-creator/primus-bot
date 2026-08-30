import { sendAnimatedLoader } from '../lib/animator.js';
import { fetchMovie, getRottenTomatoes } from '../lib/omdb.js';

export default {
    name: 'compare',
    aliases: ['vsmovie'],
    description: 'Compare two movies side by side.\nUsage: .compare <title1> vs <title2>',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const input = args.join(' ');

        if (!input.includes(' vs ')) {
            return await sock.sendMessage(from, { text: '⚡ [SYNTAX ERROR] Usage: .compare <title1> vs <title2>\nExample: .compare Inception vs Interstellar' }, { quoted: msg });
        }

        const [titleA, titleB] = input.split(' vs ').map((s) => s.trim());

        await sendAnimatedLoader(sock, from, msg);

        try {
            const [movieA, movieB] = await Promise.all([fetchMovie(titleA), fetchMovie(titleB)]);

            if (!movieA || !movieB) {
                const missing = !movieA ? titleA : titleB;
                return await sock.sendMessage(from, { text: `❌ [NOT FOUND] Could not find "${missing}".` }, { quoted: msg });
            }

            const text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙲 𝙾 𝙼 𝙿 𝙰 𝚁 𝙴 ⚡\n\n` +
                `❖──────────【 ${movieA.Title.toUpperCase()} 】──────────❖\n│\n` +
                `│ 📅 𝚈𝚎𝚊𝚛      : ${movieA.Year}\n` +
                `│ ⭐ 𝙸𝙼𝙳𝙱      : ${movieA.imdbRating}/10\n` +
                `│ 🍅 𝚁𝚘𝚝𝚝𝚎𝚗 𝚃  : ${getRottenTomatoes(movieA)}\n` +
                `│ 🎭 𝙶𝚎𝚗𝚛𝚎     : ${movieA.Genre}\n` +
                `│ ⏱️ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎   : ${movieA.Runtime}\n│\n` +
                `❖──────────【 𝚅 𝚂 】──────────❖\n│\n` +
                `❖──────────【 ${movieB.Title.toUpperCase()} 】──────────❖\n│\n` +
                `│ 📅 𝚈𝚎𝚊𝚛      : ${movieB.Year}\n` +
                `│ ⭐ 𝙸𝙼𝙳𝙱      : ${movieB.imdbRating}/10\n` +
                `│ 🍅 𝚁𝚘𝚝𝚝𝚎𝚗 𝚃  : ${getRottenTomatoes(movieB)}\n` +
                `│ 🎭 𝙶𝚎𝚗𝚛𝚎     : ${movieB.Genre}\n` +
                `│ ⏱️ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎   : ${movieB.Runtime}\n│\n` +
                `❖─────────────────────────────❖\n\n` +
                `🏆 𝚆𝚒𝚗𝚗𝚎𝚛 (𝙸𝙼𝙳𝙱) : ${parseFloat(movieA.imdbRating) >= parseFloat(movieB.imdbRating) ? movieA.Title : movieB.Title}\n\n` +
                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text }, { quoted: msg });
        } catch (err) {
            console.error('❌ [COMPARE ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
