import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import yts from 'yt-search';
import { sendAnimatedLoader } from '../lib/animator.js';

export default {
    name: 'musicvideo',
    category: 'music',
    aliases: ['mv', 'video'],
    description: 'Search and download a music video.\nUsage: .musicvideo <song name>',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { text: '⚡ [SYNTAX ERROR] Usage: .musicvideo <song name>\nExample: .musicvideo faded alan walker' }, { quoted: msg });
        }

        await sendAnimatedLoader(sock, from, msg);

        try {
            const searchResult = await yts(query);
            const video = searchResult.videos[0];

            if (!video) {
                return await sock.sendMessage(from, { text: `❌ [NOT FOUND] No music video matched "${query}".` }, { quoted: msg });
            }

            const caption = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙼 𝚄 𝚂 𝙸 𝙲   𝚅 𝙸 𝙳 𝙴 𝙾 ⚡\n\n` +
                `❖──────────【 𝚃𝚁𝙰𝙲𝙺 𝙵𝙾𝚄𝙽𝙳 】──────────❖\n│\n` +
                `│ 🎵 𝚃𝚒𝚝𝚕𝚎     : ${video.title}\n` +
                `│ ⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗  : ${video.timestamp}\n` +
                `│ 👀 𝚅𝚒𝚎𝚠𝚜     : ${video.views}\n│\n` +
                `❖─────────────────────────────❖\n\n` +
                `> ⚡ *Downloading clip...*`;

            await sock.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: msg });

            const output = path.resolve(`./temp_mv_${Date.now()}.mp4`);
            const command = `yt-dlp -f "bestvideo[vcodec^=avc1][height<=720]+bestaudio[ext=m4a]/best[vcodec^=avc1][ext=mp4]" --recode-video mp4 --extractor-args "youtube:player_client=android" -o "${output}" "${video.url}"`;

            exec(command, async (error) => {
                if (error || !fs.existsSync(output)) {
                    console.error('❌ [MUSICVIDEO DOWNLOAD ERROR]:', error);
                    return await sock.sendMessage(from, { text: '❌ [SYSTEM ERROR] Music video download failed.' }, { quoted: msg });
                }

                await sock.sendMessage(from, {
                    video: { url: output },
                    caption: `🎵 ${video.title}\n└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
                }, { quoted: msg });

                fs.unlinkSync(output);
            });
        } catch (err) {
            console.error('❌ [MUSICVIDEO ERROR]:', err);
            await sock.sendMessage(from, { text: `❌ [SYSTEM ERROR] ${err.message}` }, { quoted: msg });
        }
    }
};
