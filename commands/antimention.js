import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'antimention',
    aliases: ['antitag'],
    category: 'group',
    description: 'Toggle anti-mass-mention protection to auto-delete bulk tags',
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
            await sock.sendMessage(from, { text: '🛡️ [ANTIMENTION ACTIVATED] Mass tagging by non-admins will now be neutralized.' }, { quoted: msg });
        } else if (action === 'off' && isEnabled) {
            settings.antitagGroups = settings.antitagGroups.filter(id => id !== from);
            saveSettings(settings);
            await sock.sendMessage(from, { text: '⚠️ [ANTIMENTION DEACTIVATED] Mass tagging is now permitted in this sector.' }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: `🛡️ [ANTIMENTION STATUS] Currently: *${isEnabled ? 'ACTIVE' : 'INACTIVE'}*\nUse \`.antimention on\` or \`.antimention off\` to toggle.` }, { quoted: msg });
        }
    }
};
