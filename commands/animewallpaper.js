import axios from 'axios';

export default {
    name: 'animewallpaper',
    aliases: ['awallpaper', 'animewall'],
    description: 'Fetch high quality anime wallpapers',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        const sent = await sock.sendMessage(from, { 
            text: `🖼️ 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝚆𝙰𝙻𝙻𝙿𝙰𝙿𝙴𝚁...` 
        }, { quoted: msg });

        try {
            let imageUrl = null;

            if (query) {
                const searchRes = await axios.get(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=010&purity=100&sorting=random`);
                imageUrl = searchRes.data?.data?.[0]?.path;
            }

            if (!imageUrl) {
                const nekoRes = await axios.get('https://nekos.best/api/v2/neko');
                imageUrl = nekoRes.data?.results?.[0]?.url;
            }

            if (!imageUrl) {
                throw new Error('No wallpaper found.');
            }

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚆 𝙰 𝙻 𝙻 𝙿 𝙰 𝙿 𝙴 𝚁 ⚡\n\n` +
                                `${query ? `│ 🔍 Search : ${query}\n❖─────────────────────────────❖\n\n` : ''}` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [ANIMEWALLPAPER COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Wallpaper Error: ${err.message || 'Failed to fetch wallpaper.'}` 
            }, { quoted: msg });
        }
    }
};
