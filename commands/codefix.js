import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';

export default {
    name: 'codefix',
    aliases: ['fixcode', 'debug', 'refactor'],
    description: 'Fix errors and improve code snippets',
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

        const codeToFix = quotedText || args.join(' ');

        if (!codeToFix) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a code snippet or reply to a message containing code with *#codefix*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🛠️ 𝙰𝙽𝙰𝙻𝚈𝚉𝙸𝙽𝙶  𝙰𝙽𝙳  𝙵𝙸𝚇𝙸𝙽𝙶  𝙲𝙾𝙳𝙴...` 
        }, { quoted: msg });

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `You are an expert software engineer. Review the following code snippet. Fix all syntax, logical, and runtime errors. Provide the corrected code along with a brief explanation of the changes made.\n\nCode Snippet:\n\`\`\`\n${codeToFix}\n\`\`\``;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const resultText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙲 𝙾 𝙳 𝙴 𝙵 𝙸 𝚇 ⚡\n\n` +
                               `❖──────────【 𝙲𝙾𝙳𝙴  𝙰𝙽𝙰𝙻𝚈𝚂𝙸𝚂 】──────────❖\n` +
                               `${responseText.trim()}\n` +
                               `❖─────────────────────────────❖\n\n` +
                               `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: resultText, edit: sent.key });
        } catch (err) {
            console.error('❌ [CODEFIX COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Codefix Error: ${err.message || 'Failed to process code.'}` 
            }, { quoted: msg });
        }
    }
};
