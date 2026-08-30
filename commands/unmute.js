export default {
    name: 'unmute',
    aliases: ['open'],
    description: 'Unlock the group so all members can send messages',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: '🔓 Group unmuted. All members can now send messages.' }, { quoted: msg });
        } catch (e) {
            console.error('❌ [UNMUTE ERROR]', e);
            await sock.sendMessage(from, { text: '❌ Action failed. Ensure the bot is an administrator.' }, { quoted: msg });
        }
    }
};
