import { loadSettings, saveSettings } from '../lib/database.js';

const VALID_MODES = ['delete', 'warn', 'kick'];

export default {
    name: 'antilink',
    category: 'group',
    description: 'Configure link protection: #antilink delete | warn | kick | off',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const settings = loadSettings() || {};
        if (!settings.antilink) settings.antilink = {}; // { [groupJid]: 'delete' | 'warn' | 'kick' }

        const action = args[0]?.toLowerCase();
        const currentMode = settings.antilink[from] || null;

        if (action === 'off') {
            if (!currentMode) {
                return sock.sendMessage(from, { text: '⚠️ Antilink is already OFF in this group.' }, { quoted: msg });
            }
            delete settings.antilink[from];
            saveSettings(settings);
            return sock.sendMessage(from, { text: '🔓 Antilink turned OFF. Links are now permitted.' }, { quoted: msg });
        }

        if (action === 'on' || VALID_MODES.includes(action)) {
            // 'on' with no explicit mode keeps existing behavior: delete-only
            const mode = VALID_MODES.includes(action) ? action : 'delete';
            settings.antilink[from] = mode;
            saveSettings(settings);

            const modeDescriptions = {
                delete: '🗑️ *DELETE mode* — links/channel invites are deleted instantly.',
                warn: '⚠️ *WARN mode* — sender gets a warning per link sent; 4 warnings = automatic kick.',
                kick: '🚫 *KICK mode* — anyone sending a link/group invite/channel is instantly kicked.'
            };
            return sock.sendMessage(from, { text: `🛡️ Antilink ACTIVATED.\n${modeDescriptions[mode]}` }, { quoted: msg });
        }

        // No/invalid argument — show current status + usage
        const statusText = currentMode ? `ACTIVE (${currentMode} mode)` : 'INACTIVE';
        return sock.sendMessage(from, {
            text: `🛡️ *Antilink status:* ${statusText}\n\n` +
                  `Usage:\n` +
                  `#antilink delete — instantly delete links/invites\n` +
                  `#antilink warn — warn sender, 4 warnings = kick\n` +
                  `#antilink kick — instantly kick anyone who sends a link\n` +
                  `#antilink off — disable`
        }, { quoted: msg });
    }
};
