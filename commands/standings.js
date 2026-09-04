import axios from 'axios';

export default {
    name: 'standings',
    aliases: ['table', 'leaguetable'],
    description: 'Fetch current football league standings',
    category: 'football news',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const league = args[0] ? args[0].toLowerCase() : 'eng.1';

        const leagueMap = {
            'epl': 'eng.1',
            'laliga': 'esp.1',
            'seriea': 'ita.1',
            'bundesliga': 'ger.1',
            'ligue1': 'fra.1',
            'ucl': 'uefa.champions'
        };

        const targetCode = leagueMap[league] || league;

        const sent = await sock.sendMessage(from, { 
            text: `📊 𝙵𝙴𝚃𝙲𝙷𝙸𝙽𝙶  𝙻𝙴𝙰𝙶𝚄𝙴  𝚂𝚃𝙰𝙽𝙳𝙸𝙽𝙶𝚂...` 
        }, { quoted: msg });

        try {
            const res = await axios.get(`https://site.api.espn.com/apis/v2/sports/soccer/${targetCode}/standings`);
            const standings = res.data?.children?.[0]?.standings?.entries || [];

            if (standings.length === 0) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { 
                    text: `❌ Table not found. Available leagues: *epl, laliga, seriea, bundesliga, ligue1, ucl*` 
                }, { quoted: msg });
            }

            const leagueName = res.data?.name || 'League';

            let tableText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚂 𝚃 𝙰 𝙽 𝙳 𝙸 𝙽 𝙶 𝚂 ⚡\n\n` +
                            `❖──────────【 ${leagueName.toUpperCase()} 】──────────❖\n\n`;

            const topTeams = standings.slice(0, 10);
            topTeams.forEach((item) => {
                const rank = item.stats?.find(s => s.name === 'rank')?.value || 'N/A';
                const points = item.stats?.find(s => s.name === 'points')?.value || 0;
                const played = item.stats?.find(s => s.name === 'gamesPlayed')?.value || 0;
                const teamName = item.team?.displayName || 'Team';

                tableText += `*#${rank} ${teamName}*\n` +
                             `│ 🏟️ Played: ${played} | 🏆 Points: ${points}\n\n`;
            });

            tableText += `❖─────────────────────────────❖\n\n` +
                         `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { text: tableText.trim() }, { quoted: msg });
        } catch (err) {
            console.error('❌ [STANDINGS COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Standings Error: ${err.message || 'Failed to fetch standings data.'}` 
            }, { quoted: msg });
        }
    }
};
