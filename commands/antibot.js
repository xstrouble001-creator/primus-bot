export default {
    name: 'antibot',
    category: 'group',
    description: 'Currently disabled — see notice below.',
    groupOnly: true,
    adminOnly: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sock.sendMessage(from, {
            text: '⚠️ *#antibot is currently disabled.*\n\nWhatsApp/Baileys does not currently provide a reliable way to detect whether a message came from another bot — the old detection method was unreliable and has been removed rather than left broken. This will be revisited if a real signal becomes available.'
        }, { quoted: msg });
    }
};
