import { sendAnimatedLoader } from '../lib/animator.js';
import config from '../config.js';

const facts = [
    "Honey never spoils; archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.",
    "Bananas are curved because they grow towards the sun against gravity in a process called negative geotropism.",
    "A single cloud can weigh more than 1.1 million pounds.",
    "The shortest war in history was between Zanzibar and Britain on August 27, 1896. Zanzibar surrendered after 38 minutes.",
    "Octopuses have three hearts, nine brains, and blue blood.",
    "Sharks existed on Earth before trees; sharks appeared around 400 million years ago, while trees appeared 350 million years ago.",
    "Cows have best friends and get stressed when they are separated from them.",
    "A day on Venus is longer than its year; it takes Venus longer to rotate once on its axis than to complete one orbit around the Sun.",
    "Water can boil and freeze at the same time under a specific condition known as the triple point.",
    "Cleopatra lived closer in time to the launch of the iPhone than to the construction of the Great Pyramid of Giza.",
    "There are more trees on Earth than stars in the Milky Way galaxy.",
    "Sea otters hold hands while sleeping so they don't drift apart from each other.",
    "Wombat poop is cube-shaped, which prevents it from rolling away.",
    "A bolt of lightning is five times hotter than the surface of the sun.",
    "The heart of a blue whale is the size of a small car, and its aorta is wide enough for a human to swim through.",
    "Human DNA is 50% identical to bananas.",
    "Sloths can hold their breath underwater longer than dolphins can—up to 40 minutes.",
    "The Eiffel Tower can grow by up to 15 centimeters during the summer due to thermal expansion of the iron.",
    "In Japan, there are more pets than children.",
    "A group of flamingos is called a 'flamboyance'.",
    "Bubble wrap was originally invented in 1957 as wallpaper.",
    "Your brain uses 20% of the oxygen and calories your body produces.",
    "The total weight of all ants on Earth is roughly equal to the total weight of all humans.",
    "A jiffy is an actual unit of time: 1/100th of a second.",
    "Peanuts are not nuts; they are legumes that grow underground.",
    "The fingerprints of koalas are so remarkably similar to human fingerprints that they have occasionally confused crime scene investigators.",
    "A snail can sleep for up to three years straight if conditions aren't right.",
    "The tongue of a blue whale weighs as much as an entire adult elephant.",
    "Light takes 8 minutes and 20 seconds to travel from the Sun to the Earth.",
    "Pineapples take nearly two years to grow to full maturity.",
    "Astronauts can grow up to two inches taller in space because there is no gravity compressing their spines.",
    "The name 'Google' was an accidental misspelling of the mathematical term 'Googol'.",
    "Polar bear fur is actually transparent, not white; it appears white because it reflects visible light.",
    "A day on Mars is 24 hours and 39 minutes long, very similar to an Earth day.",
    "Nintendo was founded in 1889 as a playing card company.",
    "Cats cannot taste anything sweet because they lack sweet taste receptors.",
    "The human eye can distinguish about 10 million different colors.",
    "An ostrich's eye is bigger than its entire brain.",
    "Oranges are not naturally occurring fruits; they are a hybrid of pomelos and mandarins.",
    "The first computer mouse was invented by Douglas Engelbart in 1964 and was made of wood.",
    "There are parts of Scotland where the local police force uses unicorns as their official emblem logo symbol.",
    "Mount Everest is still growing about 4 millimeters every single year.",
    "If you folded a piece of paper in half 42 times, it would be thick enough to reach the Moon.",
    "A group of crows is known as a 'murder'.",
    "The first-ever text message sent in 1991 simply said 'Merry Christmas'.",
    "Venice, Italy is built entirely on millions of wooden piles driven deep into marshy mud.",
    "The smell of freshly cut grass is actually a plant distress call signaling danger.",
    "Bats are the only mammals capable of sustained powered flight.",
    "A single strand of spider silk is thinner than a human hair but stronger than steel of the same thickness.",
    "The world's quietest room is an anechoic chamber at Microsoft's headquarters, where the background noise is negative decibels."
];

export default {
    name: 'fact',
    category: 'fun',
    description: 'Drops a mind-blowing random scientific or historical fact.\nUsage: .fact',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        await sendAnimatedLoader(sock, from, msg);
        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙵 𝙰 𝙲 𝚃 ⚡\n\n`;
        text += `❖──────────【 𝚃𝙴𝚇𝚃 】──────────❖\n`;
        text += `│ 💡 "${randomFact}"\n`;
        text += `❖─────────────────────────────❖\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    }
};
