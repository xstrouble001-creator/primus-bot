import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';

export default {
    name: 'translate',
    aliases: ['tr', 'translator'],
    description: 'Translate text into a requested language',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

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
        const quotedText = contextInfo?.quotedMessage?.conversation || 
                           contextInfo?.quotedMessage?.extendedTextMessage?.text;

        let targetLang = args[0] || 'English';
        let textToTranslate = quotedText || args.slice(quotedText ? 0 : 1).join(' ');

        if (!quotedText && args.length < 2) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Usage:\n1. Reply to a message with *#tr Spanish*\n2. Or send *#tr Spanish Hello how are you?*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🌐 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙸𝙽𝙶  𝚃𝙴𝚇𝚃...` 
        }, { quoted: msg });

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `You are a professional translator. Automatically detect the language of the input text and translate it into ${targetLang}. Preserve tone and formatting. Return ONLY the translation.\n\nInput text:\n"${textToTranslate}"`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const translationText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚃 𝚁 𝙰 𝙽 𝚂 𝙻 𝙰 𝚃 𝙴 ⚡\n\n` +
                                    `❖──────────【 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙸𝙾𝙽 [${targetLang.toUpperCase()}] 】──────────❖\n` +
                                    `${responseText.trim()}\n` +
                                    `❖─────────────────────────────❖\n\n` +
                                    `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: translationText, edit: sent.key });
        } catch (err) {
            console.error('❌ [TRANSLATE COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Translation Error: ${err.message || 'Failed to translate text.'}` 
            }, { quoted: msg });
        }
    }
};
