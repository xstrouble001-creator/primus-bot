import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';

export default {
    name: 'ai',
    aliases: ['gpt', 'ask', 'gemini'],
    description: 'Ask the AI any question or prompt',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const prompt = args.join(' ');

        if (!prompt) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a prompt or question.\n\nExample: *#ai Explain quantum computing in simple terms*` 
            }, { quoted: msg });
        }

        const apiKey = config.geminiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return await sock.sendMessage(from, { 
                text: `❌ Gemini API key is missing. Please add 'geminiKey' to your config.js.` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `📡 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙰 𝙸   𝚃 𝙷 𝙸 𝙽 𝙺 𝙸 𝙽 𝙶...` 
        }, { quoted: msg });

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const aiText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙰 𝙸 ⚡\n\n` +
                           `❖──────────【 𝙰𝙸  𝚁𝙴𝚂𝙿𝙾𝙽𝚂𝙴 】──────────❖\n` +
                           `${responseText.trim()}\n` +
                           `❖─────────────────────────────❖\n\n` +
                           `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: aiText, edit: sent.key });
        } catch (err) {
            console.error('❌ [AI COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ AI Error: ${err.message || 'Failed to generate response.'}` 
            }, { quoted: msg });
        }
    }
};
