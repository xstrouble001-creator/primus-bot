import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'tovid',
    aliases: ['tomp4'],
    description: 'Convert an animated sticker into an MP4 video payload',
    category: 'media',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!quoted || !quoted.stickerMessage) {
            return sock.sendMessage(from, { text: '⚠️ Reply to an animated sticker with .tovid' }, { quoted: msg });
        }

        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        const stickerData = quoted.stickerMessage;
        const timestamp = Date.now();
        const tmpIn = path.resolve(`./${timestamp}_in.webp`);
        const tmpFramePattern = path.resolve(`./${timestamp}_frame_%03d.png`);
        const tmpOut = path.resolve(`./${timestamp}_out.mp4`);

        try {
            console.log('⚡ [TOVID DEBUG] Extracting sticker stream...');
            const stream = await downloadContentFromMessage(stickerData, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            fs.writeFileSync(tmpIn, buffer);
            console.log(`⚡ [TOVID DEBUG] File saved to ${tmpIn}. Extracting frames with ImageMagick...`);

            // Step 1: Decode animated WebP into PNG frames
            const magickCmd = `magick "${tmpIn}" "${tmpFramePattern}"`;

            exec(magickCmd, (magickErr) => {
                if (magickErr) {
                    console.error('❌ [MAGICK ERROR]:', magickErr.message);
                    cleanupTempFiles(timestamp);
                    return sock.sendMessage(from, { text: '❌ Failed to decode WebP frames.', edit: loaderKey });
                }

                console.log('⚡ [TOVID DEBUG] Frames extracted. Rendering MP4 with FFmpeg...');

                // Step 2: Stitch frames into x264 MP4
                const ffmpegCmd = `ffmpeg -framerate 15 -i "${tmpFramePattern}" -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -movflags +faststart -y "${tmpOut}"`;

                exec(ffmpegCmd, async (ffmpegErr, stdout, stderr) => {
                    if (ffmpegErr || !fs.existsSync(tmpOut)) {
                        console.error('❌ [FFMPEG ERROR OUTPUT]:', stderr || ffmpegErr?.message);
                        cleanupTempFiles(timestamp);
                        return sock.sendMessage(from, { text: '❌ Conversion failed during MP4 encoding.', edit: loaderKey });
                    }

                    console.log('⚡ [TOVID DEBUG] Conversion successful. Sending video payload...');
                    await sock.sendMessage(from, { video: fs.readFileSync(tmpOut), caption: '⚡ Converted by Primus Md' }, { quoted: msg });

                    cleanupTempFiles(timestamp);
                });
            });
        } catch (e) {
            console.error('❌ [STREAM ERROR]:', e);
            cleanupTempFiles(timestamp);
            sock.sendMessage(from, { text: '❌ Failed to download sticker stream.', edit: loaderKey });
        }
    }
};

function cleanupTempFiles(timestamp) {
    const files = fs.readdirSync(path.resolve('./')).filter(file => file.startsWith(`${timestamp}_`));
    for (const file of files) {
        try {
            fs.unlinkSync(path.resolve(`./${file}`));
        } catch (_) {}
    }
}
