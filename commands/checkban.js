import config from '../config.js';

export default {
    name: 'checkban',
    aliases: ['bancheck', 'banchecker'],
    description: 'Check if a phone number is registered on WhatsApp',
    category: 'domain expansion',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        let input = args.join('').replace(/[^0-9]/g, '');
        
        if (!input) {
            let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            responseText += `❖──────────【 𝙱𝙰𝙽  𝙲𝙷𝙴𝙲𝙺𝙴𝚁 】──────────❖\n│\n`;
            responseText += `│ ❌ *Usage:* ${config.prefix}checkban <phone_number>\n`;
            responseText += `│ 💡 *Example:* ${config.prefix}checkban 2349131719077\n│\n`;
            responseText += `❖─────────────────────────────❖\n\n`;
            responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            return await sock.sendMessage(from, { text: responseText }, { quoted: msg });
        }

        try {
            const [result] = await sock.onWhatsApp(input);

            let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            responseText += `❖──────────【 𝙱𝙰𝙽  𝙲𝙷𝙴𝙲𝙺𝙴𝚁 】──────────❖\n│\n`;

            if (!result || !result.exists) {
                responseText += `│ 📱 *Target:* +${input}\n`;
                responseText += `│ ⚠️ *Status:* fucked by Promus md\n│\n`;
            } else {
                responseText += `│ 📱 *Target:* +${input}\n`;
                responseText += `│ ✅ *Status:* Still standing\n`;
                responseText += `│ 🆔 *JID:* ${result.jid}\n│\n`;
            }

            responseText += `❖─────────────────────────────❖\n\n`;
            responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

            await sock.sendMessage(from, { text: responseText }, { quoted: msg });
        } catch (error) {
            console.error('Checkban Error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to verify the target number.' }, { quoted: msg });
        }
    }
};
