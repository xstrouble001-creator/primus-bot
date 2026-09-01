export default {
    name: 'link',
    aliases: ['grouplink', 'invite'],
    description: 'Get the group invite link',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        try {
            const code = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${code}`;

            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 𝙶𝚁𝙾𝚄𝙿 𝙻𝙸𝙽𝙺 】──────────❖\n`;
            text += `│ 🔗 ${inviteLink}\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text }, { quoted: msg });
        } catch (e) {
            console.error('❌ [LINK ERROR]:', e.message);
            await sock.sendMessage(from, { text: '❌ Failed to fetch group link. Make sure the bot is an admin.' }, { quoted: msg });
        }
    }
};
