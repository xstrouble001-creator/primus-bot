import config from '../config.js';

export function checkIsSudo(senderJid) {
    if (!senderJid) return false;

    // Clean JID and extract raw numbers
    const cleanJid = senderJid.split('@')[0].replace(/[^0-9]/g, '');

    // Collect all authorized JIDs / numbers from config
    const owners = Array.isArray(config.owner) ? config.owner : [];
    const ownerNumbers = Array.isArray(config.ownerNumber) ? config.ownerNumber : [];
    const sudos = Array.isArray(config.sudo) ? config.sudo : [];
    const devNum = config.devNumber ? [config.devNumber] : [];

    const allAuthorized = [...owners, ...ownerNumbers, ...sudos, ...devNum];

    // Check if sender match exists
    return allAuthorized.some(entry => {
        if (!entry) return false;
        const cleanEntry = entry.toString().split('@')[0].replace(/[^0-9]/g, '');
        return cleanEntry === cleanJid;
    });
}
