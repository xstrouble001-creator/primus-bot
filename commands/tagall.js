export default {
    name: 'tagall',
    aliases: ['everyone'],
    description: 'Mention every participant in the group with a custom header message',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    execute: async (sock, msg, args, context) => {
        const { from, isGroup } = context;

        if (!isGroup) {
            return sock.sendMessage(from, { text: '⚠️ This command can only be used in groups.' }, { quoted: msg });
        }

        const meta = await sock.groupMetadata(from);
        const members = meta.participants.map(p => p.id);
        const customMsg = args.join(' ') || 'Attention required across all sectors.';

        let broadcastText = `❖──────────【 𝙰𝙻𝙻  𝚂𝙴𝙲𝚃𝙾𝚁𝚂 】──────────❖\n`;
        broadcastText += `📢 Message: ${customMsg}\n\n`;

        for (const member of members) {
            broadcastText += `│ 👤 @${member.split('@')[0]}\n`;
        }
        broadcastText += `❖─────────────────────────────❖`;

        await sock.sendMessage(from, { text: broadcastText, mentions: members });
    }
};
