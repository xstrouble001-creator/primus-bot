import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: 'trace',
    aliases: ['whatanime', 'findanime'],
    description: 'Find anime title and episode from an image screenshot',
    category: 'anime',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const mType = Object.keys(msg.message || {})[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage') 
            ? msg.message[mType].message 
            : msg.message;

        const contextInfo = unwrap?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        const quotedType = quotedMsg ? Object.keys(quotedMsg)[0] : null;

        let targetImageMsg = null;
        if (unwrap?.imageMessage) {
            targetImageMsg = unwrap.imageMessage;
        } else if (quotedType === 'imageMessage') {
            targetImageMsg = quotedMsg.imageMessage;
        } else if (quotedType === 'viewOnceMessage' || quotedType === 'ephemeralMessage') {
            targetImageMsg = quotedMsg[quotedType]?.message?.imageMessage;
        }

        if (!targetImageMsg) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please attach or reply to an anime screenshot with *#trace*` 
            }, { quoted: msg });
        }

        const sent = await sock.sendMessage(from, { 
            text: `🎬 𝙸𝙳𝙴𝙽𝚃𝙸𝙵𝚈𝙸𝙽𝙶  𝙰𝙽𝙸𝙼𝙴  𝚂𝙲𝚁𝙴𝙴𝙽𝚂𝙷𝙾𝚃...` 
        }, { quoted: msg });

        try {
            const stream = await downloadContentFromMessage(targetImageMsg, 'image');
            let buffer = Buffer.alloc(0);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const formData = new FormData();
            formData.append('image', buffer, { filename: 'screenshot.jpg', contentType: 'image/jpeg' });

            const res = await axios.post('https://api.trace.moe/search?anilistInfo', formData, {
                headers: formData.getHeaders()
            });

            const result = res.data?.result?.[0];
            if (!result) {
                await sock.sendMessage(from, { delete: sent.key }).catch(() => {});
                return await sock.sendMessage(from, { text: `❌ Could not match this image to any anime.` }, { quoted: msg });
            }

            const title = result.anilist?.title?.english || result.anilist?.title?.romaji || result.filename;
            const episode = result.episode || 'N/A';
            const similarity = (result.similarity * 100).toFixed(1);
            const fromTime = new Date(result.from * 1000).toISOString().substr(14, 5);
            const toTime = new Date(result.to * 1000).toISOString().substr(14, 5);
            const previewVideo = result.video;

            const traceText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝚃 𝚁 𝙰 𝙲 𝙴 ⚡\n\n` +
                              `❖──────────【 𝙼𝙰𝚃𝙲𝙷  𝙵𝙾𝚄𝙽𝙳 】──────────❖\n` +
                              `│ 📺 𝙰𝚗𝚒𝚖𝚎      : ${title}\n` +
                              `│ 🎞️ 𝙴𝚙𝚒𝚜𝚘𝚍𝚎     : ${episode}\n` +
                              `│ ⏱️ 𝚃𝚒𝚖𝚎𝚜𝚝𝚊𝚖𝚙  : ${fromTime} - ${toTime}\n` +
                              `│ 🎯 𝚂𝚒𝚖𝚒𝚕𝚊𝚛𝚒𝚝𝚢 : ${similarity}%\n` +
                              `❖─────────────────────────────❖\n\n` +
                              `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { delete: sent.key }).catch(() => {});

            if (previewVideo) {
                await sock.sendMessage(from, { 
                    video: { url: previewVideo }, 
                    caption: traceText,
                    mimetype: 'video/mp4' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: traceText }, { quoted: msg });
            }
        } catch (err) {
            console.error('❌ [TRACE COMMAND ERROR]:', err);
            await sock.sendMessage(from, { 
                text: `❌ Trace Error: ${err.message || 'Failed to scan image.'}` 
            }, { quoted: msg });
        }
    }
};
