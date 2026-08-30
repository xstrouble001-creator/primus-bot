import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const answers = [
    "Yes, absolutely.", "Without a doubt, yes.", "Most likely.", "Outlook is good.", "Yes.",
    "Signs point to yes.", "You can rely on it.", "As I see it, yes.", "Definitely.", "Outlook looks promising.",
    "Reply hazy, try again later.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
    "Don't count on it.", "Outlook not so good.", "My sources say no.", "Very doubtful.", "No way.",
    "Absolutely not.", "The cyber matrix says no.", "Unlikely.", "Signs point to failure.", "Chances are slim.",
    "The odds are in your favor.", "Expect a positive anomaly.", "Quantum probabilities suggest yes.", "Decidedly so.", "It is certain.",
    "The data is inconclusive.", "Re-run query with better parameters.", "System error: prophecy overflow. Try again.", "In the cards? Yes.", "Affirmative.",
    "Negative.", "Trust your instincts instead.", "The server refuses to answer.", "Error 404: Answer not found.", "All signs indicate chaos.",
    "Peace and clarity point to yes.", "Doubt clouds this vision.", "The Oracle is sleeping. Try later.", "A surprise victory awaits.", "Failure is guaranteed if hesitant.",
    "Success is compiled and ready.", "Proceed with caution.", "The stars are misaligned.", "Definitely maybe.", "Only time will compile it."
];

export default {
    name: 'oracle',
    aliases: ['8ball'],
    category: 'fun',
    description: 'Consult the digital magic oracle for answers.\nUsage: .oracle <your question>',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        if (!args[0]) {
            await sock.sendMessage(from, { text: '⚡ [ERROR] Please ask the oracle a question.\nUsage: `.oracle Will I hack the mainframe?`' }, { quoted: msg });
            return;
        }
        await sendAnimatedLoader(sock, from, msg);
        const question = args.join(' ');
        const reply = answers[Math.floor(Math.random() * answers.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙾 𝚁 𝙰 𝙲 𝙻 𝙴 ⚡\n\n`;
        text += `❖──────────【 𝚀𝚄𝙴𝚁𝚈 】──────────❖\n`;
        text += `│ ❓ Q: ${question}\n`;
        text += `│ 🔮 A: ${reply}\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
