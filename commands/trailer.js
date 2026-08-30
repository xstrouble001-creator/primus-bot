import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import yts from 'yt-search';
import { sendAnimatedLoader } from '../lib/animator.js';

const MAX_DURATION_SECONDS = 300; // 5 minutes cap

export default {
    name: 'trailer',
    description: 'Download a short (under 5min) trailer clip for a movie.\nUsage: .trailer <movie title>',
    category: 'movie',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { text: '⚡ [SYNTAX ERROR] Usage: .trailer <movie title>\nExample: .trailer Dune Part Two' }, { quoted: msg });
        }

        await sendAnimatedLoader(sock, from, msg);

        try {
            const searchResult = await yts(`${query} official trailer`);
            const video = searchResult.videos.find((v) => v.seconds > 0 && v.seconds <= MAX_DURATION_SECONDS);

            if (!video) {
                return await sock.sendMessage(from, { text: `❌ [NOT FOUND] No trailer under 5 minutes found for "${query}".` }, { quoted: msg });
            }

            const caption = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝚃 𝚁 𝙰 𝙸 𝙻 𝙴 𝚁 ⚡\n\n` +
                `❖──────────【 𝚃𝚁𝙰𝙸𝙻𝙴𝚁 𝙵𝙾𝚄𝙽𝙳 】──────────❖\n│\n` +
                `│ 🎬 𝚃𝚒𝚝𝚕𝚎     : ${video.title}\n` +
                `│ ⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗  : ${video.timestamp}\n` +
                `│ 👀 𝚅𝚒𝚎𝚠𝚜     : ${video.views}\n│\n` +
                `❖─────────────────────────────❖\n\n` +
                `> ⚡ *Downloading clip...*`;

            await sock.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: msg });

            const output = path.resolve(`./temp_trailer_${Date.now()}.mp4`);
            const command = `yt-dlp -f "bestvideo[vcodec^=avc1][height<=720]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]" --recode-video mp4 -o "${output}" "${video.url}"`;

            exec(command, async (error) => {
                if (error || !fs.existsSync(output)) {
                    console.error('❌ [TRAILER DOWNLOAD ERROR]:', error);
                    return await sock.sendMessage(from, { text: '❌ [SYSTEM ERROR] Trailer download failed.' }, { quoted: msg });
                }

                await sock.sendMessage(from, {
                    video: { url: output },
                    caption: `🎬 ${video.title}\n└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
                }, { quoted: msg });

                fs.unlinkSync(output);
            });
        } catch (err) {
            console.error('❌ [TRAILER ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
