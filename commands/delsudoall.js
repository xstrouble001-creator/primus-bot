import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    name: 'delsudoall',
    aliases: ['clearsudo', 'purgesudo'],
    description: 'Instantly revoke sudo access from ALL users, owner only command',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner } = context;
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '⚠️ [ACCESS DENIED] Root privilege required to purge all clearance nodes.' }, { quoted: msg });
        }

        const previousCount = (config.sudo || []).length;
        if (previousCount === 0) {
            return await sock.sendMessage(from, { text: '🛡️ [NOTICE] Sudo whitelist is already empty.' }, { quoted: msg });
        }

        config.sudo = [];

        try {
            const configPath = path.resolve(__dirname, '../config.js');
            let configContent = fs.readFileSync(configPath, 'utf8');
            const sudoArrayStr = `sudo: []`;
            if (configContent.includes('sudo')) {
                configContent = configContent.replace(/sudo\s*:\s*\[[\s\S]*?\]/, sudoArrayStr);
            }
            fs.writeFileSync(configPath, configContent, 'utf8');
        } catch (err) {
            console.error('Failed to update config.js file:', err);
        }

        await sock.sendMessage(from, { text: `🗑️ [MASS REVOCATION COMPLETE] ${previousCount} sudo node(s) purged from clearance whitelist.` }, { quoted: msg });
    }
};
