import axios from 'axios';

export default {
    name: 'livematch',
    aliases: ['livescore', 'football', 'matches'],
    description: 'Fetch live football scores and match status',
    category: 'football news',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const sent = await sock.sendMessage(from, { 
            text: `⚽ 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙻𝙸𝚅𝙴  𝙼𝙰𝚃𝙲𝙷𝙴𝚂...` 
        }, { quoted: msg });

        try {
            const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
            const events = res.data?.events || [];

            if (events.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `⚽ No live matches found at the moment.` }, { quoted: msg });
            }

            let resultText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙻 𝙸 𝚅 𝙴   𝙼 𝙰 𝚃 𝙲 𝙷 𝙴 𝚂 ⚡\n\n` +
                             `❖──────────【 𝙻𝙸𝚅𝙴  𝚂𝙲𝙾𝚁𝙴𝚂 】──────────❖\n\n`;

            const topMatches = events.slice(0, 7);
            topMatches.forEach((ev, index) => {
                const comp = ev.competitions?.[0];
                const home = comp?.competitors?.[0];
                const away = comp?.competitors?.[1];
                const status = ev.status?.type?.detail || 'Scheduled';

                resultText += `*${index + 1}. ${ev.name}*\n` +
                              `│ 🏆 ${home?.team?.displayName} [ ${home?.score || '0'} ] vs [ ${away?.score || '0'} ] ${away?.team?.displayName}\n` +
                              `│ ⏱️ 𝚂𝚝𝚊𝚝𝚞𝚜 : ${status}\n\n`;
            });

            resultText += `❖─────────────────────────────❖\n\n` +
                          `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: resultText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [LIVEMATCH COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Live Match Error: ${err.message || 'Failed to fetch score data.'}` 
            }, { quoted: msg });
        }
    }
};
