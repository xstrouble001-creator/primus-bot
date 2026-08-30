import { loadSettings, saveSettings } from '../lib/database.js';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'antidelete',
    aliases: ['antirevoke', 'ad'],
    description: 'Toggle Anti-Delete to reveal deleted messages in group chats',
    category: 'admin',
    execute: async (sock, msg, args, context) => {
        const { from, isGroup } = context;

        if (!isGroup) {
            return sock.sendMessage(from, { 
                text: `│ ❌ 𝙵𝚞𝚗𝚌𝚝𝚒𝚘𝚗 : This command can only be used in group chats.` 
            }, { quoted: msg });
        }

        const action = args[0]?.toLowerCase();
        if (action !== 'on' && action !== 'off') {
            return sock.sendMessage(from, { 
                text: `│ ❌ 𝙵𝚞𝚗𝚌𝚝𝚒𝚘𝚗 : Usage: .antidelete on OR .antidelete off` 
            }, { quoted: msg });
        }

        const settings = loadSettings() || {};
        if (!settings.groups) settings.groups = {};
        if (!settings.groups[from]) settings.groups[from] = {};

        const enable = action === 'on';
        settings.groups[from].antidelete = enable;
        
        saveSettings(settings);

        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        responseText += `❖──────────【 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴  𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 】──────────❖\n│\n`;
        responseText += `│ 🛡️ 𝙼𝚘𝚍𝚞𝚕𝚎 : 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴\n`;
        responseText += `│ 🔒 𝚂𝚝𝚊𝚝𝚞𝚜 : ${enable ? '𝙴𝙽𝙰𝙱𝙻𝙴𝙳 🟢' : '𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳 🔴'}\n│\n`;
        responseText += `❖─────────────────────────────❖\n\n`;
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText, edit: loaderKey });
    }
};
