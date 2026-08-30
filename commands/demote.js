export default {
    name: 'demote',
    description: 'Strip administrator privileges from a targeted user',
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
            return sock.sendMessage(from, { text: '⚠️ Usage: Reply to or tag the user you want to demote.' }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(from, [targetUser], 'demote');
            await sock.sendMessage(from, { 
                text: `🔻 Administrative privileges revoked for @${targetUser.split('@')[0]}.`,
                mentions: [targetUser]
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Demotion failed. Ensure the bot has administrative privileges.' }, { quoted: msg });
        }
    }
};
