export default {
    name: 'promote',
    description: 'Elevate a target participant to group administrator',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from, isGroup } = context;

        if (!isGroup) {
            return sock.sendMessage(from, { text: '⚠️ This command can only be used in groups.' }, { quoted: msg });
        }

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const targetUser = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;

        if (!targetUser) {
            return sock.sendMessage(from, { text: '⚠️ Usage: Reply to or tag the user you want to promote.' }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(from, [targetUser], 'promote');
            await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙰𝙳𝙼𝙸𝙽  𝙿𝚁𝙾𝙼𝙾𝚃𝙸𝙾𝙽 】──────────❖\n` +
`│ ⚡ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝚂𝚄𝙲𝙲𝙴𝚂𝚂\n` +
`│ 👤 𝚃𝚊𝚛𝚐𝚎𝚝      : @${targetUser.split('@')[0]}\n` +
`│ 👑 𝚁𝚘𝚕𝚎        : 𝙰𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚝𝚘𝚛\n` +
`❖─────────────────────────────❖\n\n` +
`📢 𝙿𝚛𝚒𝚟𝚒𝚕𝚎𝚐𝚎𝚜 𝚑𝚊𝚟𝚎 𝚋𝚎𝚎𝚗 𝚎𝚕𝚎𝚟𝚊𝚝𝚎𝚍.\n` +
`⚡ @${targetUser.split('@')[0]} 𝚒𝚜 𝚗𝚘𝚠\n` +
`   𝚊𝚗 𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚝𝚘𝚛 𝚘𝚏 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`,
                mentions: [targetUser]
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Promotion failed. Ensure the bot has administrative privileges.' }, { quoted: msg });
        }
    }
};
