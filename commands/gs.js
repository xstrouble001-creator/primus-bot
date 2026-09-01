export default {
    name: 'gs',
    aliases: ['groupstatus'],
    description: 'Post a message (or replied media) to WhatsApp Status',
    category: 'admin',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner, isSudo } = context;

        if (!isOwner && !isSudo) {
            return await sock.sendMessage(from, { text: '⚠️ Only the owner/sudo can post to status.' }, { quoted: msg });
        }

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const text = args.join(' ').trim();

        try {
            const statusJidList = Object.keys(sock.store?.contacts || {}).filter(jid => jid.endsWith('@s.whatsapp.net'));

            let content;
            if (quoted?.imageMessage) {
                content = { image: { url: quoted.imageMessage.url || '' }, caption: text || '' };
            } else if (text) {
                content = { text };
            } else {
                return await sock.sendMessage(from, { text: '⚠️ *Usage:* #gs <text>, or reply to an image with #gs <caption>' }, { quoted: msg });
            }

            await sock.sendMessage('status@broadcast', content, {
                broadcast: true,
                statusJidList
            });

            await sock.sendMessage(from, { text: '✅ Posted to status.' }, { quoted: msg });
        } catch (e) {
            console.error('❌ [GS ERROR]:', e.message);
            await sock.sendMessage(from, { text: '❌ Failed to post to status. This may be a known Baileys limitation on this version.' }, { quoted: msg });
        }
    }
};
