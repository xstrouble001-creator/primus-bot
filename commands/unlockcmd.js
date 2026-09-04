import fs from 'fs';
import path from 'path';

export default {
    name: 'unlockcmd',
    aliases: ['unlockcommand', 'ucmd'],
    description: 'Unlocks a restricted command so public/sudo users can use it again.',
    category: 'owner',
    ownerOnly: true,

    async execute(sock, msg, args, context) {
        const { from, prefix, isOwner } = context;

        // Primary account verification double-check
        if (!isOwner) {
            return await sock.sendMessage(from, {
                text: '❌ Access Denied: Only the primary bot owner can unlock commands.'
            }, { quoted: msg });
        }

        const cmdToUnlock = args[0]?.toLowerCase().replace(/^[#!./]/, '');

        if (!cmdToUnlock) {
            return await sock.sendMessage(from, {
                text: `⚠️ *Usage:* \`${prefix || '#'}unlockcmd <command_name>\`\n*Example:* \`${prefix || '#'}unlockcmd ping\``
            }, { quoted: msg });
        }

        const configPath = path.resolve('./config.js');

        try {
            if (!fs.existsSync(configPath)) {
                return await sock.sendMessage(from, {
                    text: '❌ `config.js` not found in root directory.'
                }, { quoted: msg });
            }

            let configContent = fs.readFileSync(configPath, 'utf-8');

            // Find current privateCommands array content
            const match = configContent.match(/privateCommands\s*:\s*\[([\s\S]*?)\]/);
            if (!match) {
                return await sock.sendMessage(from, {
                    text: '❌ Could not find `privateCommands` array in `config.js`.'
                }, { quoted: msg });
            }

            // Parse currently locked array
            const currentLocked = match[1]
                .split(',')
                .map(s => s.replace(/['"\s]/g, ''))
                .filter(Boolean);

            if (!currentLocked.includes(cmdToUnlock)) {
                return await sock.sendMessage(from, {
                    text: `ℹ️ The command \`${cmdToUnlock}\` is not currently locked.`
                }, { quoted: msg });
            }

            // Filter out the requested command
            const updatedLocked = currentLocked.filter(c => c !== cmdToUnlock);

            // Rebuild string array representation
            const formattedArray = `privateCommands: [\n        ${updatedLocked.map(c => `'${c}'`).join(',\n        ')}\n    ]`;

            // Replace in config content
            const updatedConfig = configContent.replace(/privateCommands\s*:\s*\[[\s\S]*?\]/, formattedArray);
            fs.writeFileSync(configPath, updatedConfig, 'utf-8');

            // Dynamically sync memory array without full restart
            const configModule = await import(`../config.js?update=${Date.now()}`);
            if (configModule.default) {
                configModule.default.privateCommands = updatedLocked;
            }

            return await sock.sendMessage(from, {
                text:
                    `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   •   𝚄𝙽𝙻𝙾𝙲𝙺𝙴𝙳 ⚡\n\n` +
                    `❖──────────【 🔓 𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚄𝙽𝙻𝙾𝙲𝙺𝙴𝙳 】──────────❖\n│\n` +
                    `│ 🟢 *Command:* \`${cmdToUnlock}\`\n` +
                    `│ 🛡️ *Status:* Public / Standard permissions restored\n` +
                    `│ 📁 *Saved:* Updated \`config.js\` successfully.\n│\n` +
                    `❖─────────────────────────────────────────❖`
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ [UNLOCKCMD ERROR]:', error);
            return await sock.sendMessage(from, {
                text: `❌ Error unlocking command: ${error.message}`
            }, { quoted: msg });
        }
    }
};
