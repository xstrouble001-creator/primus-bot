import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'setprefix',
    description: 'To change prefix, owner only command',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner } = context;
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '❌ This command is restricted to the bot owner.' }, { quoted: msg });
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return await sock.sendMessage(from, { text: `💡 Usage: ${config.prefix}setprefix <new_prefix>` }, { quoted: msg });
        }

        config.prefix = newPrefix;

        try {
            const configPath = path.resolve(__dirname, '../config.js');
            let configContent = fs.readFileSync(configPath, 'utf8');
            configContent = configContent.replace(/prefix\s*:\s*['"`].*?['"`]/, () => `prefix: '${newPrefix}'`);
            fs.writeFileSync(configPath, configContent, 'utf8');
        } catch (err) {
            console.error('Failed to update config.js file:', err);
        }

        await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙿𝚁𝙴𝙵𝙸𝚇  𝚄𝙿𝙳𝙰𝚃𝙴 】──────────❖\n` +
`│ ✅ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝚂𝚄𝙲𝙲𝙴𝚂𝚂\n` +
`│ ⚙️ 𝚂𝚎𝚝𝚝𝚒𝚗𝚐     : 𝙱𝚘𝚝 𝙿𝚛𝚎𝚏𝚒𝚡\n` +
`│ 🔖 𝙽𝚎𝚠 𝚅𝚊𝚕𝚞𝚎   : ${newPrefix}\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙿𝚛𝚎𝚏𝚒𝚡 𝚞𝚙𝚍𝚊𝚝𝚎 𝚌𝚘𝚖𝚙𝚕𝚎𝚝𝚎𝚍.\n` +
`✅ 𝚃𝚑𝚎 𝚗𝚎𝚠 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚙𝚛𝚎𝚏𝚒𝚡\n` +
`   𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚜𝚊𝚟𝚎𝚍 𝚊𝚜: ${newPrefix}\n\n` +
`⚡ 𝙰𝚕𝚕 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚠𝚒𝚕𝚕 𝚗𝚘𝚠\n` +
`   𝚞𝚜𝚎 𝚝𝚑𝚒𝚜 𝚙𝚛𝚎𝚏𝚒𝚡.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
