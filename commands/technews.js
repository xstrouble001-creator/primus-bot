import axios from 'axios';

export default {
    name: 'technews',
    aliases: ['tech', 'devnews'],
    description: 'Fetch trending tech news and dev updates',
    category: 'news',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `💻 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝚃𝙴𝙲𝙷  𝙽𝙴𝚆𝚂...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://dev.to/api/articles?top=1&per_page=5');
            const articles = res.data || [];

            if (articles.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No tech news found.` }, { quoted: msg });
            }

            let techText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚃 𝙴 𝙲 𝙷   𝙽 𝙴 𝚆 𝚂 ⚡\n\n` +
                           `❖──────────【 𝚃𝙴𝙲𝙷  𝙷𝙴𝙰𝙳𝙻𝙸𝙽𝙴𝚂 】──────────❖\n\n`;

            articles.forEach((art, index) => {
                const title = art.title || 'No Title';
                const author = art.user?.name || 'Unknown Author';
                const reactions = art.public_reactions_count || 0;
                const link = art.url || 'N/A';

                techText += `*${index + 1}. ${title}*\n` +
                            `│ 👤 𝙰𝚞𝚝𝚑𝚘𝚛    : ${author}\n` +
                            `│ ❤️ 𝚁𝚎𝚊𝚌𝚝𝚒𝚘𝚗𝚜 : ${reactions}\n` +
                            `│ 🔗 𝚄𝚛𝚕       : ${link}\n\n`;
            });

            techText += `❖─────────────────────────────❖\n\n` +
                        `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: techText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [TECHNEWS COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Tech News Error: ${err.message || 'Failed to fetch tech news.'}` 
            }, { quoted: msg });
        }
    }
};
