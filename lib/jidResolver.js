export async function resolveCanonicalJid(sock, from, rawJid) {
    if (!rawJid) return rawJid;
    const cleanRaw = rawJid.split(':')[0].split('@')[0];

    try {
        const metadataPromise = sock.groupMetadata(from);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('groupMetadata timed out')), 5000)
        );
        const metadata = await Promise.race([metadataPromise, timeoutPromise]);

        const participant = metadata.participants.find(p => {
            const candidates = [p.id, p.phoneNumber, p.lid].filter(Boolean);
            return candidates.some(c => c.split(':')[0].split('@')[0] === cleanRaw);
        });

        if (participant) {
            const canonical = participant.phoneNumber || participant.id;
            return canonical.split(':')[0].split('@')[0] + '@s.whatsapp.net';
        }
    } catch (e) {
        console.error('❌ [JID RESOLVE ERROR]:', e.message);
    }

    return cleanRaw + '@s.whatsapp.net';
}
