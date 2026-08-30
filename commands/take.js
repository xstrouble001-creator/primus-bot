import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { relabelSticker } from '../lib/stickerMeta.js';

const DEFAULT_PACK_NAME = '𝙻 𝚄 𝙿 𝙸 𝙽   𝚇 𝙼 𝙳';
const AUTHOR_NAME = 'Lupin';

export default {
    name: 'take',
    category: 'media',
    aliases: ['wm', 'rename'],
    description: 'Steal a sticker and re-brand its pack name.\nUsage: .take <name>',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mediaMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

        if (!mediaMsg) {
            await sock.sendMessage(context.from, { text: '❌ Please reply to a sticker to rebrand it.\nUsage: .take <name>' }, { quoted: msg });
            return;
        }

        const customName = args.join(' ').trim();
        const packName = customName || DEFAULT_PACK_NAME;

        try {
            const stream = await downloadMediaMessage(
                { message: { stickerMessage: mediaMsg } },
                'buffer',
                {},
                { logger: console }
            );
            const buffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);

            const relabeled = await relabelSticker(buffer, packName, AUTHOR_NAME);
            await sock.sendMessage(context.from, { sticker: relabeled }, { quoted: msg });

        } catch (e) {
            console.error('Take Error:', e);
            await sock.sendMessage(context.from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
        }
    }
};
