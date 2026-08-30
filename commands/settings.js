import fs from 'fs';
import config from '../config.js';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'settings',
    aliases: ['config', 'botsettings', 'sets'],
    description: 'Displays current bot configuration state',
    category: 'admin',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        responseText += `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 】──────────❖\n│\n`;
        responseText += `│ 🤖 𝙱𝚘𝚝 𝙽𝚊𝚖𝚎  : ${config.botName || 'PRIMUS MD'}\n`;
        responseText += `│ ⚡ 𝙿𝚛𝚎𝚏𝚒𝚡     : [ ${config.prefix} ]\n`;
        responseText += `│ 👑 𝙾𝚠𝚗𝚎𝚛     : ${config.ownerName || 'Admin'}\n`;
        responseText += `│ 🔒 𝙼𝚘𝚍𝚎      : ${config.workMode || 'Public'}\n`;
        responseText += `│ 🛡️ 𝙰𝚗𝚝𝚒-𝙻𝚒𝚗𝚔 : ${config.antiLink ? 'ENABLED' : 'DISABLED'}\n│\n`;
        responseText += `❖─────────────────────────────❖\n\n`;
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        const bannerPath = config.banners?.admin || config.banners?.main;

        if (bannerPath && fs.existsSync(bannerPath)) {
            await sock.sendMessage(from, {
                image: fs.readFileSync(bannerPath),
                caption: responseText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: responseText, edit: loaderKey });
        }
    }
};
