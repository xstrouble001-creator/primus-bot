import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

export default {
    name: 'toimg',
    aliases: ['image'],
    description: 'Convert sticker to image',
    category: 'media',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const unwrapMsg = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message;
        const quoted = unwrapMsg?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = quoted || unwrapMsg;

        if (!targetMessage?.stickerMessage) {
            return await sock.sendMessage(from, { text: '⚡ Reply to a static sticker to convert it to an image.' }, { quoted: msg });
        }

        const tmpId = crypto.randomBytes(6).toString('hex');
        const inputPath = path.resolve(`./tmp_${tmpId}.webp`);
        const outputPath = path.resolve(`./tmp_${tmpId}.png`);

        try {
            const stream = await downloadContentFromMessage(targetMessage.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            fs.writeFileSync(inputPath, buffer);

            execSync(`ffmpeg -i "${inputPath}" "${outputPath}"`);

            const imageBuffer = fs.readFileSync(outputPath);
            await sock.sendMessage(from, { image: imageBuffer, caption: '⚡ Converted by Lupin xmd' }, { quoted: msg });

        } catch (err) {
            console.error('❌ [TOIMG ERROR]:', err);
            await sock.sendMessage(from, { text: '❌ Failed to convert sticker to image.' }, { quoted: msg });
        } finally {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
    }
};
