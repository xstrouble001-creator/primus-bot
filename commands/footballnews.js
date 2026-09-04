import axios from 'axios';

export default {
    name: 'footballnews',
    aliases: ['footy', 'soccernews', 'transfernews'],
    description: 'Fetch top football headlines and transfer news',
    category: 'football news',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `📰 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙵𝙾𝙾𝚃𝙱𝙰𝙻𝙻  𝙽𝙴𝚆𝚂...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/soccer/all/news');
            const articles = res.data?.articles || [];

            if (articles.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No news articles found.` }, { quoted: msg });
            }

            let newsText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙵 𝙾 𝙾 𝚃 𝙱 𝙰 𝙻 𝙻   𝙽 𝙴 𝚆 𝚂 ⚡\n\n` +
                           `❖──────────【 𝙷𝙴𝙰𝙳𝙻𝙸𝙽𝙴𝚂 】──────────❖\n\n`;

            const topArticles = articles.slice(0, 5);
            topArticles.forEach((art, index) => {
                newsText += `*${index + 1}. ${art.headline}*\n` +
                            `│ 📝 ${art.description || 'No summary available.'}\n` +
                            `│ 🔗 ${art.links?.web?.href || 'N/A'}\n\n`;
            });

            newsText += `❖─────────────────────────────❖\n\n` +
                        `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: newsText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [FOOTBALLNEWS COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Football News Error: ${err.message || 'Failed to fetch news.'}` 
            }, { quoted: msg });
        }
    }
};
