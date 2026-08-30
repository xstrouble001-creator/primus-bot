import axios from 'axios';

const REACTIONS = {
    hug: { action: 'hugged', emoji: '🫂' },
    slap: { action: 'slapped', emoji: '🖐️' },
    pat: { action: 'petted', emoji: '🫳' },
    bite: { action: 'bit', emoji: '🦷' },
    cuddle: { action: 'cuddled', emoji: '🧸' },
    kill: { action: 'killed', emoji: '⚔️' },
    kiss: { action: 'kissed', emoji: '💋' }
};

export async function handleReaction(sock, msg, args, context, type) {
    const { from, sender } = context;
    const reaction = REACTIONS[type] || { action: 'reacted to', emoji: '✨' };

    let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                 msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (!target && args[0]) {
        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    let gifUrl = null;

    // Try primary API
    try {
        const res = await axios.get(`https://api.otakugifs.xyz/gif?reaction=${type}`, { timeout: 4000 });
        gifUrl = res.data?.url;
    } catch {
        // Fallback API if primary is unreachable
        try {
            const res = await axios.get(`https://nekos.best/api/v2/${type}`, { timeout: 4000 });
            gifUrl = res.data?.results?.[0]?.url;
        } catch (err) {
            console.error(`❌ Reaction API error for ${type}:`, err.message);
        }
    }

    if (!gifUrl) {
        await sock.sendMessage(from, { text: `❌ Network timeout fetching ${type} GIF. Please try again in a few seconds!` }, { quoted: msg });
        return;
    }

    let caption = target 
        ? `${reaction.emoji} @${sender.split('@')[0]} ${reaction.action} @${target.split('@')[0]}!`
        : `${reaction.emoji} @${sender.split('@')[0]} sent a ${type}!`;

    await sock.sendMessage(from, { 
        video: { url: gifUrl }, 
        gifPlayback: true, 
        caption: caption,
        mentions: target ? [sender, target] : [sender]
    }, { quoted: msg });
}
