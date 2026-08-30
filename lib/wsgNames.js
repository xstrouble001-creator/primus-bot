import { getMentionName } from './nameCache.js';

export function displayName(jid) {
    const cached = getMentionName(jid);
    if (cached) return cached;
    return `@${jid.split('@')[0]}`;
}

export function isMentionFallback(jid) {
    return !getMentionName(jid);
}
