export default {
    name: 'pin',
    aliases: ['pingroup'],
    description: 'Pin this group chat to the top of the chat list',
    category: 'admin',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        try {
            // NOTE: Baileys' confirmed, documented pin API (chatModify with
            // { pin: true }) pins the ENTIRE CHAT to the top of the chat
            // list — it does not pin a single message inside the
            // conversation. True per-message pinning exists in WhatsApp's
            // protocol (PinInChatMessage) but has no confirmed working
            // Baileys example, and malformed chat-state updates carry a
            // real risk of the bot's session being logged out entirely.
            // Until a safe, confirmed method is available, #pin pins the
            // whole chat instead.
            await sock.chatModify({ pin: true }, from);

            await sock.sendMessage(from, {
                text: `📌 This chat has been pinned to the top of the chat list.\n\n` +
                      `_Note: this pins the whole conversation, not an individual message — WhatsApp's per-message pin isn't safely supported yet._`
            }, { quoted: msg });
        } catch (err) {
            console.error('❌ [PIN ERROR]:', err);
            await sock.sendMessage(from, { text: '❌ Failed to pin this chat. Make sure the bot is an admin in this group.' }, { quoted: msg });
        }
    }
};
