import axios from 'axios';

export default {
    name: 'character',
    aliases: ['anichar', 'char'],
    description: 'Search for anime character profile and details',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a character name.\n\nExample: *#character Kakashi Hatake*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🔍 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁  𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴...` 
        }, { quoted: msg });

        try {
            const res = await axios.get(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1`);
            const char = res.data?.data?.[0];

            if (!char) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No character found matching "${query}".` }, { quoted: msg });
            }

            const name = char.name || 'N/A';
            const kanjiName = char.name_kanji || 'N/A';
            const nicknames = char.nicknames?.length > 0 ? char.nicknames.join(', ') : 'None';
            const favorites = char.favorites || 0;
            const about = char.about 
                ? (char.about.length > 400 ? char.about.slice(0, 400) + '...' : char.about) 
                : 'No biography available.';
            const image = char.images?.jpg?.image_url;

            const charText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙲 𝙷 𝙰 𝚁 𝙰 𝙲 𝚃 𝙴 𝚁 ⚡\n\n` +
                             `❖──────────【 𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁  𝙸𝙽𝙵𝙾 】──────────❖\n` +
                             `│ 👤 𝙽𝚊𝚖𝚎        : ${name}\n` +
                             `│ 🎌 𝙺𝚊𝚗𝚓𝚒       : ${kanjiName}\n` +
                             `│ 🏷️ 𝙽𝚒𝚌𝚔𝚗𝚊𝚖𝚎𝚜   : ${nicknames}\n` +
                             `│ ❤️ 𝙵𝚊𝚟𝚘𝚛𝚒𝚝𝚎𝚜   : ${favorites.toLocaleString()}\n` +
                             `❖─────────────────────────────❖\n\n` +
                             `📝 𝙱𝚒𝚘𝚐𝚛𝚊𝚙𝚑𝚢 :\n${about}\n\n` +
                             `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});

            if (image) {
                await sock.sendMessage(from, { image: { url: image }, caption: charText }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: charText }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [CHARACTER COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Character Search Error: ${err.message || 'Failed to fetch character data.'}` 
            }, { quoted: msg });
        }
    }
};
