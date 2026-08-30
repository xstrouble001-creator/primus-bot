import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'privatize',
    description: 'Restrict a specific command to owner/dev/sudo only',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwnerOrSudo } = context;
        if (!isOwnerOrSudo) {
            return await sock.sendMessage(from, { text: '❌ This command is restricted to the bot owner/dev/sudo.' }, { quoted: msg });
        }

        const cmdName = args[0]?.toLowerCase();
        if (!cmdName) {
            return await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙿𝚁𝙸𝚅𝙰𝚃𝙸𝚉𝙴 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙼𝚒𝚜𝚜𝚒𝚗𝚐 𝙰𝚛𝚐𝚞𝚖𝚎𝚗𝚝\n` +
`│ 🔒 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : #privatize\n` +
`│ 📝 𝚁𝚎𝚚𝚞𝚒𝚛𝚎𝚍    : 𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙽𝚊𝚖𝚎\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ #privatize <command_name>\n\n` +
`💡 𝙴𝚡𝚊𝚖𝚙𝚕𝚎:\n` +
`➤ #privatize ban\n` +
`➤ #privatize kick\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        const settings = loadSettings() || {};
        if (!settings.privateCommands) settings.privateCommands = [];

        if (settings.privateCommands.includes(cmdName)) {
            return await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
`│ 🛡️ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : [ ${cmdName} ]\n` +
`│ 🔒 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`│ 👑 𝙰𝚕𝚕𝚘𝚠𝚎𝚍     : 𝙾𝚠𝚗𝚎𝚛 / 𝙳𝚎𝚟 / 𝚂𝚞𝚍𝚘\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝚃𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 *${cmdName}* 𝚒𝚜\n` +
`   𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚕𝚘𝚌𝚔𝚎𝚍 𝚏𝚘𝚛 𝚙𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚍 𝚞𝚜𝚎𝚛𝚜.\n\n` +
`⚡ 𝙽𝚘 𝚌𝚑𝚊𝚗𝚐𝚎𝚜 𝚠𝚎𝚛𝚎 𝚖𝚊𝚍𝚎.\n` +
`   𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢\n` +
`   𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍 𝚝𝚘 𝙾𝚠𝚗𝚎𝚛, 𝙳𝚎𝚟, 𝚊𝚗𝚍 𝚂𝚞𝚍𝚘.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        settings.privateCommands.push(cmdName);
        saveSettings(settings);

        await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙲𝙾𝙼𝙼𝙰𝙽𝙳  𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈 】──────────❖\n` +
`│ 🔒 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : [ ${cmdName} ]\n` +
`│ 🛡️ 𝙰𝚌𝚌𝚎𝚜𝚜      : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`│ 👑 𝙰𝚕𝚕𝚘𝚠𝚎𝚍     : 𝙾𝚠𝚗𝚎𝚛 / 𝙳𝚎𝚟 / 𝚂𝚞𝚍𝚘\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝚃𝚑𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 *${cmdName}* 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗\n` +
`   𝚕𝚘𝚌𝚔𝚎𝚍 𝚏𝚘𝚛 𝚙𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚍 𝚞𝚜𝚎𝚛𝚜 𝚘𝚗𝚕𝚢.\n\n` +
`⚡ 𝙾𝚗𝚕𝚢 𝙾𝚠𝚗𝚎𝚛, 𝙳𝚎𝚟, 𝚊𝚗𝚍 𝚂𝚞𝚍𝚘 𝚞𝚜𝚎𝚛𝚜\n` +
`   𝚌𝚊𝚗 𝚊𝚌𝚌𝚎𝚜𝚜 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
    }
};
