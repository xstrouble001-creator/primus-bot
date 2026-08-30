import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { loadSettings } from '../lib/database.js';
import config from '../config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
    name: 'vvs',
category: 'media',
    description: 'Stealth decrypt View-Once, forward to owner DM, and purge with animation',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = msg.message?.extendedTextMessage?.contextInfo;
        
        const viewOnce = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message || quoted;
        const mediaMsg = viewOnce?.imageMessage || viewOnce?.videoMessage;

        if (!mediaMsg) {
            await sock.sendMessage(context.from, { text: '⚡ [ERROR] Please reply to a View-Once media with `.vvs`' }, { quoted: msg });
            return;
        }

        try {
            const { key } = await sock.sendMessage(context.from, { text: '🛡️ [STEALTH INIT] Engaging ghost protocol...' }, { quoted: msg });
            await sleep(800);
            await sock.sendMessage(context.from, { text: '🕶️ [INTERCEPTING] Siphoning payload to secure DM [█████░░░░░] 50%', edit: key });
            await sleep(800);
            await sock.sendMessage(context.from, { text: '🔥 [PURGING] Erasing footprints from sector [██████████] 100%', edit: key });

            const stream = await downloadMediaMessage(
                { message: { [viewOnce.imageMessage ? 'imageMessage' : 'videoMessage']: mediaMsg } },
                'buffer',
                {},
                { logger: console }
            );

            const buffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
            const caption = `🛡️ [STEALTH INTERCEPT] Secured from: ${context.pushName || 'Unknown'}\n💬 Caption: ${mediaMsg.caption || 'None'}`;

            const botOwnerJid = sock.user?.id || '';
            const botNumber = botOwnerJid.split(':')[0].split('@')[0];
            const settings = loadSettings() || {};
            const ownerNum = (settings.owners?.[0] || config.ownerNumber?.[0] || botNumber).replace(/[^0-9]/g, '');
            const ownerJid = `${ownerNum}@s.whatsapp.net`;

            if (mediaMsg.imageMessage || viewOnce.imageMessage) {
                await sock.sendMessage(ownerJid, { image: buffer, caption });
            } else {
                await sock.sendMessage(ownerJid, { video: buffer, caption, mimetype: 'video/mp4' });
            }

            if (quotedKey && quotedKey.stanzaId) {
                await sock.sendMessage(context.from, {
                    delete: {
                        remoteJid: context.from,
                        fromMe: false,
                        id: quotedKey.stanzaId,
                        participant: quotedKey.participant
                    }
                }).catch(() => {});
            }

            await sock.sendMessage(context.from, { delete: key }).catch(() => {});
            await sock.sendMessage(context.from, { text: '🔒 [STEALTH COMPLETE] View-Once secured in owner DM and incinerated from chat.' }, { quoted: msg });

        } catch (e) {
            console.error('VVS Error:', e);
            await sock.sendMessage(context.from, { text: `❌ [STEALTH FAILED]: ${e.message}` }, { quoted: msg });
        }
    }
};
