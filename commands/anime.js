import axios from 'axios';

export default {
    name: 'anime',
    aliases: ['searchanime', 'mal'],
    description: 'Search for anime information',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, {
                text: `⚠️ Please provide an anime title to search.\n\nExample: *#anime Naruto Shippuden*`
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, {
            text: `🔍 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝙰𝙽𝙸𝙼𝙴  𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴...`
        }, { quoted: msg });

        try {
            let animeData = null;

            // 1. Try Primary Source: Kitsu API
            try {
                const kitsuRes = await axios.get(
                    `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=1`,
                    { timeout: 7000 }
                );
                const item = kitsuRes.data?.data?.[0];

                if (item) {
                    const attr = item.attributes || {};
                    animeData = {
                        title: attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || 'N/A',
                        japaneseTitle: attr.titles?.ja_jp || attr.titles?.en_jp || 'N/A',
                        type: attr.subtype ? attr.subtype.toUpperCase() : 'N/A',
                        episodes: attr.episodeCount || 'Unknown',
                        status: attr.status ? attr.status.charAt(0).toUpperCase() + attr.status.slice(1) : 'N/A',
                        score: attr.averageRating ? `${(parseFloat(attr.averageRating) / 10).toFixed(1)} / 10` : 'N/A',
                        rating: attr.ageRatingGuide || attr.ageRating || 'N/A',
                        genres: 'N/A',
                        synopsis: attr.synopsis
                            ? (attr.synopsis.length > 400 ? attr.synopsis.slice(0, 400) + '...' : attr.synopsis)
                            : 'No description available.',
                        image: attr.posterImage?.large || attr.posterImage?.original || attr.posterImage?.medium
                    };
                }
            } catch (kitsuErr) {
                console.warn('⚠️ [KITSU API FAIL, FALLING BACK TO JIKAN]:', kitsuErr.message);
            }

            // 2. Fallback Source: Jikan (MyAnimeList API)
            if (!animeData) {
                const jikanRes = await axios.get(
                    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`,
                    { timeout: 8000 }
                );
                const anime = jikanRes.data?.data?.[0];

                if (anime) {
                    animeData = {
                        title: anime.title_english || anime.title || 'N/A',
                        japaneseTitle: anime.title_japanese || 'N/A',
                        type: anime.type || 'N/A',
                        episodes: anime.episodes || 'Unknown',
                        status: anime.status || 'N/A',
                        score: anime.score ? `${anime.score} / 10` : 'N/A',
                        rating: anime.rating || 'N/A',
                        genres: anime.genres?.map(g => g.name).join(', ') || 'N/A',
                        synopsis: anime.synopsis
                            ? (anime.synopsis.length > 400 ? anime.synopsis.slice(0, 400) + '...' : anime.synopsis)
                            : 'No description available.',
                        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url
                    };
                }
            }

            if (!animeData) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No anime found matching "${query}".` }, { quoted: msg });
            }

            const animeText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙰 𝙽 𝙸 𝙼 𝙴 ⚡\n\n` +
                              `❖──────────【 𝙰𝙽𝙸𝙼𝙴  𝙸𝙽𝙵𝙾 】──────────❖\n` +
                              `│ 📺 𝚃𝚒𝚝𝚕𝚎       : ${animeData.title}\n` +
                              `│ 🎌 𝙹𝚊𝚙𝚊𝚗𝚎𝚜𝚎    : ${animeData.japaneseTitle}\n` +
                              `│ 🎬 𝚃𝚢𝚙𝚎        : ${animeData.type}\n` +
                              `│ 🎞️ 𝙴𝚙𝚒𝚜𝚘𝚍𝚎𝚜    : ${animeData.episodes}\n` +
                              `│ 📡 𝚂𝚝𝚊𝚝𝚞𝚜      : ${animeData.status}\n` +
                              `│ ⭐ 𝚂𝚌𝚘𝚛𝚎       : ${animeData.score}\n` +
                              `│ 🔞 𝚁𝚊𝚝𝚒𝚗𝚐      : ${animeData.rating}\n` +
                              `│ 🎭 𝙶𝚎𝚗𝚛𝚎𝚜      : ${animeData.genres}\n` +
                              `❖─────────────────────────────❖\n\n` +
                              `📝 𝚂𝚢𝚗𝚘𝚙𝚜𝚒𝚜 :\n${animeData.synopsis}\n\n` +
                              `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});

            if (animeData.image) {
                await sock.sendMessage(from, { image: { url: animeData.image }, caption: animeText }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: animeText }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [ANIME COMMAND ERROR]:', err);
            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, {
                text: `❌ Anime Search Error: ${err.message || 'Failed to fetch anime data.'}`
            }, { quoted: msg });
        }
    }
};
