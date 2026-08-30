export async function resolveCanonicalJid(sock, from, rawJid) {
    if (!rawJid) return rawJid;
    const cleanRaw = rawJid.split(':')[0].split('@')[0];

    try {
        const metadata = await sock.groupMetadata(from);
        console.log('[JID DEBUG] Looking for:', cleanRaw);
        console.log('[JID DEBUG] Participants:', JSON.stringify(metadata.participants, null, 2));

        const participant = metadata.participants.find(p => {
            const candidates = [p.id, p.phoneNumber, p.lid].filter(Boolean);
            return candidates.some(c => c.split(':')[0].split('@')[0] === cleanRaw);
        });

        console.log('[JID DEBUG] Match found:', participant);

        if (participant) {
            const canonical = participant.phoneNumber || participant.id;
            return canonical.split(':')[0].split('@')[0] + '@s.whatsapp.net';
        }
    } catch (e) {
        console.error('❌ [JID RESOLVE ERROR]:', e.message);
    }

    return cleanRaw + '@s.whatsapp.net';
}
