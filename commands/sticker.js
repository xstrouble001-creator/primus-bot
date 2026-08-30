import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const PACK_NAME = '𝙻 𝚄 𝙿 𝙸 𝙽   𝚇 𝙼 𝙳';
const AUTHOR_NAME = 'Lupin';

export default {
    name: 'sticker',
    category: 'media',
    aliases: ['s'],
    description: 'Convert replied image or video into a sticker',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        let targetMessage = null;
        if (msg.message?.imageMessage || msg.message?.videoMessage) {
            targetMessage = msg;
        } else if (quoted && (quoted.imageMessage || quoted.videoMessage || quoted.documentMessage)) {
            targetMessage = { message: quoted };
        }

        if (!targetMessage) {
            await sock.sendMessage(context.from, { text: '❌ Please reply to an image or video with `.s` to convert it into a sticker.' }, { quoted: msg });
            return;
        }

        try {
            const stream = await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                { logger: console, reuploadRequest: sock.updateMediaMessage }
            );
            const buffer = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);

            const sticker = new Sticker(buffer, {
                pack: PACK_NAME,
                author: AUTHOR_NAME,
                type: StickerTypes.FULL,
                quality: 70
            });

            const webpBuffer = await sticker.toBuffer();
            await sock.sendMessage(context.from, { sticker: webpBuffer }, { quoted: msg });

        } catch (e) {
            console.error('Sticker Error:', e);
            await sock.sendMessage(context.from, { text: `❌ Error: ${e.message}` }, { quoted: msg });
        }
    }
};
