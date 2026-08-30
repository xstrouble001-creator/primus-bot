import { getAnimeGif, getTargetJid } from '../lib/animeGifs.js';

export default {
    name: 'cuddle',
    category: 'anime',
    desc: 'Cuddle someone in the group',
    execute: async (sock, msg, args, context) => {
        const { from, sender } = context;
        const target = getTargetJid(msg, context);

        const targetText = target ? `@${target.split('@')[0]}` : 'a soft pillow';
        const senderText = `@${sender.split('@')[0]}`;
        const mentions = target ? [sender, target] : [sender];

        try {
            const gifUrl = await getAnimeGif('cuddle');
            await sock.sendMessage(from, {
                video: { url: gifUrl },
                gifPlayback: true,
                caption: `🤗 ${senderText} cuddled ${targetText}!`,
                mentions
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Failed to load GIF. Try again!' }, { quoted: msg });
        }
    }
};
