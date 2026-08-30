import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'antitag',
category: 'group',
    description: 'Toggle anti-mass-tag protection (auto-delete tags of 3+ people by non-admins)',
    groupOnly: true,
    adminOnly: true,
    botAdmin: true,
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const settings = loadSettings() || {};
        if (!settings.antitagGroups) settings.antitagGroups = [];

        const isEnabled = settings.antitagGroups.includes(from);
        const action = args[0]?.toLowerCase();

        if (action === 'on' && !isEnabled) {
            settings.antitagGroups.push(from);
            saveSettings(settings);
            await sock.sendMessage(from, { text: '🛡️ [ANTITAG ACTIVATED] Mass tagging (3+ mentions) by non-admins will now be eradicated.' }, { quoted: msg });
        } else if (action === 'off' && isEnabled) {
            settings.antitagGroups = settings.antitagGroups.filter(id => id !== from);
            saveSettings(settings);
            await sock.sendMessage(from, { text: '⚠️ [ANTITAG DEACTIVATED] Mass tagging is now permitted.' }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: `🛡️ [ANTITAG STATUS] Currently: *${isEnabled ? 'ACTIVE' : 'INACTIVE'}*\nUse \`.antitag on\` or \`.antitag off\` to toggle.` }, { quoted: msg });
        }
    }
};
