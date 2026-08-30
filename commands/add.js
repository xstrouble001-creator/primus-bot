export default {
    name: 'add',
    category: 'group',
    description: 'Add a user to the group via phone number or reply. Falls back to sending an invite link if direct add fails.',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;
        let targetNum = args[0] ? args[0].replace(/[^0-9]/g, '') : '';
        if (!targetNum && quotedSender) {
            targetNum = quotedSender.split('@')[0].replace(/[^0-9]/g, '');
        }

        if (!targetNum) {
            return sock.sendMessage(from, { text: '⚡ Provide a phone number or reply to a user.\nExample: `#add 2348039336009`' }, { quoted: msg });
        }

        const userJid = `${targetNum}@s.whatsapp.net`;

        await sock.sendMessage(from, { text: `🔄 Adding +${targetNum} to the group...` }, { quoted: msg });

        // Numbers not saved in the bot's contacts (or with restrictive
        // privacy settings) can cause groupParticipantsUpdate to hang for
        // a long time waiting on a WhatsApp server query before it
        // eventually errors out. Race it against our own timeout so the
        // bot never appears frozen — if it doesn't resolve quickly, treat
        // it the same as a failure and fall through to the invite link.
        const withTimeout = (promise, ms) => Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
        ]);

        let directAddWorked = false;
        try {
            const response = await withTimeout(
                sock.groupParticipantsUpdate(from, [userJid], 'add'),
                15000
            );
            if (response?.[0]?.status === '200') {
                directAddWorked = true;
                await sock.sendMessage(from, { text: `✅ +${targetNum} was added to the group directly.` }, { quoted: msg });
            }
        } catch (e) {
            console.error('❌ [ADD] Direct add failed/timed out:', e.message);
        }

        if (directAddWorked) return;

        // Fallback: send the person a direct invite link instead.
        try {
            const code = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${code}`;
            await sock.sendMessage(userJid, { text: `You've been invited to join a group:\n${inviteLink}` });
            await sock.sendMessage(from, { text: `⚠️ Couldn't add +${targetNum} directly (likely their privacy settings) — sent them an invite link instead.` }, { quoted: msg });
        } catch (e) {
            console.error('❌ [ADD] Invite-link fallback failed:', e.message);
            await sock.sendMessage(from, { text: `❌ Couldn't add +${targetNum} directly, and sending an invite link also failed. Make sure the bot is a group admin.` }, { quoted: msg });
        }
    }
};
