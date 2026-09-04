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
            return await sock.sendMessage(from, { 
                text: '⚡ Provide a phone number or reply to a user.\nExample: `#add 2348039336009`' 
            }, { quoted: msg });
        }

        const userJid = `${targetNum}@s.whatsapp.net`;

        await sock.sendMessage(from, { text: `🔄 Adding +${targetNum} to the group...` }, { quoted: msg });

        let directAddWorked = false;

        // Safe timeout implementation that clears timer and handles delayed promises
        try {
            let timer;
            const timeoutPromise = new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error('TIMEOUT')), 15000);
            });

            const updatePromise = sock.groupParticipantsUpdate(from, [userJid], 'add');

            // Catch background rejection if updatePromise fails AFTER timeout
            updatePromise.catch(err => console.error('❌ [ADD] Background promise rejection caught:', err.message));

            const response = await Promise.race([updatePromise, timeoutPromise]);
            clearTimeout(timer);

            if (response?.[0]?.status === '200' || response?.[0]?.status === 200) {
                directAddWorked = true;
                return await sock.sendMessage(from, { 
                    text: `✅ +${targetNum} was added to the group directly.` 
                }, { quoted: msg });
            }
        } catch (e) {
            console.error('❌ [ADD] Direct add failed/timed out:', e.message);
        }

        if (directAddWorked) return;

        // Fallback: send invite link
        try {
            const code = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${code}`;

            let dmSent = false;
            try {
                await sock.sendMessage(userJid, { text: `You've been invited to join a group:\n${inviteLink}` });
                dmSent = true;
            } catch (dmErr) {
                console.error('❌ [ADD] Direct DM failed:', dmErr.message);
            }

            if (dmSent) {
                await sock.sendMessage(from, { 
                    text: `⚠️ Couldn't add +${targetNum} directly (likely privacy settings) — sent them an invite link in DM.` 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: `⚠️ Couldn't add +${targetNum} directly or send them a private message. Here is the invite link for them:\n\n${inviteLink}` 
                }, { quoted: msg });
            }
        } catch (e) {
            console.error('❌ [ADD] Invite-link fallback failed:', e.message);
            await sock.sendMessage(from, { 
                text: `❌ Couldn't add +${targetNum} directly, and failed to generate an invite link. Ensure the bot is an admin.` 
            }, { quoted: msg });
        }
    }
};
