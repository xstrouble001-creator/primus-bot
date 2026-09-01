export default {
    name: 'unlock',
    aliases: ['open'],
    description: 'Unlock the group so everyone can send messages again',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙶𝚁𝙾𝚄𝙿 𝚄𝙽𝙻𝙾𝙲𝙺 】──────────❖\n` +
`│ 🔓 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝚄𝙽𝙻𝙾𝙲𝙺𝙴𝙳\n` +
`│ 👥 𝙿𝚎𝚛𝚖𝚒𝚜𝚜𝚒𝚘𝚗  : 𝙴𝚟𝚎𝚛𝚢𝚘𝚗𝚎\n` +
`│ 🛡️ 𝙼𝚘𝚍𝚎        : 𝙾𝚙𝚎𝚗\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙰𝚕𝚕 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚌𝚊𝚗 𝚗𝚘𝚠 𝚜𝚎𝚗𝚍 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        } catch (e) {
            console.error('❌ [UNLOCK ERROR]', e);
            await sock.sendMessage(from, { text: '❌ Action failed. Ensure the bot is an administrator.' }, { quoted: msg });
        }
    }
};
