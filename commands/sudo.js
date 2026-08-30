import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'sudo',
    description: 'To grant Access to a user, even when the bot is in private mode, owner only command',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner, mentionedJid } = context;
        if (!isOwner) {
            return await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙰𝙲𝙲𝙴𝚂𝚂  𝙳𝙴𝙽𝙸𝙴𝙳 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙳𝙴𝙽𝙸𝙴𝙳\n` +
`│ 🔐 𝙻𝚎𝚟𝚎𝚕       : 𝚁𝙾𝙾𝚃 𝙾𝙽𝙻𝚈\n` +
`│ 🛡️ 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`❖─────────────────────────────❖\n\n` +
`⚠️ 𝚁𝚘𝚘𝚝 𝚙𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚜 𝚊𝚛𝚎 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍\n` +
`   𝚝𝚘 𝚙𝚛𝚘𝚟𝚒𝚜𝚒𝚘𝚗 𝚗𝚘𝚍𝚎 𝚊𝚌𝚌𝚎𝚜𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        const target = mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
            return await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝚂𝚈𝙽𝚃𝙰𝚇  𝙴𝚁𝚁𝙾𝚁 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝚂𝚈𝙽𝚃𝙰𝚇\n` +
`│ 📝 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : sudo\n` +
`│ 🔧 𝚁𝚎𝚚𝚞𝚒𝚛𝚎𝚍    : @user\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ ${config.prefix}sudo @user\n\n` +
`⚡ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚖𝚎𝚗𝚝𝚒𝚘𝚗 𝚊 𝚟𝚊𝚕𝚒𝚍\n` +
`   𝚞𝚜𝚎𝚛 𝚝𝚘 𝚐𝚛𝚊𝚗𝚝 𝚜𝚞𝚍𝚘 𝚊𝚌𝚌𝚎𝚜𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        if (!config.sudo) config.sudo = [];

        if (config.sudo.includes(target)) {
            return await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
`│ 🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝙲𝙻𝙴𝙰𝚁𝙴𝙳\n` +
`│ 👤 𝙽𝚘𝚍𝚎        : ${target.split('@')[0]}\n` +
`│ ⚡ 𝙻𝚎𝚟𝚎𝚕       : 𝙴𝙻𝙴𝚅𝙰𝚃𝙴𝙳\n` +
`❖─────────────────────────────❖\n\n` +
`🛡️ 𝙽𝚘𝚍𝚎 [${target.split('@')[0]}]\n` +
`   𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚑𝚊𝚜 𝚎𝚕𝚎𝚟𝚊𝚝𝚎𝚍 𝚌𝚕𝚎𝚊𝚛𝚊𝚗𝚌𝚎.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        config.sudo.push(target);

        try {
            const configPath = path.resolve(__dirname, '../config.js');
            let configContent = fs.readFileSync(configPath, 'utf8');

            const sudoArrayStr = `sudo: ${JSON.stringify(config.sudo, null, 4)}`;
            if (configContent.includes('sudo')) {
                configContent = configContent.replace(/sudo\s*:\s*\[[\s\S]*?\]/, sudoArrayStr);
            } else {
                configContent = configContent.replace(/export default\s*{/, `export default {\n    ${sudoArrayStr},`);
            }
            fs.writeFileSync(configPath, configContent, 'utf8');
        } catch (err) {
            console.error('Failed to update config.js file:', err);
        }

        await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴  𝙴𝙻𝙴𝚅𝙰𝚃𝙸𝙾𝙽 】──────────❖\n` +
`│ 💻 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙶𝚁𝙰𝙽𝚃𝙴𝙳\n` +
`│ 👤 𝙽𝚘𝚍𝚎        : ${target.split('@')[0]}\n` +
`│ 🛡️ 𝙲𝚕𝚎𝚊𝚛𝚊𝚗𝚌𝚎   : 𝚆𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝚎𝚍\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙴𝚕𝚎𝚟𝚊𝚝𝚒𝚘𝚗 𝚙𝚛𝚘𝚝𝚘𝚌𝚘𝚕 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍.\n` +
`💻 𝙽𝚘𝚍𝚎 [${target.split('@')[0]}]\n` +
`   𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚒𝚗𝚓𝚎𝚌𝚝𝚎𝚍 𝚒𝚗𝚝𝚘 𝚝𝚑𝚎\n` +
`   𝚕𝚘𝚌𝚊𝚕 𝚌𝚕𝚎𝚊𝚛𝚊𝚗𝚌𝚎 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝.\n\n` +
`⚡ 𝙰𝚌𝚌𝚎𝚜𝚜 𝚕𝚎𝚟𝚎𝚕𝚜 𝚑𝚊𝚟𝚎 𝚋𝚎𝚎𝚗\n` +
`   𝚞𝚙𝚍𝚊𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
