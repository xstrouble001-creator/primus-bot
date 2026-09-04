import axios from 'axios';

export default {
    name: 'nsfwpic',
    aliases: ['nsfw', 'ecchi'],
    description: 'Fetch NSFW anime artwork',
    category: '18+',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `🔞 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙽𝚂𝙵𝚆  𝙰𝚁𝚃...` 
        }, { quoted: msg });

        try {
            const categories = ['waifu', 'neko', 'trap', 'blowjob'];
            const chosenCategory = args[0] && categories.includes(args[0].toLowerCase()) 
                ? args[0].toLowerCase() 
                : 'waifu';

            const res = await axios.get(`https://api.waifu.pics/nsfw/${chosenCategory}`);
            const imageUrl = res.data?.url;

            if (!imageUrl) {
                throw new Error('Image URL not returned by API.');
            }

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙽 𝚂 𝙵 𝚆 ⚡\n\n` +
                                `❖──────────【 𝙽𝚂𝙵𝚆  𝙰𝚁𝚃 】──────────❖\n` +
                                `│ 🔞 𝙲𝚊𝚝𝚎𝚐𝚘𝚛𝚢 : ${chosenCategory}\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: { url: imageUrl }, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [NSFWPIC COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ NSFW Art Error: ${err.message || 'Failed to fetch image.'}` 
            }, { quoted: msg });
        }
    }
};
