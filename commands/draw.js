import axios from 'axios';

export default {
    name: 'draw',
    aliases: ['imagine', 'genimage', 'aiart'],
    description: 'Generate an image from text using AI',
    category: 'ai',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const prompt = args.join(' ');

        if (!prompt) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a detailed description for the image.\n\nExample: *#draw A futuristic city in cyberpunk style, highly detailed 8k*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🎨 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙸𝙽𝙶  𝙰𝙸  𝙸𝙼𝙰𝙶𝙴...` 
        }, { quoted: msg });

        try {
            const seed = Math.floor(Math.random() * 1000000);
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=flux`;

            const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
            const imageBuffer = Buffer.from(response.data, 'binary');

            const captionText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙳 𝚁 𝙰 𝚆 ⚡\n\n` +
                                `❖──────────【 𝙰𝙸  𝙸𝙼𝙰𝙶𝙴 】──────────❖\n` +
                                `│ 🎨 𝙿𝚛𝚘𝚖𝚙𝚝 : ${prompt}\n` +
                                `❖─────────────────────────────❖\n\n` +
                                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
            await sock.sendMessage(from, { image: imageBuffer, caption: captionText }, { quoted: msg });
        } catch (err) {
            console.error('❌ [DRAW COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Image Generation Error: ${err.message || 'Failed to render image.'}` 
            }, { quoted: msg });
        }
    }
};
