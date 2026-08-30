import fs from 'fs';
import path from 'path';

// Baileys does not ship its own contact store, so the bot only ever
// learns someone's display name from the `pushName` WhatsApp attaches
// to messages THEY send. This means:
//   - We can always show the correct name for whoever sent the
//     current message (msg.pushName is right there).
//   - For a TARGET/mentioned user (e.g. `#kick @Jude`), we can only
//     show their name if we've previously seen them send a message
//     in some group the bot is in, and cached it here.
// If someone has never been seen by the bot, there is no name to show
// and we fall back to their number — that's a hard limit of what
// WhatsApp exposes, not something more code can work around.

const cachePath = path.resolve('./database/nameCache.json');

const loadCache = () => {
    try {
        if (!fs.existsSync(cachePath)) {
            fs.writeFileSync(cachePath, JSON.stringify({}, null, 2), 'utf-8');
            return {};
        }
        return JSON.parse(fs.readFileSync(cachePath, 'utf-8')) || {};
    } catch (err) {
        console.error('❌ [NAME CACHE] Failed to load:', err);
        return {};
    }
};

let cache = loadCache();
let dirty = false;

// Debounced disk write so we don't hit disk on every single message —
// only after a short quiet period once new names have actually come in.
let saveTimer = null;
const scheduleSave = () => {
    dirty = true;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
        if (dirty) {
            try {
                fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
                dirty = false;
            } catch (err) {
                console.error('❌ [NAME CACHE] Failed to save:', err);
            }
        }
        saveTimer = null;
    }, 2000);
};

/**
 * Call this on every incoming message to passively learn/update the
 * sender's display name. Cheap no-op if there's nothing new to learn.
 * @param {string} jid - full JID, e.g. '1234567890@s.whatsapp.net'
 * @param {string} pushName - the WhatsApp-supplied display name
 */
export const rememberName = (jid, pushName) => {
    if (!jid || !pushName) return;
    const cleanJid = jid.split(':')[0].split('@')[0];
    if (cache[cleanJid] === pushName) return; // no change, skip write
    cache[cleanJid] = pushName;
    scheduleSave();
};

/**
 * Get the best known display name for a JID, or null if we've never
 * seen this person before (caller decides the fallback, usually the
 * raw number).
 * @param {string} jid
 * @returns {string|null}
 */
export const getKnownName = (jid) => {
    if (!jid) return null;
    const cleanJid = jid.split(':')[0].split('@')[0];
    return cache[cleanJid] || null;
};

/**
 * Convenience: returns the display name if known, otherwise the raw
 * number — i.e. exactly what you want to put after an "@" in a
 * WhatsApp mention.
 * @param {string} jid
 */
export const getMentionName = (jid) => {
    if (!jid) return '';
    const cleanJid = jid.split(':')[0].split('@')[0];
    return cache[cleanJid] || cleanJid;
};
