import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'lovetest',
    aliases: ['lovecalculator', 'love'],
    description: 'Calculate love compatibility between two users or names',
    category: 'fun',
    execute: async (sock, msg, args, context) => {
        const { from, sender } = context;
        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let person1 = sender;
        let person2 = null;

        if (mentions.length >= 2) {
            person1 = mentions[0];
            person2 = mentions[1];
        } else if (mentions.length === 1) {
            person2 = mentions[0];
        } else if (args.length >= 2) {
            person1 = args[0];
            person2 = args[1];
        } else if (args.length === 1) {
            person2 = args[0];
        }

        if (!person2) {
            await sock.sendMessage(from, { delete: loaderKey });
            return sock.sendMessage(from, { 
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚕𝚘𝚟𝚎𝚝𝚎𝚜𝚝 @𝚞𝚜𝚎𝚛𝟷 @𝚞𝚜𝚎𝚛𝟸 𝚘𝚛 .𝚕𝚘𝚟𝚎𝚝𝚎𝚜𝚝 [𝙽𝚊𝚖𝚎𝟷] [𝙽𝚊𝚖𝚎𝟸]` 
            }, { quoted: msg });
        }

        const name1 = person1.includes('@s.whatsapp.net') ? `@${person1.split('@')[0]}` : person1;
        const name2 = person2.includes('@s.whatsapp.net') ? `@${person2.split('@')[0]}` : person2;

        const percent = Math.floor(Math.random() * 101);
        const filled = Math.round(percent / 10);
        const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

        let status = '';
        if (percent > 85) status = '💞 𝚂𝚘𝚞𝚕𝚖𝚊𝚝𝚎𝚜! 𝙼𝚊𝚍𝚎 𝚒𝚗 𝙷𝚎𝚊𝚟𝚎𝚗!';
        else if (percent > 65) status = '❤️ 𝚂𝚝𝚛𝚘𝚗𝚐 𝙲𝚑𝚎𝚖𝚒𝚜𝚝𝚛𝚢 & 𝙳𝚎𝚎𝚙 𝙱𝚘𝚗𝚍!';
        else if (percent > 40) status = '💛 𝙳𝚎𝚌𝚎𝚗𝚝 𝙼𝚊𝚝𝚌𝚑, 𝚗𝚎𝚎𝚍𝚜 𝚠𝚘𝚛𝚔.';
        else status = '💔 𝚃𝚘𝚡𝚒𝚌 𝙲𝚘𝚖𝚋𝚘. 𝚁𝚞𝚗 𝚊𝚠𝚊𝚢!';

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        text += `❖──────────【 𝙻𝙾𝚅𝙴  𝚃𝙴𝚂𝚃 】──────────❖\n`;
        text += `│ 👤 𝙿𝚊𝚛𝚝𝚗𝚎𝚛 𝟷 : ${name1}\n`;
        text += `│ 👤 𝙿𝚊𝚛𝚝𝚗𝚎𝚛 𝟸 : ${name2}\n`;
        text += `│\n`;
        text += `│ 📊 𝚂𝚌𝚘𝚛𝚎    : ${percent}%\n`;
        text += `│ 💖 𝙿𝚛𝚘𝚐𝚛𝚎𝚜𝚜 : [${progressBar}]\n`;
        text += `│ 💬 𝚅𝚎𝚛𝚍𝚒𝚌𝚝  : ${status}\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        const allMentions = [
            ...(person1.includes('@s.whatsapp.net') ? [person1] : []),
            ...(person2.includes('@s.whatsapp.net') ? [person2] : [])
        ];

        await sock.sendMessage(from, { delete: loaderKey });
        await sock.sendMessage(from, { text, mentions: allMentions }, { quoted: msg });
    }
};
