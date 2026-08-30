import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const dares = [
    "Send a voice note singing your national anthem in a robot voice.",
    "Type your next 3 messages completely in uppercase letters.",
    "Change your WhatsApp about status to 'Owned by Primus MD' for 24 hours.",
    "Confess your secret celebrity crush in the chat right now.",
    "Send a screenshot of your phone's battery percentage and recent apps.",
    "Send a selfie making the silliest face possible.",
    "Call the last person you called on phone and tell them you love them.",
    "Type a full paragraph using only your nose.",
    "Send a sticker that best describes your current mood without typing any words.",
    "Admit the most embarrassing thing that happened to you this week.",
    "Write a 4-line rap song praising the bot owner Lupin.",
    "Send a voice note laughing maniacally like an evil anime villain.",
    "Do 20 pushups right now and send proof or voice note panting.",
    "Send the 5th photo in your gallery no matter what it is.",
    "Change your group nickname to 'Cyber Minion' until someone else takes a dare.",
    "Compliment every single person currently active in this group chat.",
    "Speak in third person for the next 10 messages.",
    "Send a voice note reciting the alphabet backwards as fast as you can.",
    "Pretend you are a customer service bot for the next 5 messages.",
    "Send a voice note imitating your favorite cartoon character.",
    "Type a love letter to your refrigerator.",
    "Ask a random contact in your phone for financial advice.",
    "Send an emoji that represents your soul right now.",
    "Try to touch your nose with your tongue and describe if you succeeded.",
    "Translate a random sentence into Portuguese and send it here.",
    "Send a voice note whistling your favorite tune.",
    "Type a message using only emojis for the next 3 turns.",
    "Pretend to be an AI robot malfunctioning in the chat.",
    "Send a voice note whispering a top-secret conspiracy theory.",
    "Post a status on WhatsApp saying 'Primus MD rules the digital universe'.",
    "Send a voice note meowing like a cat for 10 seconds.",
    "Share the weirdest search history item you looked up this week.",
    "Compliment the bot developer in the most dramatic Shakespearean English possible.",
    "Send a voice note saying 'I am the master of the mainframe' with maximum bass.",
    "Act like a news anchor reporting breaking news about a random group member.",
    "Send a voice note counting from 1 to 20 in a foreign language you know.",
    "Send a sticker of an animal and explain why it represents your personality.",
    "Type 'I love debugging spaghetti code at 3 AM' in the chat.",
    "Send a voice note giving a motivational speech to a potato.",
    "Pretend to be a famous celebrity doing an exclusive interview.",
    "Send a voice note yawning loudly.",
    "Describe your dream cybernetic upgrade if you lived in a cyberpunk city.",
    "Send an audio clip saying 'Access Granted' like a supercomputer.",
    "Type a tongue twister three times without making a single typo.",
    "Send a voice note snapping your fingers to an imaginary beat.",
    "Pretend you are trapped inside the WhatsApp server and need rescuing.",
    "Send a voice note reading a random label from an object near you.",
    "Send a selfie showing your current workspace or room setup.",
    "Write a mini poem about how awesome the Primus MD bot is.",
    "Send a voice note shouting 'BANZAI!' with full energy."
];

export default {
    name: 'dare',
    category: 'fun',
    description: 'Issues a daring challenge for group participants.\nUsage: .dare',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        const dare = dares[Math.floor(Math.random() * dares.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙳 𝙰 𝚁 𝙴 ⚡\n\n`;
        text += `❖──────────【 𝙲𝙷𝙰𝙻𝙻𝙴𝙽𝙶𝙴 】──────────❖\n`;
        text += `│ 🎯 Target: @${msg.key.participant ? msg.key.participant.split('@')[0] : msg.key.remoteJid.split('@')[0]}\n`;
        text += `│ 🔥 Dare: ${dare}\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text, mentions: [msg.key.participant || msg.key.remoteJid] }, { quoted: msg });
    }
};
