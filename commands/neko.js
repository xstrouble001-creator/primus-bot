import axios from 'axios';

export default {
    name: 'neko',
    aliases: ['catgirl', 'nekogirl'],
    description: 'Fetch a random anime neko picture',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `🐾 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙽𝙴𝙺𝙾...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://nekos.best/api/v2/neko');
            const animeData = res.data?.results?.[0];
            const imageUrl = animeData?.url;
            const artistName = animeData?.artist_name || 'Unknown Artist';

            if (!imageUrl) {
                throw new Error('Image URL not found.');
            }

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙽 𝙴 𝙺 𝙾 ⚡\n\n` +
                                `│ 🎨 Artist : ${artistName}\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [NEKO COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Neko Error: ${err.message || 'Failed to fetch image.'}` 
            }, { quoted: msg });
        }
    }
};
