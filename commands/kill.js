import { getAnimeGif, getTargetJid } from '../lib/animeGifs.js';

export default {
    name: 'kill',
    aliases: ['slay'],
    category: 'anime',
    desc: 'Eliminate someone in the group',
    execute: async (sock, msg, args, context) => {
        const { from, sender } = context;
        const target = getTargetJid(msg, context);

        if (!target) {
            await sock.sendMessage(from, { text: '⚠️ You must @mention or reply to a target to eliminate them!' }, { quoted: msg });
            return;
        }

        const targetText = `@${target.split('@')[0]}`;
        const senderText = `@${sender.split('@')[0]}`;

        try {
            const gifUrl = await getAnimeGif('kill');
            await sock.sendMessage(from, {
                video: { url: gifUrl },
                gifPlayback: true,
                caption: `⚔️ ${senderText} eliminated ${targetText}! RIP 💀`,
                mentions: [sender, target]
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Failed to load GIF. Try again!' }, { quoted: msg });
        }
    }
};
