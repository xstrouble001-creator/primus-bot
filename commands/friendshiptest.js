import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'friendshiptest',
    aliases: ['friendtest', 'friends'],
    description: 'Check friendship level with a buddy',
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
                text: `❌ 𝚄𝚜𝚊𝚐𝚎: .𝚏𝚛𝚒𝚎𝚗𝚍𝚜𝚑𝚒𝚙𝚝𝚎𝚜𝚝 @𝚞𝚜𝚎𝚛𝟷 @𝚞𝚜𝚎𝚛𝟸` 
            }, { quoted: msg });
        }

        const name1 = person1.includes('@s.whatsapp.net') ? `@${person1.split('@')[0]}` : person1;
        const name2 = person2.includes('@s.whatsapp.net') ? `@${person2.split('@')[0]}` : person2;

        const percent = Math.floor(Math.random() * 101);
        const filled = Math.round(percent / 10);
        const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

        let status = '';
        if (percent > 85) status = '🤝 𝙱𝚎𝚜𝚝 𝙵𝚛𝚒𝚎𝚗𝚍𝚜 𝙵𝚘𝚛𝚎𝚟𝚎𝚛 (𝙱𝙵𝙵)!';
        else if (percent > 65) status = '🤙 𝙻𝚘𝚢𝚊𝚕 & 𝚁𝚎𝚕𝚒𝚊𝚋𝚕𝚎 𝙱𝚞𝚍𝚍𝚒𝚎𝚜!';
        else if (percent > 40) status = '😐 𝙲𝚊𝚜𝚞𝚊𝚕 𝙰𝚌𝚚𝚞𝚊𝚒𝚗𝚝𝚊𝚗𝚌𝚎𝚜.';
        else status = '🐍 𝚂𝚗𝚊𝚔𝚎 𝙰𝚕𝚎𝚛𝚝! 𝚆𝚊𝚝𝚌𝚑 𝚢𝚘𝚞𝚛 𝚋𝚊𝚌𝚔!';

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        text += `❖────────【 𝙵𝚁𝙸𝙴𝙽𝙳𝚂𝙷𝙸𝙿  𝚃𝙴𝚂𝚃 】────────❖\n`;
        text += `│ 👥 𝙵𝚛𝚒𝚎𝚗𝚍 𝟷 : ${name1}\n`;
        text += `│ 👥 𝙵𝚛𝚒𝚎𝚗𝚍 𝟸 : ${name2}\n`;
        text += `│\n`;
        text += `│ 📊 𝚂𝚌𝚘𝚛𝚎    : ${percent}%\n`;
        text += `│ 🤝 𝙿𝚛𝚘𝚐𝚛𝚎𝚜𝚜 : [${progressBar}]\n`;
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
