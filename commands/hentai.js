import axios from 'axios';

export default {
    name: 'hentai',
    aliases: ['hentaipic', 'nsfwhentai'],
    description: 'Fetch adult anime media content',
    category: '18+',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `🔞 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙷𝙴𝙽𝚃𝙰𝙸  𝙼𝙴𝙳𝙸𝙰...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://api.waifu.im/search?is_nsfw=true');
            const imageData = res.data?.images?.[0];
            const imageUrl = imageData?.url;

            if (!imageUrl) {
                throw new Error('No media returned from source API.');
            }

            const tagList = imageData?.tags?.map(t => t.name).join(', ') || 'hentai';
            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙷 𝙴 𝙽 𝚃 𝙰 𝙸 ⚡\n\n` +
                                `❖──────────【 𝙼𝙴𝙳𝙸𝙰  𝙸𝙽𝙵𝙾 】──────────❖\n` +
                                `│ 🔞 𝚃𝚊𝚐𝚜 : ${tagList}\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [HENTAI COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Hentai Command Error: ${err.message || 'Failed to fetch media.'}` 
            }, { quoted: msg });
        }
    }
};
