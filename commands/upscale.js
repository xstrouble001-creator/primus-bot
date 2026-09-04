import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: 'upscale',
    aliases: ['enhance', 'hd'],
    description: 'Enhance image quality and resolution',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

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
                text: `⚠️ Please attach or reply to an image with *#upscale*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🔍 𝚄𝙿𝚂𝙲𝙰𝙻𝙸𝙽𝙶  𝙸𝙼𝙰𝙶𝙴...` 
        }, { quoted: msg });

        try {
            const stream = await downloadContentFromMessage(targetImageMsg, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const formData = new FormData();
            formData.append('image', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

            const uploadRes = await axios.post('https://telegra.ph/upload', formData, {
                headers: formData.getHeaders()
            });

            if (!uploadRes.data?.[0]?.src) {
                throw new Error('Failed to process image buffer.');
            }

            const imageUrl = 'https://telegra.ph' + uploadRes.data[0].src;
            const upscaleUrl = `https://api.vyturex.com/upscale?url=${encodeURIComponent(imageUrl)}`;

            const response = await axios.get(upscaleUrl, { responseType: 'arraybuffer', timeout: 45000 });
            const resultBuffer = Buffer.from(response.data, 'binary');

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚄 𝙿 𝚂 𝙲 𝙰 𝙻 𝙴 ⚡\n\n` +
                                `❖──────────【 𝙴𝙽𝙷𝙰𝙽𝙲𝙴𝙳 】──────────❖\n` +
                                `│ 🔍 Status : Resolution & clarity increased\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: resultBuffer, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [UPSCALE COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Upscale Error: ${err.message || 'Failed to enhance image.'}` 
            }, { quoted: msg });
        }
    }
};
