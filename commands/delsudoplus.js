import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'delsudoplus',
    aliases: ['delsudo+'],
    category: 'settings',
    desc: 'Revoke full owner-level access from a user (Host Number Only)',
    execute: async (sock, msg, args, context) => {
        const { from, sender } = context;

        // Strictly verify that the sender IS the host account itself
        const botOwnerJid = sock.user?.id || '';
        const botNumber = botOwnerJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        const senderNum = sender.split('@')[0].replace(/[^0-9]/g, '');

        const isLinkedDevice = msg.key.fromMe || senderNum === botNumber;

        if (!isLinkedDevice) {
            await sock.sendMessage(from, { 
                text: '❌ *Access Denied:* Only the primary linked device host account can execute #delsudo+.' 
            }, { quoted: msg });
            return;
        }

        // Determine target number via tag, reply, or raw string argument
        let target = '';
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (mentionedJid) {
            target = mentionedJid.split('@')[0];
        } else if (quotedParticipant) {
            target = quotedParticipant.split('@')[0];
        } else if (args[0]) {
            target = args[0].replace(/[^0-9]/g, '');
        }

        if (!target) {
            await sock.sendMessage(from, { 
                text: '⚠️ *Usage:* `#delsudo+ @user` or reply to a message with `#delsudo+`' 
            }, { quoted: msg });
            return;
        }

        const settings = loadSettings() || {};
        if (!Array.isArray(settings.owners)) {
            settings.owners = [];
        }

        if (!settings.owners.includes(target)) {
            await sock.sendMessage(from, { 
                text: `⚠️ @${target} is not in the Owner database list.`,
                mentions: [`${target}@s.whatsapp.net`] 
            }, { quoted: msg });
            return;
        }

        // Prevent self-demotion of the current host number
        if (target === botNumber) {
            await sock.sendMessage(from, { 
                text: '❌ *Action Blocked:* You cannot remove full owner access from the active host account.' 
            }, { quoted: msg });
            return;
        }

        // Remove user from Owners array
        settings.owners = settings.owners.filter(n => n !== target);
        saveSettings(settings);

        await sock.sendMessage(from, { 
            text: `🔻 *OWNER ACCESS REVOKED*\n\nUser @${target} has been removed from the Owners list and no longer has unrestricted access.`,
            mentions: [`${target}@s.whatsapp.net`]
        }, { quoted: msg });
    }
};
