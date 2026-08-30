import { getGroupData, updateWarn } from '../lib/db.js';
import { getMentionName } from '../lib/nameCache.js';

export default {
    name: 'warn',
    aliases: ['unwarn', 'warns'],
    description: 'Issue warning strikes to users. Automatically kicks user upon reaching 3 warnings.',
    category: 'group',
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
            return sock.sendMessage(from, { text: '⚠️ Reply to or tag a user to issue a warning strike.' }, { quoted: msg });
        }

        const groupData = getGroupData(from);
        let currentWarns = (groupData.warns?.[targetUser] || 0) + 1;

        if (currentWarns >= 3) {
            updateWarn(from, targetUser, 0);
            await sock.sendMessage(from, { text: `🚨 User @${getMentionName(targetUser)} reached 3/3 warnings. Initiating eviction protocol...`, mentions: [targetUser] });
            try {
                await sock.groupParticipantsUpdate(from, [targetUser], 'remove');
            } catch (e) {
                await sock.sendMessage(from, { text: '❌ Kick failed. Ensure bot has admin privileges.' });
            }
        } else {
            updateWarn(from, targetUser, currentWarns);
            await sock.sendMessage(from, { 
                text: `⚠️ Warning strike issued to @${getMentionName(targetUser)}\n│ 📊 Total Strikes : [ ${currentWarns} / 3 ]\n│ 💡 Note: Reaching 3 strikes triggers an automatic kick.`,
                mentions: [targetUser]
            }, { quoted: msg });
        }
    }
};
