import gtts from 'gtts';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';

export default {
    name: 'say',
    description: 'Convert text to a natural voice note',
    execute: async (sock, msg, args, context) => {
        const text = args.join(' ');
        if (!text) {
            await sock.sendMessage(context.from, { text: '❌ Please provide text for the bot to speak.\nExample: `.say Hello everyone!`' }, { quoted: msg });
            return;
        }

        const id = crypto.randomBytes(4).toString('hex');
        const mp3File = path.join('./', `tts_${id}.mp3`);
        const oggFile = path.join('./', `tts_${id}.ogg`);
        
        const speech = new gtts(text, 'en');
        
        speech.save(mp3File, async (err) => {
            if (err) {
                await sock.sendMessage(context.from, { text: '❌ Failed to generate voice note.' }, { quoted: msg });
                return;
            }

            // Convert mp3 to opus/ogg format for WhatsApp voice note compatibility
            exec(`ffmpeg -i ${mp3File} -c:a libopus -b:a 64k -vbr on ${oggFile}`, async (error) => {
                try {
                    if (error || !fs.existsSync(oggFile)) {
                        await sock.sendMessage(context.from, { text: '❌ Audio conversion failed.' }, { quoted: msg });
                        return;
                    }

                    await sock.sendMessage(context.from, {
                        audio: fs.readFileSync(oggFile),
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                    }, { quoted: msg });

                } catch (e) {
                    console.error('TTS Send Error:', e);
                } finally {
                    if (fs.existsSync(mp3File)) fs.unlinkSync(mp3File);
                    if (fs.existsSync(oggFile)) fs.unlinkSync(oggFile);
                }
            });
        });
    }
};
