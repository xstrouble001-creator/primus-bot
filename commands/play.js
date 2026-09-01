import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import yts from 'yt-search';
import { sendLoadingAnimation } from '../lib/loading.js';

export default {
    name: 'play',
    description: 'Download audio using yt-dlp with rich info display',
    category: 'music',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, { text: '⚡ [SYNTAX ERROR] Usage: .play <song name>' }, { quoted: msg });
        }

        await sendLoadingAnimation(sock, from, msg);

        try {
            const searchResult = await yts(query);
            const video = searchResult.videos[0];

            if (!video) {
                return await sock.sendMessage(from, { text: '❌ [NOT FOUND] Audio track not located.' }, { quoted: msg });
            }

            // Rich info metadata card
            const caption = `⚡ 𝑷 𝑹 𝙸 𝙼 𝚄 𝚂   𝑴 𝑼 𝑺 𝑰 𝑪 ⚡\n\n` +
                            `❖──────────【 𝑻𝑹𝑨𝑪𝑲  𝑭𝑶𝑼𝑵𝑫 】──────────❖\n│\n` +
                            `│ 🎵 𝑻𝒊𝒕𝒍𝒆    : ${video.title}\n` +
                            `│ ⏱️ 𝑫𝒖𝒓𝒂𝒕𝒊𝒐𝒏 : ${video.timestamp}\n` +
                            `│ 👀 𝑽𝒊𝒆𝒘𝒔    : ${video.views}\n` +
                            `│ 🔗 𝑳𝒊𝒏𝒌     : ${video.url}\n│\n` +
                            `❖─────────────────────────────❖\n\n` +
                            `> ⚡ *Downloading audio via yt-dlp...*`;

            await sock.sendMessage(from, { image: { url: video.thumbnail }, caption }, { quoted: msg });

            const output = path.resolve(`./temp_${Date.now()}.mp3`);
            const command = `yt-dlp -x --audio-format mp3 --extractor-args "youtube:player_client=android" -o "${output}" "${video.url}"`;
            
            exec(command, async (error, stdout, stderr) => {
                if (error || !fs.existsSync(output)) {
                    console.error('❌ [PLAY DOWNLOAD ERROR]:', error?.message || 'unknown error');
                    if (stderr) console.error('❌ [PLAY YT-DLP STDERR]:', stderr);
                    return await sock.sendMessage(from, { text: '❌ [SYSTEM ERROR] Download failed.' }, { quoted: msg });
                }

                await sock.sendMessage(from, { 
                    audio: { url: output }, 
                    mimetype: 'audio/mpeg', 
                    ptt: false 
                }, { quoted: msg });

                // Cleanup temporary file
                fs.unlinkSync(output);
            });

        } catch (err) {
            console.error('❌ [PLAY ERROR]:', err);
            await sock.sendMessage(from, { text: '❌ [SYSTEM ERROR] Failed to process.' }, { quoted: msg });
        }
    }
};
