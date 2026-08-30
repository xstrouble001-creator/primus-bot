import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const truths = [
    "What is the most embarrassing thing in your web search history right now?",
    "If you could swap lives with anyone in this group for one day, who would it be?",
    "What is a secret you’ve never told your parents?",
    "What was your most awkward romantic moment?",
    "If you had to delete all apps on your phone except one, which one stays?",
    "What is the weirdest food combination you secretly love eating?",
    "Have you ever practiced a speech in front of a mirror? What about?",
    "What is the silliest lie you ever told to get out of trouble?",
    "If you woke up with invisibility tomorrow, what is the first thing you would do?",
    "What is your most irrational and weirdest fear?",
    "What was the last thing you cried about?",
    "Who was your very first crush in life?",
    "What is a habit you have that you find totally disgusting?",
    "If you won a million dollars today, what is the very first luxury item you'd buy?",
    "What is the most childish thing you still do as an adult?",
    "Have you ever pretended to be asleep to avoid talking to someone?",
    "What is the worst gift you have ever received?",
    "What song do you secretly sing when you are completely alone in the shower?",
    "If you could time travel, would you go to the past or the future?",
    "What is the strangest dream you remember having recently?",
    "What was your most epic fail while cooking or baking?",
    "Have you ever talked to yourself out loud in public? What did you say?",
    "What is the most useless skill you possess?",
    "If you were a character in a movie, would you be the hero, villain, or comic relief?",
    "What is the longest you've ever gone without sleeping and why?",
    "What is something you bought and instantly regretted?",
    "If animals could talk, which species do you think would be the rudest?",
    "What is your go-to excuse when you don't want to leave your house?",
    "Have you ever sent a text to the wrong person? What happened?",
    "What is the most daring thing you've ever done in your life?",
    "If you could instantly master any skill without practicing, what would it be?",
    "What is your favorite guilty pleasure TV show or movie?",
    "What is the weirdest nickname you've ever been given?",
    "If you could have any superpower but with a minor inconvenience, what would it be?",
    "What is the funniest misunderstanding you've ever experienced?",
    "What is the most adventurous food you have ever tasted?",
    "If you were stranded on a deserted island, which fictional character would you want with you?",
    "What is the most expensive mistake you've ever made?",
    "What is a trend you participated in that you now look back and cringe at?",
    "If your phone could talk, what secret would it reveal about you first?",
    "What is the strangest place you've ever fallen asleep in?",
    "What is something you believed for way too long as a child?",
    "If you could rename yourself, what name would you choose?",
    "What is the best piece of advice you've ever ignored?",
    "What is your ultimate dream project if time and money were infinite?",
    "If you had to wear one outfit for the rest of your life, what would it look like?",
    "What is the most touching compliment you've ever received?",
    "What is your definition of true happiness?",
    "If you could add any command to Primus MD right now, what would it do?",
    "What is the most memorable prank you've ever pulled on someone?"
];

export default {
    name: 'truth',
    category: 'fun',
    description: 'Asks a revealing or fun truth question.\nUsage: .truth',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        const truth = truths[Math.floor(Math.random() * truths.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚃 𝚁 𝚄 𝚃 𝙷 ⚡\n\n`;
        text += `❖──────────【 𝚀𝚄𝙴𝚂𝚃𝙸𝙾𝙽 】──────────❖\n`;
        text += `│ 🎯 Target: @${msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0]}\n`;
        text += `│ 💡 Truth: ${truth}\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text, mentions: [msg.key.participant || msg.key.remoteJid] }, { quoted: msg });
    }
};
