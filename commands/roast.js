import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const roasts = [
    "You're the human equivalent of a 404 Not Found error.",
    "If common sense was software, you'd be running on Windows 95 with zero updates.",
    "Your code probably looks like a bowl of ramen noodles written by a caffeinated raccoon.",
    "Even a corrupted database has more structure than your life choices.",
    "You bring about as much joy to a room as an unhandled exception in production.",
    "If ignorance was currency, you'd be a billionaire Silicon Valley tech mogul.",
    "Your internet connection is faster than your brain processing speed.",
    "You compile slower than C++ code on a calculator.",
    "Even spam emails are more interesting than your conversation.",
    "You're like a cloud backup with zero storage left and corrupted files.",
    "Your thought process is slower than dial-up internet on a rainy day.",
    "You're the reason manufacturers put warning labels on shampoo bottles.",
    "If laziness was an Olympic sport, you'd still find a way to finish in second place.",
    "Your debugging strategy is just crying until the error magically disappears.",
    "You have the charisma of a burnt-out motherboard.",
    "Even a broken clock is right twice a day; too bad your logic isn't.",
    "You're like an infinite loop with no base condition—completely pointless.",
    "Your brain cells are fighting for third place.",
    "You type like you're trying to punch your keyboard to death.",
    "If your personality was a website, it would be blocked by every antivirus.",
    "You're the human version of a low battery warning that won't go away.",
    "Your secrets are safe with me because I never even listen to you.",
    "You look like you explain movie plots while people are watching them.",
    "Your jokes are drier than unmoisturized server cooling fans.",
    "Even AI would refuse to generate a response to your nonsense.",
    "You're the exact reason aliens refuse to visit Earth.",
    "Your posture looks like a bent paperclip desperately asking for help.",
    "You argue like you skipped kindergarten and elementary school.",
    "If cluelessness was a superpower, you'd rule the universe.",
    "You're like an expired security certificate—completely untrusted.",
    "Your decision-making skills are worse than JavaScript type coercion.",
    "You look like you try to pull doors that clearly say 'PUSH'.",
    "Your vibe is giving major 'forgot to save my homework before crash' energy.",
    "Even dark mode can't save how dim your ideas are.",
    "You're like a USB plug—you always fail on the first three tries.",
    "Your problem-solving skills belong in the recycle bin.",
    "You talk so much even your own shadow tries to disconnect.",
    "You're the human equivalent of getting Rickrolled on an important link.",
    "Your attention span is shorter than a TikTok loop.",
    "Even a firewall couldn't block how annoying you are.",
    "You look like you microwave fish in an open office breakroom.",
    "Your logic is weaker than a password set to '123456'.",
    "You're like an unformatted hard drive—completely blank inside.",
    "Even autocorrect gave up trying to fix your spelling.",
    "You bring zero bits of value to this digital mainframe.",
    "Your energy is flatter than a pancake left out in the desert.",
    "You look like you read the terms and conditions and still don't understand them.",
    "Your tweets/messages read like a random number generator having a stroke.",
    "You're the human glitch that nobody bothered to patch.",
    "You couldn't hack a microwave if your life depended on it."
];

export default {
    name: 'roast',
    category: 'fun',
    description: 'Delivers a witty, harmless roast to a user or chat.\nUsage: .roast @user',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0] || msg.key.participant || msg.key.remoteJid;
        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚁 𝙾 𝙰 𝚂 𝚃 ⚡\n\n`;
        text += `❖──────────【 𝚃𝙰𝚁𝙶𝙴𝚃 】──────────❖\n`;
        text += `│ 🎯 Victim: @${target.split('@')[0]}\n`;
        text += `│ 🔥 Roast: ${roast}\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text, mentions: [target] }, { quoted: msg });
    }
};
