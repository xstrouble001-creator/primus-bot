export default {
    name: 'hidetag',
    description: 'Send a message that silently mentions all group members',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    execute: async (sock, msg, args, context) => {
        const { from, isGroup } = context;

        if (!isGroup) {
            return sock.sendMessage(from, { text: '⚠️ This command can only be used in groups.' }, { quoted: msg });
        }

        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const meta = await sock.groupMetadata(from);
        const members = meta.participants.map(p => p.id);

        const announcement = args.join(' ');

        if (quotedMsg) {
            await sock.sendMessage(from, { forward: msg, mentions: members });
        } else if (announcement) {
            await sock.sendMessage(from, { text: announcement, mentions: members });
        } else {
            await sock.sendMessage(from, { text: '⚠️ Usage: .hidetag <message> or reply to a message with .hidetag' }, { quoted: msg });
        }
    }
};
