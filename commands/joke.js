import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are 10 types of people in the world: those who understand binary, and those who don't.",
    "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
    "HTML is a programming language. And my cat is a quantum physicist.",
    "Why do Java developers wear glasses? Because they can't C#.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "Real programmers count from 0.",
    "Why did the router break up with the modem? Because there was no connection.",
    "To understand recursion, you must first understand recursion.",
    "A pointer walks into a bar and says, 'I'll have a beer, point to it, and forget where I put it.'",
    "Why do cyber security experts hate nature? Too many open ports.",
    "Artificial intelligence usually beats natural stupidity.",
    "I'd tell you a UDP joke, but you might not get it.",
    "There's no place like 127.0.0.1.",
    "I changed my password to 'incorrect' so whenever I forget, the computer reminds me.",
    "Why do phones ring at night? Because they have cellular anxiety.",
    "Why did the database administrator leave his wife? She had too many foreign keys.",
    "Linux is only free if your time has no value.",
    "Why did the JavaScript developer wear a scarf? Because it was chilly in node_modules.",
    "I have a joke about UDP, but I'm not sure if you'll catch it.",
    "An SQL statement walks into a bar, walks up to two tables and asks, 'Can I join you?'",
    "Why do programmers hate the outdoors? Fresh air has too many bugs.",
    "Why did the hacker cross the road? To bypass the firewall on the other side.",
    "Knock, knock. Who's there? infinite recursion. Who's there? infinite recursion...",
    "Why did the developer go broke? Because he used up all his cache.",
    "What is a pirate's favorite programming language? You'd think it's R, but their first love be the C.",
    "Why did the computer sneeze? Because it had a virus.",
    "What do you call 8 hobbits? A hobbyte.",
    "Why do python programmers wear glasses? Because they don't C#.",
    "How many programmers does it take to change a lightbulb? None, that's a hardware problem.",
    "Why was the JavaScript developer sad? Because he didn't know how to express his feelings.",
    "Why did the computer show up at work late? It had a hard drive crash.",
    "What is a computer's favorite snack? Microchips and computer chips.",
    "Why did the programmer get stuck in the shower? The shampoo instructions said: Lather, rinse, repeat.",
    "What is an algorithm? Word used by programmers when they don't want to explain what they did.",
    "Why did the smartphone go to therapy? It lost its connection to reality.",
    "Why did the Wi-Fi router get promoted? It had great range and stability.",
    "What do you get when you cross a computer and a life guard? A screen saver.",
    "Why do keyboards live longer than humans? Because they control their escapes.",
    "Why did the function return early? It had an identity crisis.",
    "Why are assembly programmers always soaking wet? Because they work below C-level.",
    "What is a computer's favorite music genre? Disc-o.",
    "Why did the coder cross the playground? To get to the other slide.",
    "Why do ghosts love the internet? Because of the dead links.",
    "Why did the hard drive break up with the keyboard? It felt pressed.",
    "What do computers eat for breakfast? Silicon flakes.",
    "Why did the web developer walk into a wall? He didn't see the CSS constraints.",
    "Why did the robot cross the road? Because it was programmed by a chicken.",
    "Why are computer engineers bad at relationships? They expect everything to be logical.",
    "What is a hacker's favorite drink? Root beer."
];

export default {
    name: 'joke',
    category: 'fun',
    description: 'Delivers a random tech or programming joke.\nUsage: .joke',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙹 𝙾 𝙺 𝙴 ⚡\n\n`;
        text += `❖──────────【 𝚃𝙴𝚇𝚃 】──────────❖\n`;
        text += `│ 💬 "${randomJoke}"\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
