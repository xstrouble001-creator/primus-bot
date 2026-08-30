import axios from 'axios';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'ttprofile',
    aliases: ['tiktokprofile', 'ttp'],
    description: 'Fetch profile statistics and details for a TikTok user',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚝𝚝𝚙𝚛𝚘𝚏𝚒𝚕𝚎 <𝚞𝚜𝚎𝚛𝚗𝚊𝚖𝚎>\n💡 𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚝𝚝𝚙𝚛𝚘𝚏𝚒𝚕𝚎 khaby.lame` 
            }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);
        const username = args[0].replace('@', '');

        try {
            const url = `https://cors-proxy.elfsight.com/https://tikwm.com/api/user/info?unique_id=${username}`;
            const res = await axios.get(url);
            const user = res.data?.data?.user;
            const stats = res.data?.data?.stats;

            if (!user) {
                await sock.sendMessage(from, { delete: loaderKey });
                return sock.sendMessage(from, { text: `❌ 𝚃𝚒𝚔𝚃𝚘𝚔 𝚞𝚜𝚎𝚛 "${username}" 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍.` }, { quoted: msg });
            }

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 𝚃𝙸𝙺𝚃𝙾𝙺  𝙿𝚁𝙾𝙵𝙸𝙻𝙴 】──────────❖\n`;
            text += `│ 👤 𝙽𝚊𝚖𝚎      : ${user.nickname}\n`;
            text += `│ 🆔 𝙷𝚊𝚗𝚍𝚕𝚎    : @${user.unique_id}\n`;
            text += `│ 👥 𝙵𝚘𝚕𝚕𝚘𝚠𝚎𝚛𝚜 : ${stats?.followerCount?.toLocaleString() || 0}\n`;
            text += `│ 👤 𝙵𝚘𝚕𝚕𝚘𝚠𝚒𝚗𝚐 : ${stats?.followingCount?.toLocaleString() || 0}\n`;
            text += `│ ❤️ 𝚃𝚘𝚝𝚊𝚕 𝙻𝚒𝚔𝚎𝚜: ${stats?.heartCount?.toLocaleString() || 0}\n`;
            text += `│ 🎬 𝚅𝚒𝚍𝚎𝚘𝚜     : ${stats?.videoCount?.toLocaleString() || 0}\n`;
            text += `│ 📝 𝙱𝚒𝚘        : ${user.signature || 'No Bio'}\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: loaderKey });
            if (user.avatarLarger) {
                await sock.sendMessage(from, { 
                    image: { url: user.avatarLarger }, 
                    caption: text 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text }, { quoted: msg });
            }

        } catch (err) {
            console.error('❌ TT Profile Error:', err);
            await sock.sendMessage(from, { delete: loaderKey });
            await sock.sendMessage(from, { text: `❌ 𝙴𝚛𝚛𝚘𝚛: 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚏𝚎𝚝𝚌𝚑 𝚃𝚒𝚔𝚃𝚘𝚔 𝚙𝚛𝚘𝚏𝚒𝚕𝚎.` }, { quoted: msg });
        }
    }
};
