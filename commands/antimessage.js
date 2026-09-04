import config from '../config.js';

// In-memory toggle state (Use a database/JSON for persistence)
const antistatusState = new Map();

export default {
    name: 'antistatus',
    aliases: ['antimsg'],
    description: 'Toggle automatic deletion of group tag mentions',
    category: 'group',
    execute: async (sock, msg, args, context) => {
        const { from, isGroup, isAdmin } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        if (!isAdmin) {
            return await sock.sendMessage(from, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
        }

        const option = args[0]?.toLowerCase();
        let statusText = '';

        if (option === 'on') {
            antistatusState.set(from, true);
            statusText = '✅ *Anti-Status / Mention Guard is now ENABLED*';
        } else if (option === 'off') {
            antistatusState.set(from, false);
            statusText = '❌ *Anti-Status / Mention Guard is now DISABLED*';
        } else {
            let usageText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            usageText += `❖──────────【 𝙰𝙽𝚃𝙸 - 𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n│\n`;
            usageText += `│ 💡 *Usage:* ${config.prefix}antistatus on / off\n`;
            usageText += `│ 📜 *Current Status:* ${antistatusState.get(from) ? 'ENABLED' : 'DISABLED'}\n│\n`;
            usageText += `❖─────────────────────────────❖\n\n`;
            usageText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            return await sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        responseText += `❖──────────【 𝙰𝙽𝚃𝙸 - 𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n│\n`;
        responseText += `│ ${statusText}\n│\n`;
        responseText += `❖─────────────────────────────❖\n\n`;
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
