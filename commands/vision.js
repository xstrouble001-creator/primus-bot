import { GoogleGenerativeAI } from '@google/generative-ai';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import config from '../config.js';

export default {
    name: 'vision',
    aliases: ['analyze', 'look', 'describe'],
    description: 'Analyze an attached or quoted image using Gemini Vision',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const prompt = args.join(' ') || 'Describe this image in detail.';

        const apiKey = config.geminiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return await sock.sendMessage(from, { 
                text: `❌ Gemini API key is missing. Please add 'geminiKey' to your config.js.` 
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
                text: `⚠️ Please attach or reply to an image with *#vision*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `👁️ 𝙰𝙽𝙰𝙻𝚈𝚉𝙸𝙽𝙶  𝙸𝙼𝙰𝙶𝙴...` 
        }, { quoted: msg });

        try {
            const stream = await downloadContentFromMessage(targetImageMsg, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const imagePart = {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: targetImageMsg.mimetype || 'image/jpeg'
                }
            };

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            const visionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚅 𝙸 𝚂 𝙸 𝙾 𝙽 ⚡\n\n` +
                               `❖──────────【 𝙰𝙽𝙰𝙻𝚈𝚂𝙸𝚂 】──────────❖\n` +
                               `${responseText.trim()}\n` +
                               `❖─────────────────────────────❖\n\n` +
                               `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: visionText, edit: sent.key });
        } catch (err) {
            console.error('❌ [VISION COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Vision Analysis Error: ${err.message || 'Failed to process image.'}` 
            }, { quoted: msg });
        }
    }
};
