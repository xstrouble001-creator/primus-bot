import config from '../config.js';

// Initialize restricted command storage if not already present
if (!config.privateCommands) {
    config.privateCommands = [];
}

export default {
    name: 'lockcmd',
    aliases: ['unlockcmd', 'restrictcmd'],
    description: 'Restrict a command exclusively to the primary linked account',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner } = context;

        // Ensure only the owner/linked number can run this configuration tool
        if (!isOwner && !msg.key.fromMe) {
            return await sock.sendMessage(from, {
                text:
                    `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   •   𝙰 𝙲 𝙲 𝙴 𝚂 𝚂   𝙳 𝙴 𝙽 𝙸 𝙴 𝙳 ⚡\n\n` +
                    `❖──────────【 🔒 ALPHA 𝚉𝙾𝙽𝙴 】──────────❖\n` +
                    `│\n` +
                    `│ ⛔ 𝙲𝙻𝙰𝚂𝚂𝙸𝙵𝙸𝙲𝙰𝚃𝙸𝙾𝙽 : Restricted Access\n` +
                    `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂           : Primary Link Required\n` +
                    `│\n` +
                    `❖─────────────────────────────❖\n\n` +
                    `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
        }

        const targetCmd = args[0]?.toLowerCase().replace(config.prefix, '');

        if (!targetCmd) {
            let usageText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   •   𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝙻𝙾𝙲𝙺 ⚡\n\n`;
            usageText += `❖──────────【 ⚡ 𝚂𝚈𝙽𝚃𝙰𝚇 𝙴𝚁𝚁𝙾𝚁 】──────────❖\n│\n`;
            usageText += `│ 💡 *Usage:* ${config.prefix}lockcmd <command_name>\n`;
            usageText += `│ 📌 *Example:* ${config.prefix}lockcmd restart\n│\n`;
            usageText += `│ 🔒 *Currently Locked:* ${config.privateCommands.join(', ') || 'None'}\n│\n`;
            usageText += `❖─────────────────────────────❖\n\n`;
            usageText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            return await sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        const index = config.privateCommands.indexOf(targetCmd);
        let statusMessage = '';

        if (index === -1) {
            // Command is not locked -> Lock it
            config.privateCommands.push(targetCmd);
            statusMessage = `🔒 Command *#${targetCmd}* is now LOCKED.\n│    Only the primary linked number can execute it.`;
        } else {
            // Command is locked -> Unlock it
            config.privateCommands.splice(index, 1);
            statusMessage = `🔓 Command *#${targetCmd}* is now UNLOCKED.\n│    Standard permission rules apply again.`;
        }

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   •   𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝙻𝙾𝙲𝙺 ⚡\n\n`;
        responseText += `❖──────────【 🛡️ 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙸𝙾𝙽𝚂 】──────────❖\n│\n`;
        responseText += `│ ${statusMessage}\n│\n`;
        responseText += `❖─────────────────────────────❖\n\n`;
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
