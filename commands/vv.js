import { downloadMediaMessage } from '@whiskeysockets/baileys';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
    name: 'vv',
category: 'media',
    description: 'Decrypt and reveal View-Once media in chat with cyber loading sequence',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const viewOnce = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message || quoted;
        const mediaMsg = viewOnce?.imageMessage || viewOnce?.videoMessage;

        if (!mediaMsg) {
            await sock.sendMessage(context.from, { text: '⚡ [ERROR] Please reply to a View-Once image or video with `.vv`' }, { quoted: msg });
            return;
        }

        try {
            // Cyber loading animation sequence
            const { key } = await sock.sendMessage(context.from, { text: '🔄 [INIT] Connecting to neural socket...' }, { quoted: msg });
            await sleep(800);
            await sock.sendMessage(context.from, { text: '⚡ [DECRYPTING] Bypassing View-Once encryption firewall [██░░░░░░░░] 20%', edit: key });
            await sleep(800);
            await sock.sendMessage(context.from, { text: '🌀 [EXTRACTING] Rerouting data streams [██████░░░░] 60%', edit: key });
            await sleep(800);
            await sock.sendMessage(context.from, { text: '🔓 [SUCCESS] Payload decrypted. Injecting media...', edit: key });

            const stream = await downloadMediaMessage(
                { message: { [viewOnce.imageMessage ? 'imageMessage' : 'videoMessage']: mediaMsg } },
                'buffer',
                {},
                { logger: console }
            );

            const buffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
            const caption = mediaMsg.caption || `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝚅𝙸𝙴𝚆-𝙾𝙽𝙲𝙴 𝙳𝙴𝙲𝚁𝚈𝙿𝚃𝙴𝙳 】──────────❖\n` +
`│ ⚡ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝚄𝙽𝙻𝙾𝙲𝙺𝙴𝙳\n` +
`│ 🔓 𝙼𝚘𝚍𝚎        : 𝚅𝚒𝚎𝚠-𝙾𝚗𝚌𝚎\n` +
`│ 🤖 𝙴𝚗𝚐𝚒𝚗𝚎      : 𝙿𝚁𝙸𝙼𝚄𝚂 𝙼𝙳\n` +
`❖─────────────────────────────❖`;;

            if (mediaMsg.imageMessage || viewOnce.imageMessage) {
                await sock.sendMessage(context.from, { image: buffer, caption }, { quoted: msg });
            } else {
                await sock.sendMessage(context.from, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: msg });
            }

            // Clean up loading message
            await sock.sendMessage(context.from, { delete: key }).catch(() => {});

        } catch (e) {
            console.error('VV Error:', e);
            await sock.sendMessage(context.from, { text: `❌ [DECRYPTION FAILED]: ${e.message}` }, { quoted: msg });
        }
    }
};
