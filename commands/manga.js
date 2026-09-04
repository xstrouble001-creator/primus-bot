import axios from 'axios';

export default {
    name: 'manga',
    aliases: ['searchmanga', 'mangainfo'],
    description: 'Search for manga information from MyAnimeList',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a manga title to search.\n\nExample: *#manga Berserk*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🔍 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝙼𝙰𝙽𝙶𝙰  𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴...` 
        }, { quoted: msg });

        try {
            const res = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`);
            const manga = res.data?.data?.[0];

            if (!manga) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No manga found matching "${query}".` }, { quoted: msg });
            }

            const title = manga.title_english || manga.title || 'N/A';
            const japaneseTitle = manga.title_japanese || 'N/A';
            const type = manga.type || 'N/A';
            const volumes = manga.volumes || 'Unknown';
            const chapters = manga.chapters || 'Unknown';
            const status = manga.status || 'N/A';
            const score = manga.score ? `${manga.score} / 10` : 'N/A';
            const genres = manga.genres?.map(g => g.name).join(', ') || 'N/A';
            const synopsis = manga.synopsis 
                ? (manga.synopsis.length > 400 ? manga.synopsis.slice(0, 400) + '...' : manga.synopsis) 
                : 'No description available.';
            const image = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;

            const mangaText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙼 𝙰 𝙽 𝙶 𝙰 ⚡\n\n` +
                              `❖──────────【 𝙼𝙰𝙽𝙶𝙰  𝙸𝙽𝙵𝙾 】──────────❖\n` +
                              `│ 📚 𝚃𝚒𝚝𝚕𝚎       : ${title}\n` +
                              `│ 🎌 𝙹𝚊𝚙𝚊𝚗𝚎𝚜𝚎    : ${japaneseTitle}\n` +
                              `│ 📖 𝚃𝚢𝚙𝚎        : ${type}\n` +
                              `│ 📑 𝚅𝚘𝚕𝚞𝚖𝚎𝚜     : ${volumes}\n` +
                              `│ 📄 𝙲𝚑𝚊𝚙𝚝𝚎𝚛𝚜    : ${chapters}\n` +
                              `│ 📡 𝚂𝚝𝚊𝚝𝚞𝚜      : ${status}\n` +
                              `│ ⭐ 𝚂𝚌𝚘𝚛𝚎       : ${score}\n` +
                              `│ 🎭 𝙶𝚎𝚗𝚛𝚎𝚜      : ${genres}\n` +
                              `❖─────────────────────────────❖\n\n` +
                              `📝 𝚂𝚢𝚗𝚘𝚙𝚜𝚒𝚜 :\n${synopsis}\n\n` +
                              `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});

            if (image) {
                await sock.sendMessage(from, { image: { url: image }, caption: mangaText }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: mangaText }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [MANGA COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Manga Search Error: ${err.message || 'Failed to fetch manga data.'}` 
            }, { quoted: msg });
        }
    }
};
