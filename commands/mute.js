export default {
    name: 'mute',
    aliases: ['close'],
    description: 'Lock the group so only admins can send messages',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙶𝚁𝙾𝚄𝙿 𝙼𝚄𝚃𝙴 】──────────❖\n` +
`│ 🔒 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙼𝚄𝚃𝙴𝙳\n` +
`│ 👑 𝙿𝚎𝚛𝚖𝚒𝚜𝚜𝚒𝚘𝚗  : 𝙰𝚍𝚖𝚒𝚗𝚜 𝙾𝚗𝚕𝚢\n` +
`│ 🛡️ 𝙼𝚘𝚍𝚎        : 𝚁𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚝𝚘𝚛𝚜 𝚌𝚊𝚗 𝚜𝚎𝚗𝚍 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        } catch (e) {
            console.error('❌ [MUTE ERROR]', e);
            await sock.sendMessage(from, { text: '❌ Action failed. Ensure the bot is an administrator.' }, { quoted: msg });
        }
    }
};
