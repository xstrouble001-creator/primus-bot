import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import config from '../config.js';

export default {
    name: 'transcribe',
    aliases: ['stt', 'audio2text', 'listen'],
    description: 'Transcribe a voice note or audio file into text',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const apiKey = config.openaiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return await sock.sendMessage(from, { 
                text: `❌ OpenAI API key is missing. Please add 'openaiKey' to your config.js.` 
            }, { quoted: msg });
        }

        const mType = Object.keys(msg.message || {})[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage') 
            ? msg.message[mType].message 
            : msg.message;

        const contextInfo = unwrap?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const quotedType = quotedMsg ? Object.keys(quotedMsg)[0] : null;

        let targetAudioMsg = null;
        if (unwrap?.audioMessage) {
            targetAudioMsg = unwrap.audioMessage;
        } else if (quotedType === 'audioMessage') {
            targetAudioMsg = quotedMsg.audioMessage;
        }

        if (!targetAudioMsg) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please attach or reply to a voice note/audio file with *#transcribe*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🎙️ 𝚃𝚁𝙰𝙽𝚂𝙲𝚁𝙸𝙱𝙸𝙽𝙶  𝙰𝚄𝙳𝙸𝙾...` 
        }, { quoted: msg });

        try {
            const stream = await downloadContentFromMessage(targetAudioMsg, 'audio');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const formData = new FormData();
            formData.append('file', buffer, { filename: 'audio.ogg', contentType: targetAudioMsg.mimetype || 'audio/ogg' });
            formData.append('model', 'whisper-1');

            const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const transcript = response.data?.text || 'No speech detected.';

            const resultText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚃 𝚁 𝙰 𝙽 𝚂 𝙲 𝚁 𝙸 𝙱 𝙴 ⚡\n\n` +
                               `❖──────────【 𝚃𝚁𝙰𝙽𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽 】──────────❖\n` +
                               `${transcript.trim()}\n` +
                               `❖─────────────────────────────❖\n\n` +
                               `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: resultText, edit: sent.key });
        } catch (err) {
            console.error('❌ [TRANSCRIBE COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Transcription Error: ${err.response?.data?.error?.message || err.message || 'Failed to process audio.'}` 
            }, { quoted: msg });
        }
    }
};
