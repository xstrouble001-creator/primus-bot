import { getMentionName } from '../lib/nameCache.js';

export default {
    name: 'kick',
    aliases: ['remove'],
    description: 'Eject a targeted participant from the group',
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
            return sock.sendMessage(from, { text: '⚠️ Usage: Reply to or tag the user you want to kick.' }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(from, [targetUser], 'remove');
            await sock.sendMessage(from, { 
                text: `☣️ User @${getMentionName(targetUser)} has been removed from the quadrant.`,
                mentions: [targetUser]
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Action failed. Ensure the bot has administrative privileges.' }, { quoted: msg });
        }
    }
};
