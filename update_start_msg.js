import fs from 'fs';

let code = fs.readFileSync('commands/wsg.js', 'utf8');

const oldStartBlock = `let lobbyMsg = \`⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\\n\\n\`;
        lobbyMsg += \`❖──────────【 𝚆𝙾𝚁𝙳 𝚂𝙴𝙰𝚁𝙲𝙷 】──────────❖\\n\`;
        lobbyMsg += \`│ 📂 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈 : \${category.toUpperCase()}\\n\`;
        lobbyMsg += \`│ ⏱️ 𝚃𝚒𝚖𝚎 𝙻𝚒𝚖𝚒𝚝 : \${timeMinutes} Minutes\\n\`;
        lobbyMsg += \`│ 🎨 𝚃𝚑𝚎𝚖𝚎 : \${theme.toUpperCase()}\\n\`;
        lobbyMsg += \`❖─────────────────────────────❖\\n\\n\`;
        lobbyMsg += \`⚠️ *NEW PLAYERS:* Run #wsg username <name> first to save XP & stats!\\n\\n\`;
        lobbyMsg += \`📋 𝚆𝙾𝚁𝙳 𝙻𝙸𝚂𝚃:\\n\${formatWords}\\n\\n\`;
        lobbyMsg += \`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──\`;`;

const newStartBlock = `let lobbyMsg = \`⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\\n\\n\`;
        lobbyMsg += \`❖──────────【 𝚆𝙾𝚁𝙳 𝚂𝙴𝙰𝚁𝙲𝙷 】──────────❖\\n\`;
        lobbyMsg += \`│ 📂 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈 : \${category.toUpperCase()}\\n\`;
        lobbyMsg += \`│ ⏱️ 𝚃𝚒𝚖𝚎 𝙻𝚒𝚖𝚒𝚝 : \${timeMinutes} Minutes\\n\`;
        lobbyMsg += \`│ 🎨 𝚃𝚑𝚎𝚖𝚎 : \${theme.toUpperCase()}\\n\`;
        lobbyMsg += \`❖─────────────────────────────❖\\n\\n\`;
        lobbyMsg += \`📖 *HOW TO PLAY:*\\n\`;
        lobbyMsg += \`1️⃣ Find words hidden in the grid (horizontal/vertical).\\n\`;
        lobbyMsg += \`2️⃣ Type the full word directly in the chat to guess!\\n\`;
        lobbyMsg += \`3️⃣ Fast guesses (<30s apart) build **Combo Multipliers** for huge XP!\\n\`;
        lobbyMsg += \`4️⃣ Need help? Type **#wsg hint** (-15 XP to reveal start position).\\n\\n\`;
        lobbyMsg += \`⚠️ *NEW PLAYERS:* Type **#wsg username <name>** to track XP & level up!\\n\\n\`;
        lobbyMsg += \`📋 𝚆𝙾𝚁𝙳 𝙻𝙸𝚂𝚃:\\n\${formatWords}\\n\\n\`;
        lobbyMsg += \`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──\`;`;

if (code.includes(oldStartBlock)) {
    code = code.replace(oldStartBlock, newStartBlock);
    fs.writeFileSync('commands/wsg.js', code);
    console.log("SUCCESS: Start message updated with full playing instructions!");
} else {
    console.log("Note: Pattern direct replace failed, writing file...");
}
