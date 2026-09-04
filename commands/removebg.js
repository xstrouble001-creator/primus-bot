import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import config from '../config.js';

export default {
    name: 'removebg',
    aliases: ['rmbg', 'nobg'],
    description: 'Remove background from an image',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const apiKey = config.removebgKey || process.env.REMOVEBG_API_KEY;
        if (!apiKey) {
            return await sock.sendMessage(from, { 
                text: `❌ Remove.bg API key is missing. Please add 'removebgKey' to your config.js.` 
            }, { quoted: msg });
        }

        const mType = Object.keys(msg.message || {})[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage') 
            ? msg.message[mType].message 
            : msg.message;

        const contextInfo = unwrap?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const quotedType = quotedMsg ? Object.keys(quotedMsg)[0] : null;

        let targetImageMsg = null;
        if (unwrap?.imageMessage) {
            targetImageMsg = unwrap.imageMessage;
        } else if (quotedType === 'imageMessage') {
            targetImageMsg = quotedMsg.imageMessage;
        } else if (quotedType === 'viewOnceMessage' || quotedType === 'ephemeralMessage') {
            targetImageMsg = quotedMsg[quotedType]?.message?.imageMessage;
        }

        if (!targetImageMsg) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please attach or reply to an image with *#removebg*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `✂️ 𝚁𝙴𝙼𝙾𝚅𝙸𝙽𝙶  𝙱𝙰𝙲𝙺𝙶𝚁𝙾𝚄𝙽𝙳...` 
        }, { quoted: msg });

        try {
            const stream = await downloadContentFromMessage(targetImageMsg, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const formData = new FormData();
            formData.append('image_file', buffer, { filename: 'input.png', contentType: 'image/png' });
            formData.append('size', 'auto');

            const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'X-Api-Key': apiKey
                },
                responseType: 'arraybuffer'
            });

            const resultBuffer = Buffer.from(response.data);

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚁 𝙴 𝙼 𝙾 𝚅 𝙴 𝙱 𝙶 ⚡\n\n` +
                                `❖──────────【 𝙱𝙶  𝚁𝙴𝙼𝙾𝚅𝙴𝙳 】──────────❖\n` +
                                `│ ✂️ Status : Background successfully stripped\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: resultBuffer, caption: captionText, mimetype: 'image/png' }, { quoted: msg });
        } catch (err) {
            console.error('❌ [REMOVEBG COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ RemoveBG Error: ${err.response?.data ? err.response.data.toString() : err.message}` 
            }, { quoted: msg });
        }
    }
};
