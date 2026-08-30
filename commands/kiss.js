import axios from 'axios';
import fs from 'fs';
import { gifUrlToMp4 } from '../lib/gifSender.js';

const command = {
    name: 'kiss',
    aliases: ['muah'],
    category: 'fun',
    description: 'Send an animated kiss GIF/video.',
    execute: async (sock, msg, args, context) => {
        const { from, sender } = context;

        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                     msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!target && args[0]) {
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        let mp4Path;
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/kiss');
            const gifUrl = response.data.url;

            mp4Path = await gifUrlToMp4(gifUrl);

            let caption = target
                ? `💋 @${sender.split('@')[0]} kissed @${target.split('@')[0]}!`
                : `💋 @${sender.split('@')[0]} blows a kiss!`;

            await sock.sendMessage(from, {
                video: { url: mp4Path },
                gifPlayback: true,
                caption: caption,
                mentions: target ? [sender, target] : [sender]
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ Kiss command error:', err.message);
            await sock.sendMessage(from, { text: '❌ Failed to fetch kiss GIF. Try again shortly!' }, { quoted: msg });
        } finally {
            if (mp4Path && fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path);
        }
    }
};

export default command;
