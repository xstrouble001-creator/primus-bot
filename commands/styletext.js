export default {
    name: 'styletext',
    aliases: ['frame', 'bannertext', 'boxtext'],
    description: 'Format text into aesthetic banners and framed borders',
    category: 'stylish hub',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const mType = Object.keys(msg.message || {})[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage') 
            ? msg.message[mType].message 
            : msg.message;

        const contextInfo = unwrap?.extendedTextMessage?.contextInfo;
        const quotedText = contextInfo?.quotedMessage?.conversation || 
                           contextInfo?.quotedMessage?.extendedTextMessage?.text;

        const input = args.join(' ') || quotedText;

        if (!input) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide text to frame.\n\nExample: *#styletext Primus Bot*` 
            }, { quoted: msg });
        }

        const upper = input.toUpperCase();

        const banner1 = `❖──────────【 ${upper} 】──────────❖`;
        const banner2 = `╔═════════════════════════╗\n   ${upper}\n╚═════════════════════════╝`;
        const banner3 = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂 │ ${upper} ⚡`;

        const resultText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚂 𝚃 𝚈 𝙻 𝙴 𝚁 ⚡\n\n` +
                           `Style 1:\n${banner1}\n\n` +
                           `Style 2:\n${banner2}\n\n` +
                           `Style 3:\n${banner3}\n\n` +
                           `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: resultText.trim() }, { quoted: msg });
    }
};
