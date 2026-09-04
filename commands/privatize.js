import fs from 'fs';
import path from 'path';
import config from '../config.js';

export default {
    name: 'privatize',
    aliases: ['privatizecmd', 'lockcmd'],
    description: 'Restrict a specific command to owner/dev/sudo only',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, prefix, isOwnerOrSudo } = context;

        if (!isOwnerOrSudo) {
            return await sock.sendMessage(from, { 
                text: '❌ This command is restricted to the bot owner/dev/sudo.' 
            }, { quoted: msg });
        }

        const cmdName = args[0]?.toLowerCase().replace(/^[#!./]/, '');
        if (!cmdName) {
            return await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙿𝚁𝙸𝚅𝙰𝚃𝙸𝚉𝙴 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙼𝚒𝚜𝚜𝚒𝚗𝚐 𝙰𝚛𝚐𝚞𝚖𝚎𝚗𝚝\n` +
`│ 🔒 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : ${prefix || '#'}privatize\n` +
`│ 📝 𝚁𝚎𝚚𝚞𝚒𝚛𝚎𝚍    : 𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ ${prefix || '#'}privatize <command_name>\n\n` +
`💡 𝙴𝚡𝚊𝚖𝚙𝚕𝚎:\n` +
`➤ ${prefix || '#'}privatize ban\n` +
`➤ ${prefix || '#'}privatize kick\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` 
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

            const match = configContent.match(/privateCommands\s*:\s*\[([\s\S]*?)\]/);
            if (!match) {
                return await sock.sendMessage(from, { 
                    text: '❌ Could not find `privateCommands` array in `config.js`.' 
                }, { quoted: msg });
            }

            const currentLocked = match[1]
                .split(',')
                .map(s => s.replace(/['"\s]/g, ''))
                .filter(Boolean);

            if (currentLocked.includes(cmdName)) {
                return await sock.sendMessage(from, { 
                    text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
`│ 🛡️ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : [ ${cmdName} ]\n` +
`│ 🔒 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`│ 👑 𝙰𝚕𝚕𝚘𝚠𝚎𝚍     : 𝙾𝚠𝚗𝚎𝚛 / 𝙳𝚎𝚟 / 𝚂𝚞𝚍𝚘\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝚃𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 *${cmdName}* 𝚒𝚜\n` +
`   𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚕𝚘𝚌𝚔𝚎𝚍 𝚏𝚘𝚛 𝚙𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚍 𝚞𝚜𝚎𝚛𝚜.\n\n` +
`⚡ 𝙽𝚘 𝚌𝚑𝚊𝚗𝚐𝚎𝚜 𝚠𝚎𝚛𝚎 𝚖𝚊𝚍𝚎.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` 
                }, { quoted: msg });
            }

            currentLocked.push(cmdName);

            const formattedArray = `privateCommands: [\n        ${currentLocked.map(c => `'${c}'`).join(',\n        ')}\n    ]`;
            const updatedConfig = configContent.replace(/privateCommands\s*:\s*\[[\s\S]*?\]/, formattedArray);

            fs.writeFileSync(configPath, updatedConfig, 'utf-8');

            config.privateCommands = currentLocked;

            return await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈 】──────────❖\n` +
`│ 🔒 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : [ ${cmdName} ]\n` +
`│ 🛡️ 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`│ 📁 𝙵𝚒𝚕𝚎        : 𝚄𝚙𝚍𝚊𝚝𝚎𝚍 𝚌𝚘𝚗𝚏𝚒𝚐.𝚓𝚜\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝚃𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 *${cmdName}* 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗\n` +
`   𝚕𝚘𝚌𝚔𝚎𝚍 𝚒𝚗 𝚌𝚘𝚗𝚏𝚒𝚐.𝚓𝚜 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` 
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ [PRIVATIZE ERROR]:', error);
            return await sock.sendMessage(from, { 
                text: `❌ Error updating config.js: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
