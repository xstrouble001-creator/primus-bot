export default {
    name: 'del',
    aliases: ['delete', 'd'],
    category: 'group',
    description: 'Delete a replied message from the group sector\nUsage: Reply to a message with .del',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const { from, isAdmin, isOwnerOrSudo } = context;
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.stanzaId) {
            await sock.sendMessage(from, { text: '⚡ [ERROR] Please reply to the message you want to incinerate with `.del`' }, { quoted: msg });
            return;
        }

        try {
            if (!isAdmin && !isOwnerOrSudo && !quoted.fromMe) {
                await sock.sendMessage(from, { text: '⚠️ [ACCESS DENIED] Only group admins or owner can delete messages sent by others.' }, { quoted: msg });
                return;
            }

            // Execute deletion payload
            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: quoted.fromMe,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });

            // Clean reaction payload using sendMessage
            await sock.sendMessage(from, {
                react: { text: '🗑️', key: msg.key }
            }).catch(() => {});

        } catch (e) {
            console.error('Delete Error:', e);
            await sock.sendMessage(from, { text: `❌ [INCINERATION FAILED]: ${e.message}` }, { quoted: msg });
        }
    }
};
