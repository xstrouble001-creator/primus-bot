import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'delsudo',
    description: 'To revoke sudo access from a user, owners only command',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner, mentionedJid } = context;
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '⚠️ [ACCESS DENIED] Root privilege required to purge clearance nodes.' }, { quoted: msg });
        }

        const target = mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        if (!target) {
            return await sock.sendMessage(from, { text: `⚡ [SYNTAX ERROR] Usage: ${config.prefix}delsudo @user` }, { quoted: msg });
        }

        if (!config.sudo || !config.sudo.includes(target)) {
            return await sock.sendMessage(from, { text: `🛡️ [NOTICE] Node [${target.split('@')[0]}] is not found in the whitelist.` }, { quoted: msg });
        }

        config.sudo = config.sudo.filter(jid => jid !== target);

        try {
            const configPath = path.resolve(__dirname, '../config.js');
            let configContent = fs.readFileSync(configPath, 'utf8');

            const sudoArrayStr = `sudo: ${JSON.stringify(config.sudo, null, 4)}`;
            if (configContent.includes('sudo')) {
                configContent = configContent.replace(/sudo\s*:\s*\[[\s\S]*?\]/, sudoArrayStr);
            }
            fs.writeFileSync(configPath, configContent, 'utf8');
        } catch (err) {
            console.error('Failed to update config.js file:', err);
        }

        await sock.sendMessage(from, { text: `🗑️ [REVOCATION COMPLETE] Node [${target.split('@')[0]}] purged from clearance whitelist.` }, { quoted: msg });
    }
};
