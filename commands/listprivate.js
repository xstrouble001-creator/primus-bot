import config from '../config.js';

export default {
    name: 'listprivate',
    aliases: ['privatecmds', 'listlocked', 'lockedcmds'],
    description: 'Displays a list of all commands currently restricted in config.js',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, prefix, isOwnerOrSudo } = context;

        if (!isOwnerOrSudo) {
            return await sock.sendMessage(from, { 
                text: '❌ This command is restricted to the bot owner/dev/sudo.' 
            }, { quoted: msg });
        }

        const lockedCommands = config.privateCommands || [];

        let listText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   •   𝙻𝙾𝙲𝙺𝙴𝙳  𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 ⚡\n\n`;
        listText += `❖──────────【 🔒 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙴𝙳  𝙻𝙸𝚂𝚃 】──────────❖\n│\n`;

        if (lockedCommands.length === 0) {
            listText += `│ 🟢 *Status:* No commands are currently privatized.\n│\n`;
        } else {
            listText += `│ 🛡️ *Total Locked:* ${lockedCommands.length}\n│\n`;
            lockedCommands.forEach((cmd, index) => {
                listText += `│  ${index + 1}. ${prefix || '#'}${cmd}\n`;
            });
            listText += `│\n`;
        }

        listText += `❖─────────────────────────────────────────❖\n\n`;
        listText += `💡 *Management:* Use \`${prefix || '#'}privatize\` or \`${prefix || '#'}deprivatize\`\n\n`;
        listText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: listText }, { quoted: msg });
    }
};
