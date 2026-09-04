import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default {
    name: 'news',
    aliases: ['headlines', 'worldnews'],
    description: 'Fetch breaking global news headlines',
    category: 'news',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `📰 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙱𝚁𝙴𝙰𝙺𝙸𝙽𝙶  𝙽𝙴𝚆𝚂...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
            const result = await parseStringPromise(res.data);
            const items = result?.rss?.channel?.[0]?.item || [];

            if (items.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ No news articles found.` }, { quoted: msg });
            }

            let newsText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙽 𝙴 𝚆 𝚂 ⚡\n\n` +
                           `❖──────────【 𝚆𝙾𝚁𝙻𝙳  𝙷𝙴𝙰𝙳𝙻𝙸𝙽𝙴𝚂 】──────────❖\n\n`;

            const topItems = items.slice(0, 5);
            topItems.forEach((item, index) => {
                const title = item.title?.[0] || 'No Title';
                const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]).toUTCString().slice(0, 16) : 'Recent';
                const link = item.link?.[0] || 'N/A';

                newsText += `*${index + 1}. ${title}*\n` +
                            `│ 📅 𝙳𝚊𝚝𝚎 : ${pubDate}\n` +
                            `│ 🔗 𝚄𝚛𝚕  : ${link}\n\n`;
            });

            newsText += `❖─────────────────────────────❖\n\n` +
                        `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: newsText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [NEWS COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ News Command Error: ${err.message || 'Failed to fetch news.'}` 
            }, { quoted: msg });
        }
    }
};
