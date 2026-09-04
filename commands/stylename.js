export default {
    name: 'stylename',
    aliases: ['name', 'nickname', 'decoratename', 'symbolname'],
    description: 'Decorate a name or username with special symbols and fancy unicode fonts',
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

        const rawName = args.join(' ') || quotedText;

        if (!rawName) {
            return await sock.sendMessage(from, { 
                text: `⚠️ Please provide a name to style.\n\nExample: *#stylename Primus*` 
            }, { quoted: msg });
        }

        const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        const mapChars = (str, charMap) => {
            return str.split('').map(c => charMap[c] || c).join('');
        };

        const boldMap = Object.fromEntries([...normal].map((c, i) => [c, "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"[i]]));
        const scriptMap = Object.fromEntries([...normal].map((c, i) => [c, "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789"[i]]));
        const doubleMap = Object.fromEntries([...normal].map((c, i) => [c, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"[i]]));

        const boldName = mapChars(rawName, boldMap);
        const scriptName = mapChars(rawName, scriptMap);
        const doubleName = mapChars(rawName, doubleMap);

        const styles = [
            `꧁༺ ${boldName} ༻꧂`,
            `꧁𓊈𒆜 ${doubleName} 𒆜𓊉꧂`,
            `✿💋 ${scriptName} 💋✿`,
            `🌸ꗥ～ꗥ ${boldName} ꗥ～ꗥ🌸`,
            `─╤╦︻ ${doubleName} ︻╦╤─`,
            `★彡[ ${scriptName} ]彡★`,
            `⚔️✨ ${boldName} ✨⚔️`,
            `༺LeGeND༻ ${doubleName}`
        ];

        let responseText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙽 𝙰 𝙼 𝙴   𝚂 𝚃 𝚈 𝙻 𝙴 𝚁 ⚡\n\n`;
        styles.forEach((style, index) => {
            responseText += `${index + 1}. ${style}\n\n`;
        });
        responseText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: responseText.trim() }, { quoted: msg });
    }
};
