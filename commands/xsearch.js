import axios from 'axios';

export default {
    name: 'xsearch',
    aliases: ['xvideos', 'pornsec'],
    description: 'Search for adult videos and links',
    category: '18+',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a search query.\n\nExample: *#xsearch Japanese*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🔍 𝚂𝙴𝙰𝚁𝙲𝙷𝙸𝙽𝙶  𝙰𝙳𝚄𝙻𝚃  𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴...` 
        }, { quoted: msg });

        try {
            const res = await axios.get(`https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=5&format=json`);
            const videos = res.data?.videos;

            if (!videos || videos.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No results found for "${query}".` }, { quoted: msg });
            }

            let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚇 𝚂 𝙴 𝙰 𝚁 𝙲 𝙷 ⚡\n\n` +
                               `❖──────────【 𝚂𝙴𝙰𝚁𝙲𝙷  𝚁𝙴𝚂𝚄𝙻𝚃𝚂 】──────────❖\n\n`;

            videos.forEach((vid, index) => {
                responseText += `*${index + 1}. ${vid.title}*\n` +
                                `│ ⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗 : ${vid.length_min} min\n` +
                                `│ 👁️ 𝚅𝚒𝚎𝚠𝚜    : ${vid.views.toLocaleString()}\n` +
                                `│ 🔗 𝚄𝚛𝚕      : ${vid.url}\n\n`;
            });

            responseText += `❖─────────────────────────────❖\n\n` +
                            `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: responseText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [XSEARCH COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Search Error: ${err.message || 'Failed to complete search.'}` 
            }, { quoted: msg });
        }
    }
};
