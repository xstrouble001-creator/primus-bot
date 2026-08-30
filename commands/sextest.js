import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'sextest',
    aliases: ['lusttest'],
    description: 'Check sexual attraction compatibility between two users',
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
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚜𝚎𝚡𝚝𝚎𝚜𝚝 @𝚞𝚜𝚎𝚛𝟷 @𝚞𝚜𝚎𝚛𝟸` 
            }, { quoted: msg });
        }

        const name1 = person1.includes('@s.whatsapp.net') ? `@${person1.split('@')[0]}` : person1;
        const name2 = person2.includes('@s.whatsapp.net') ? `@${person2.split('@')[0]}` : person2;

        const percent = Math.floor(Math.random() * 101);
        const filled = Math.round(percent / 10);
        const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

        let status = '';
        if (percent > 85) status = '🔥 𝚆𝚒𝚕𝚍 & 𝚄𝚗𝚜𝚝𝚘𝚙𝚙𝚊𝚋𝚕𝚎 𝙿𝚊𝚜𝚜𝚒𝚘𝚗!';
        else if (percent > 65) status = '💋 𝙷𝚘𝚝  𝙲𝚑𝚎𝚖𝚒𝚜𝚝𝚛𝚢!';
        else if (percent > 40) status = '🕯️ 𝙽𝚎𝚎𝚍𝚜 𝚊 𝚕𝚒𝚝𝚝𝚕𝚎 𝚜𝚙𝚊𝚛𝚔.';
        else status = '🧊 𝟶% 𝙸𝚗𝚝𝚎𝚛𝚎𝚜𝚝. 𝙸𝚌𝚎 𝙲𝚘𝚕𝚍!';

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        text += `❖──────────【 𝚂 𝙴 𝚇  𝚃 𝙴 𝚂 𝚃 】──────────❖\n`;
        text += `│ 👤 𝙿𝚊𝚛𝚝𝚗𝚎𝚛 𝟷 : ${name1}\n`;
        text += `│ 👤 𝙿𝚊𝚛𝚝𝚗𝚎𝚛 𝟸 : ${name2}\n`;
        text += `│\n`;
        text += `│ 📊 𝚂𝚌𝚘𝚛𝚎    : ${percent}%\n`;
        text += `│ 🔥 𝙿𝚛𝚘𝚐𝚛𝚎𝚜𝚜 : [${progressBar}]\n`;
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
