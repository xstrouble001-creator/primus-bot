import axios from 'axios';

/**
 * Safely extracts target JID from context or raw message payload.
 */
export function getTargetJid(msg, context) {
    const { mentionedJid } = context || {};
    
    // 1. Direct @mention in context
    if (mentionedJid && mentionedJid.length > 0) {
        return mentionedJid[0];
    }

    // 2. Direct @mention inside raw message contextInfo
    const rawMentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (rawMentions && rawMentions.length > 0) {
        return rawMentions[0];
    }

    // 3. Quoted message participant
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (quotedParticipant) {
        return quotedParticipant;
    }

    return null;
}

/**
 * Fetches GIF URL with multi-API fallback.
 */
export async function getAnimeGif(action) {
    const endpoints = [
        `https://api.waifu.pics/sfw/${action}`,
        `https://nekos.best/api/v2/${action}`
    ];

    // Primary: Waifu.pics
    try {
        const res = await axios.get(endpoints[0], { timeout: 5000 });
        if (res.data?.url) return res.data.url;
    } catch (e) {}

    // Fallback: Nekos.best
    try {
        const res = await axios.get(endpoints[1], { timeout: 5000 });
        if (res.data?.results?.[0]?.url) return res.data.results[0].url;
    } catch (e) {}

    throw new Error(`Failed to fetch ${action} GIF`);
}
