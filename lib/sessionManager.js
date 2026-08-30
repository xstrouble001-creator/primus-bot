export const activeSessions = new Map();

export const startSession = async (sessionEntry, commands, aliases, retryCount = 0, onPairingCode = null) => {
    if (global.startBot) {
        return await global.startBot(sessionEntry, retryCount, onPairingCode);
    }
};

export default { activeSessions, startSession };
