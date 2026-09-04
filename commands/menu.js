import fs from 'fs';
import config from '../config.js';
import { sendAnimatedLoader } from '../lib/animator.js';

const formatUptime = (seconds) => {
    const pad = (s) => (s < 10 ? '0' : '') + s;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`;
};

const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (hour >= 12 && hour < 18) return { text: 'Good Afternoon', emoji: '☀️' };
    if (hour >= 18 && hour < 22) return { text: 'Good Evening', emoji: '🌆' };
    return { text: 'Good Night', emoji: '🌙' };
};

export default {
    name: 'm',
    aliases: ['menu'],
    description: 'Displays the categorized bot sub-menus',
    category: 'general',
    execute: async (sock, msg, args, context) => {
        const { from, pushName, commands } = context;

        // Start loading animation
        const loaderKey = await sendAnimatedLoader(sock, from, msg);

        const uptime = formatUptime(process.uptime());
        const greeting = getTimeGreeting();
        const userName = pushName || 'User';
        const targetCategory = args.join(' ')?.toLowerCase();

        const categories = {};
        commands.forEach((cmd) => {
            const cat = (cmd.category || 'general').toLowerCase();
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        });

        let responseText = '';
        let selectedBannerPath = '';

        if (targetCategory && categories[targetCategory]) {
            const cmdList = categories[targetCategory];
            const prefix = config.prefix || '#';

            // Group commands into chunked connected tree rows (3 per line)
            const chunkSize = 3;
            let formattedRows = '';
            const totalChunks = Math.ceil(cmdList.length / chunkSize);

            for (let i = 0; i < cmdList.length; i += chunkSize) {
                const chunk = cmdList.slice(i, i + chunkSize);
                const currentChunkIndex = Math.floor(i / chunkSize);

                const badges = chunk.map(c => `{${prefix}${c.name}}`).join('-----');
                formattedRows += `│ 📜 ${badges}\n`;

                // Add vertical branch if there are more rows following
                if (currentChunkIndex < totalChunks - 1) {
                    formattedRows += `│    │\n`;
                }
            }

            // Pick a random command from the current category for the dynamic tip
            const randomCmd = cmdList[Math.floor(Math.random() * cmdList.length)]?.name || 'help';

            responseText += `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            responseText += `❖──────────【 ${targetCategory.toUpperCase()}  】──────────❖\n│\n`;
            responseText += formattedRows;
            responseText += `│\n❖─────────────────────────────❖\n`;
            responseText += `│ 📊 𝚃𝚘𝚝𝚊𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜 : ${cmdList.length} Active\n`;
            responseText += `│ 💡 𝚃𝚒𝚙 : 𝚃𝚢𝚙𝚎 ${prefix}${randomCmd} --help 𝚏𝚘𝚛 𝚍𝚎𝚝𝚊𝚒𝚕𝚜\n`;
            responseText += `❖─────────────────────────────❖\n\n`;
            responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            selectedBannerPath = config.banners?.[targetCategory] || config.banners?.main;
        } else {
            responseText += `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            responseText += `❖──────────【 𝚂𝚈𝚂𝚃𝙴𝙼  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n`;
            responseText += `│ ${greeting.emoji} ${greeting.text}, ${userName}!\n`;
            responseText += `│ 👤 𝚄𝚜𝚎𝚛     : ${userName}\n`;
            responseText += `│ 🤖 𝙱𝚘𝚝      : ${config.botName}\n`;
            responseText += `│ ⚡ 𝙿𝚛𝚎𝚏𝚒𝚡   : [ ${config.prefix} ]\n`;
            responseText += `│ ⏱️ 𝚄𝚙𝚝𝚒𝚖𝚎   : ${uptime}\n`;
            responseText += `│ 📊 𝙼𝚘𝚍𝚞𝚕𝚎𝚜  : ${commands.size} Commands Active\n`;
            responseText += `❖─────────────────────────────❖\n\n`;

            responseText += `💡 _Usage: Type ${config.prefix}m general to access sub-menu._\n\n`;

            responseText += `❖──────────【 𝚉𝙴𝚁𝙾-𝙳𝙰𝚈  𝙸𝙽𝙳𝙴𝚇 】──────────❖\n`;
            responseText += `│ ☣️ 𝙶𝙴𝙽𝙴𝚁𝙰𝙻  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🛡️ 𝙰𝙳𝙼𝙸𝙽  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 👥 𝙶𝚁𝙾𝚄𝙿  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🎬 𝙼𝙴𝙳𝙸𝙰  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 👑 𝙾𝚆𝙽𝙴𝚁  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ ⚙️ 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🎭 𝙵𝚄𝙽  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🤖 𝙰𝙸  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🎵 𝙼𝚄𝚂𝙸𝙲  𝙷𝚄𝙱\n`;
            responseText += `│ ⛩️ 𝙰𝙽𝙸𝙼𝙴  𝙷𝚄𝙱\n`;
            responseText += `│ 🍿 𝙼𝙾𝚅𝙸𝙴  𝙷𝚄𝙱\n`;
            responseText += `│ 🔞 𝟷𝟾+  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ ⚽ 𝙵𝙾𝙾𝚃𝙱𝙰𝙻𝙻  𝙽𝙴𝚆𝚂\n`;
            responseText += `│ 📰 𝙽𝙴𝚆𝚂  𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈\n`;
            responseText += `│ 🎨 𝚂𝚃𝚈𝙻𝙸𝚂𝙷  𝙷𝚄𝙱\n`;
            responseText += `│ 🎮 𝙶𝙰𝙼𝙴  𝙿𝚄𝙱\n`;
            responseText += `❖─────────────────────────────❖\n\n`;

            responseText += `❖──────────【 𝙳𝙾𝙼𝙰𝙸𝙽  𝙴𝚇𝙿𝙰𝙽𝚂𝙸𝙾𝙽 】──────────❖\n`;
            responseText += `│ ☣️ 𝙱𝙰𝙽  𝙳𝙾𝙼𝙰𝙸𝙽\n`;
            responseText += `│ ☣️ 𝙱𝙰𝙽  𝙲𝙷𝙴𝙲𝙺𝙴𝚁\n`;
            responseText += `│ ☣️ 𝙱𝙰𝙽  𝙼𝙴𝚃𝙷𝙾𝙳\n`;
            responseText += `│ ☣️ 𝙶𝚁𝙾𝚄𝙿  𝙷𝙸𝙹𝙰𝙲𝙺\n`;
            responseText += `│ ☣️ 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿  𝙲𝚁𝙰𝚂𝙷𝙴𝚁\n`;
            responseText += `│ ☣️ 𝙿𝚁𝙸𝙼𝚄𝚂  𝚅𝙸𝚁𝚄𝚂\n`;
            responseText += `❖─────────────────────────────❖\n\n`;

            responseText += `❖──────────【 𝙳𝙴𝚅  𝙸𝙽𝙵𝙾 】──────────❖\n`;
            responseText += `│ 👨‍💻 𝑫𝒆𝒗 𝑵𝒂𝒎𝒆   : Lupin\n`;
            responseText += `│ 🏢 𝑪𝒐𝒐𝒑𝒆𝒓𝒂𝒕𝒊𝒐𝒏 : Primus Inc\n`;
            responseText += `│ 📞 𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑   : https://wa.me/2349131719077\n`;
            responseText += `│ 💻 𝑮𝒊𝒕𝑯𝒖𝒃    : https://github.com/xstrouble001-creator\n`;
            responseText += `│ ✈️ 𝑻𝒆𝒍𝒆𝒈𝒓𝒂𝒎    : https://t.me/2348074270051\n`;
            responseText += `❖─────────────────────────────❖\n\n`;

            responseText += `💡 _Usage: Type ${config.prefix}m general to access sub-menu._\n\n`;
            responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            selectedBannerPath = config.banners?.main;
        }

        // Try sending media buffer, fall back to text if Baileys upload fails
        if (selectedBannerPath && fs.existsSync(selectedBannerPath)) {
            try {
                const imageBuffer = fs.readFileSync(selectedBannerPath);
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: responseText
                }, { quoted: msg });
                return;
            } catch (mediaErr) {
                console.warn('⚠️ [MENU MEDIA UPLOAD FAILED]: Falling back to text send.', mediaErr.message);
            }
        }

        // Fallback or text-only execution
        if (loaderKey) {
            await sock.sendMessage(from, { text: responseText, edit: loaderKey });
        } else {
            await sock.sendMessage(from, { text: responseText }, { quoted: msg });
        }
    }
};
