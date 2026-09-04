import config from '../config.js';

export default {
    name: 'banmethod',
    aliases: ['banmeth'],
    description: 'Share contact vCard for support or inquiries',
    category: 'domain expansion',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const devNum = (config.devNumber || '2349131719077').replace(/[^0-9]/g, '');

        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:Takamura ban\n'
            + 'ORG:Primus Inc;\n'
            + `TEL;type=CELL;type=VOICE;waid=${devNum}:+${devNum}\n`
            + 'END:VCARD';

        await sock.sendMessage(from, {
            contacts: {
                displayName: 'Primus Admin Support',
                contacts: [{ vcard }]
            }
        }, { quoted: msg });

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
        responseText += `❖──────────【 𝙱𝙰𝙽  𝙼𝙴𝚃𝙷𝙾𝙳 】──────────❖\n│\n`;
        responseText += `│ 📜 Contact the dev card above\n`;
        responseText += `│    f.\n│\n`;
        responseText += `❖─────────────────────────────❖\n\n`;
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
