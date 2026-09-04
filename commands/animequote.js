import axios from 'axios';

const LOCAL_FALLBACK_QUOTES = [
    { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece" },
    { quote: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki", anime: "Naruto" },
    { quote: "Power comes in response to a need, not a desire.", character: "Goku", anime: "Dragon Ball Z" },
    { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", character: "Kenshin Himura", anime: "Rurouni Kenshin" },
    { quote: "Fear is not evil. It tells you what weakness is. And once you know your weakness, you can become stronger.", character: "Gildarts Clive", anime: "Fairy Tail" }
];

export default {
    name: 'animequote',
    aliases: ['aquote', 'quoteanime'],
    description: 'Fetch a random inspirational anime quote',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        let quoteData = null;

        // Try active Animechan endpoint
        try {
            const res = await axios.get('https://animechan.xyz/api/random', { timeout: 5000 });
            if (res.data && res.data.quote) {
                quoteData = {
                    quote: res.data.quote,
                    character: res.data.character,
                    anime: res.data.anime
                };
            }
        } catch (err) {
            console.warn('⚠️ [ANIMEQUOTE] Remote API failed/404, using fallback bank:', err.message);
        }

        // Use offline backup if API fails
        if (!quoteData) {
            quoteData = LOCAL_FALLBACK_QUOTES[Math.floor(Math.random() * LOCAL_FALLBACK_QUOTES.length)];
        }

        const quoteText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙰 𝙽 𝙸 𝙼 𝙴   𝚀 𝚄 𝙾 𝚃 𝙴 ⚡\n\n` +
                          `💬 *"${quoteData.quote}"*\n\n` +
                          `👤 *Character :* ${quoteData.character}\n` +
                          `📺 *Anime     :* ${quoteData.anime}\n\n` +
                          `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: quoteText }, { quoted: msg });
    }
};
