import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const quotes = [
    { q: "Any sufficiently advanced technology is indistinguishable from magic.", a: "Arthur C. Clarke" },
    { q: "Code is like humor. When you have to explain it, it’s bad.", a: "Cory House" },
    { q: "Fix the cause, not the symptom.", a: "Steve Maguire" },
    { q: "Simplicity is prerequisite for reliability.", a: "Edsger W. Dijkstra" },
    { q: "The function of good software is to make the complex appear simple.", a: "Grady Booch" },
    { q: "Talk is cheap. Show me the code.", a: "Linus Torvalds" },
    { q: "Programs must be written for people to read, and only incidentally for machines to execute.", a: "Harold Abelson" },
    { q: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", a: "Bill Gates" },
    { q: "Controlling complexity is the essence of computer programming.", a: "Brian Kernighan" },
    { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
    { q: "Experience is the name everyone gives to their mistakes.", a: "Oscar Wilde" },
    { q: "In order to be irreplaceable, one must always be different.", a: "Coco Chanel" },
    { q: "Knowledge is power.", a: "Sir Francis Bacon" },
    { q: "Stay hungry, stay foolish.", a: "Steve Jobs" },
    { q: "The best way to predict the future is to invent it.", a: "Alan Kay" },
    { q: "Make it work, make it right, make it fast.", a: "Kent Beck" },
    { q: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", a: "Antoine de Saint-Exupéry" },
    { q: "Hacking is not about breaking systems; it is about bending them to your will.", a: "Cyber Proverb" },
    { q: "In the digital realm, your mind is your only true firewall.", a: "Primus Core" },
    { q: "The quieter you become, the more you are able to hear.", a: "Anonymous" },
    { q: "There are two ways of constructing a software design: One is to make it so simple that there are obviously no deficiencies, and the other is to make it so complicated that there are no obvious deficiencies.", a: "C.A.R. Hoare" },
    { q: "Optimism is an occupational hazard of programming: feedback is the treatment.", a: "Kent Beck" },
    { q: "Walking on water and developing software from a specification are easy if both are frozen.", a: "Edward V. Berard" },
    { q: "A language that doesn't affect the way you think about programming is not worth knowing.", a: "Alan J. Perlis" },
    { q: "In software, the most difficult part is deciding what not to build.", a: "Unknown" },
    { q: "In a world of automation, code is law.", a: "Cyber Proverb" },
    { q: "Don't comment bad code—rewrite it.", a: "Brian Kernighan" },
    { q: "Before software can be reusable it first has to be usable.", a: "Ralph Johnson" },
    { q: "Nine people can't make a baby in a month.", a: "Fred Brooks" },
    { q: "Good code is its own best documentation.", a: "Steve McConnell" },
    { q: "Every great developer you know got there by solving problems they were unqualified to solve.", a: "Patrick McKenzie" },
    { q: "Trust, but verify inputs.", a: "Security Axiom" },
    { q: "If debugging is the process of removing software bugs, then programming must be the process of putting them in.", a: "Edsger W. Dijkstra" },
    { q: "The computer was born to solve problems that did not exist before.", a: "Bill Gates" },
    { q: "Data is the new oil.", a: "Clive Humby" },
    { q: "Privacy is not about having something to hide, it's about having something to protect.", a: "Edward Snowden" },
    { q: "Security is a process, not a product.", a: "Bruce Schneier" },
    { q: "A secure system is one that is powered off, locked in a safe, and buried in concrete.", a: "Gene Spafford" },
    { q: "There is no patch for stupidity.", a: "Kevin Mitnick" },
    { q: "Passwords are like underwear: don't leave them out, change them often, and never share them with strangers.", a: "Chris Pirillo" },
    { q: "Knowledge speaks, but wisdom listens.", a: "Jimi Hendrix" },
    { q: "Imagination is more important than knowledge.", a: "Albert Einstein" },
    { q: "Do what you can, with what you have, where you are.", a: "Theodore Roosevelt" },
    { q: "Everything you can imagine is real.", a: "Pablo Picasso" },
    { q: "Fall seven times, stand up eight.", a: "Japanese Proverb" },
    { q: "Change your thoughts and you change your world.", a: "Norman Vincent Peale" },
    { q: "The mind is everything. What you think you become.", a: "Buddha" },
    { q: "An unexamined life is not worth living.", a: "Socrates" },
    { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
    { q: "Spread love everywhere you go.", a: "Mother Teresa" }
];

export default {
    name: 'quote',
    category: 'fun',
    description: 'Generates a profound cyber or philosophical quote.\nUsage: .quote',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        const item = quotes[Math.floor(Math.random() * quotes.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚀 𝚄 𝙾 𝚃 𝙴 ⚡\n\n`;
        text += `❖──────────【 𝚃𝙴𝚇𝚃 】──────────❖\n`;
        text += `│ 💬 "${item.q}"\n`;
        text += `│ 👑 ─ *${item.a}*\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
