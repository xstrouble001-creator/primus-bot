import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'owner',
    aliases: ['creator', 'dev'],
    category: 'owner',
    description: 'Displays supreme developer information, anime banner, native contact card, and audio transmission.\nUsage: .owner',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        
        // 1. Trigger animated cyber loader
        await sendAnimatedLoader(sock, from, msg);

        try {
            // 2. Build the Corporate Data Card Caption
            let caption = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙾 𝚆 𝙽 𝙴 𝚁  𝙲 𝙾 𝚁 𝙴 ⚡\n\n`;
            caption += `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝙸𝙽𝙵𝙾 】──────────❖\n`;
            caption += `│ 🏢 𝑰𝒏𝒅𝒖𝒔𝒕𝒓𝒚 : ${config.cooperation || 'Primus Inc'}\n`;
            caption += `│ 🤖 𝑻𝒆𝒄𝒉     : ${config.botName || 'Primus Md'}\n`;
            caption += `│ 👨‍💻 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓: ${config.devName || 'Lupin'}\n`;
            caption += `❖─────────────────────────────❖\n\n`;
            caption += `> *Primus MD v2.6 • Neural Cyber Defense*`;

            // 3. Send Local Anime Image Banner from assets/anime.jpeg
            const localAnimePath = path.resolve('assets/anime.jpeg');
            if (fs.existsSync(localAnimePath)) {
                await sock.sendMessage(from, { 
                    image: fs.readFileSync(localAnimePath), 
                    caption: caption 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    image: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }, 
                    caption: caption 
                }, { quoted: msg });
            }

            // 4. Send Native WhatsApp Contact Card
            const vcard = 'BEGIN:VCARD\n' +
                        'VERSION:3.0\n' +
                        'FN:Lupin [Primus Dev]\n' +
                        'ORG:Primus Inc;\n' +
                        'TEL;type=CELL;type=VOICE;waid=2349131719077:+234 913 171 9077\n' +
                        'END:VCARD';

            await sock.sendMessage(from, {
                contacts: {
                    displayName: 'Lupin [Primus Dev]',
                    contacts: [{ vcard }]
                }
            }, { quoted: msg });

            // 5. Send Standard Audio Track Transmission (`ptt: false`)
            const mp3Path = path.resolve('assets/owner.mp3');
            if (fs.existsSync(mp3Path)) {
                await sock.sendMessage(from, {
                    audio: fs.readFileSync(mp3Path),
                    mimetype: 'audio/mp4',
                    fileName: 'Primus_Anthem_Lupin.mp3',
                    ptt: false
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: '⚠️ [AUDIO NOTICE]: `assets/owner.mp3` not found locally.' 
                }, { quoted: msg });
            }

        } catch (e) {
            console.error('Owner Command Error:', e);
            await sock.sendMessage(from, { text: `❌ [TRANSMISSION ERROR]: ${e.message}` }, { quoted: msg });
        }
    }
};
