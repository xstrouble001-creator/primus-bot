import axios from 'axios';

export default {
    name: 'waifu',
    aliases: ['animegirl'],
    description: 'Fetch a random anime waifu picture',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `✨ 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝚆𝙰𝙸𝙵𝚄...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            const imageUrl = res.data?.url;

            if (!imageUrl) {
                throw new Error('Image URL not found in API response.');
            }

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚆 𝙰 𝙸 𝙵 𝚄 ⚡\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [WAIFU COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Waifu Error: ${err.message || 'Failed to fetch image.'}` 
            }, { quoted: msg });
        }
    }
};
