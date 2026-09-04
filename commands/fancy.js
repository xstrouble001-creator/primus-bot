export default {
    name: 'fancy',
    aliases: ['font', 'fonts', 'fancytext'],
    description: 'Convert plain text into various unicode fancy fonts',
    category: 'stylish hub',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const mType = Object.keys(msg.message || {})[0];
        const unwrap = (mType === 'viewOnceMessage' || mType === 'ephemeralMessage') 
            ? msg.message[mType].message 
            : msg.message;

        const contextInfo = unwrap?.extendedTextMessage?.contextInfo;
        const quotedText = contextInfo?.quotedMessage?.conversation || 
                           contextInfo?.quotedMessage?.extendedTextMessage?.text;

        const textToTransform = args.join(' ') || quotedText;

        if (!textToTransform) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide text or reply to a message.\n\nExample: *#fancy Primus MD*` 
            }, { quoted: msg });
        }

        const mapChars = (str, charMap) => {
            return str.split('').map(c => charMap[c] || c).join('');
        };

        const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        const fonts = {
            mono: mapChars(textToTransform, Object.fromEntries([...normal].map((c, i) => [c, "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"[i]]))),
            bold: mapChars(textToTransform, Object.fromEntries([...normal].map((c, i) => [c, "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"[i]]))),
            script: mapChars(textToTransform, Object.fromEntries([...normal].map((c, i) => [c, "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789"[i]]))),
            double: mapChars(textToTransform, Object.fromEntries([...normal].map((c, i) => [c, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"[i]])))
        };

        const responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙵 𝙰 𝙽 𝙲 𝚈 ⚡\n\n` +
                             `❖──────────【 𝙵𝙾𝙽𝚃  𝚂𝚃𝚈𝙻𝙴𝚂 】──────────❖\n\n` +
                             `1. 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎 :\n${fonts.mono}\n\n` +
                             `2. Bold Sans :\n${fonts.bold}\n\n` +
                             `3. Script Cursive :\n${fonts.script}\n\n` +
                             `4. Double Struck :\n${fonts.double}\n\n` +
                             `❖─────────────────────────────❖\n\n` +
                             `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText.trim() }, { quoted: msg });
    }
};
