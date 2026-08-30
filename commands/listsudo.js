import config from '../config.js';
import { getMentionName } from '../lib/nameCache.js';

export default {
    name: 'listsudo',
    aliases: ['sudolist'],
    description: 'List all users currently granted sudo access, owner only command',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isOwner } = context;
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '⚠️ [ACCESS DENIED] Root privilege required to view clearance nodes.' }, { quoted: msg });
        }

        const sudoList = config.sudo || [];
        if (sudoList.length === 0) {
            return await sock.sendMessage(from, { text: '🛡️ [NOTICE] No sudo users are currently whitelisted.' }, { quoted: msg });
        }

        let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        text += `❖──────────【 𝚂𝚄𝙳𝙾 𝙽𝙾𝙳𝙴𝚂 】──────────❖\n│\n`;
        sudoList.forEach((jid, idx) => {
            const num = jid.split('@')[0];
            const name = getMentionName(jid) || num;
            text += `│ ${idx + 1}. @${num} — ${name}\n`;
        });
        text += `│\n❖─────────────────────────────❖\n\n`;
        text += `📊 𝚃𝚘𝚝𝚊𝚕: ${sudoList.length} node(s)\n\n`;
        text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text, mentions: sudoList }, { quoted: msg });
    }
};
