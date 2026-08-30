export default {
    name: 'delsudogame',
    description: 'Remove a player from any active game lobby',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from, isGroup, sender, isOwner, isSudo, quotedMessage } = context;

        if (!isGroup) {
            await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙 𝚌𝚑𝚊𝚝𝚜!' }, { quoted: msg });
            return;
        }

        if (!global.activeLobbies || !global.activeLobbies[from]) {
            await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘 𝚊𝚌𝚝𝚒𝚟𝚎 𝚐𝚊𝚖𝚎 𝚕𝚘𝚋𝚋𝚢 𝚏𝚘𝚞𝚗𝚍 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙!' }, { quoted: msg });
            return;
        }

        const lobby = global.activeLobbies[from];
        if (lobby.started) {
            await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚎 𝚐𝚊𝚖𝚎 𝚑𝚊𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚜𝚝𝚊𝚛𝚝𝚎𝚍! 𝚈𝚘𝚞 𝚌𝚊𝚗𝚗𝚘𝚝 𝚛𝚎𝚖𝚘𝚟𝚎 𝚙𝚕𝚊𝚢𝚎𝚛𝚜 𝚗𝚘𝚠.' }, { quoted: msg });
            return;
        }

        const isHost = lobby.host === sender;
        if (!isOwner && !isSudo && !isHost) {
            await sock.sendMessage(from, { text: '⚠️ 𝙾𝚗𝚕𝚢 𝚝𝚑𝚎 𝚕𝚘𝚋𝚋𝚢 𝚘𝛀𝚗𝚎𝚛 𝚘𝚛 𝚋𝚘𝚝 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚛𝚎𝚖𝚘𝚟𝚎 𝚙𝚕𝚊𝚢𝚎𝚛𝚜!' }, { quoted: msg });
            return;
        }

        let targetUser = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            targetUser = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (quotedMessage && quotedMessage.sender) {
            targetUser = quotedMessage.sender;
        }

        if (!targetUser) {
            await sock.sendMessage(from, { text: '⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒕𝒂𝒈 𝒂 𝒑𝒍𝒂𝒚𝒆𝒓 (@user) 𝒐𝒓 𝒓𝒆𝒑𝒍𝒚 𝒕𝒐 𝒕𝒉𝒆𝒊𝒓 𝒎𝒆𝒔ᱥ𝚊𝒈𝒆 𝒕𝒐 𝒓𝒆𝚖𝒐𝒗𝒆 𝒕𝒉𝒆𝒎!' }, { quoted: msg });
            return;
        }

        if (targetUser === lobby.host) {
            await sock.sendMessage(from, { text: `⚠️ 𝒀𝒐𝒖 𝒄𝒂𝒏𝒏𝒐𝒕 𝒓𝒆𝚖𝒐𝒗𝒆 𝒕𝒉𝒆 𝒍𝒐𝒃𝒃𝒚 𝒉𝒐𝒔𝒕! Use #${lobby.triggerCmd} stop to cancel the entire room.` }, { quoted: msg });
            return;
        }

        const initialLength = lobby.players.length;
        lobby.players = lobby.players.filter(p => p.id !== targetUser);

        if (lobby.players.length === initialLength) {
            await sock.sendMessage(from, { text: `⚠️ 𝑼𝒔𝒆𝒓 @${targetUser.split('@')[0]} 𝒘𝒂𝒔 𝒏𝒐𝒕 𝒇𝒐𝒖𝒏𝒅 𝒊𝒏 𝒕𝒉𝒊𝒔 𝒍𝒐𝒃𝒃🇾.`, mentions: [targetUser] }, { quoted: msg });
            return;
        }

        let playersListText = '';
        const mentions = [];
        lobby.players.forEach((p, idx) => {
            const tag = `@${p.id.split('@')[0]}`;
            mentions.push(p.id);
            const role = p.id === lobby.host ? ' (Host)' : '';
            const indicator = idx === 0 ? '🟢' : '⚪';
            playersListText += `│ ${indicator} ${idx + 1}. ${tag} [LVL ${p.level}]${role}\n`;
        });

        let lobbyText = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\n\n`;
        lobbyText += `❖──────────【 𝙻𝙾𝙱𝙱𝚈 𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n`;
        lobbyText += `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂 : LOBBY CREATED... WAITING FOR PLAYERS\n`;
        lobbyText += `│ 📌 𝚃𝚒𝚙: Use #sudogame @player or reply to their text\n`;
        lobbyText += `│         to let them join your battle room!\n`;
        lobbyText += `│ 👑 𝙻𝚘𝚋𝚋𝚢 𝙾𝚠𝚗𝚎𝚛 : @${lobby.host.split('@')[0]}\n`;
        lobbyText += `│ 🎮 𝙶𝚊𝚖𝚎 : ${lobby.gameName.toUpperCase()}\n`;
        lobbyText += `│ ⏱️ 𝚃𝚒𝚖𝚎 𝚂𝚎𝚝 : ${lobby.timeMinutes} ${lobby.timeMinutes === 1 ? 'Minute' : 'Minutes'}\n`;
        lobbyText += `│ 📂 𝙲𝚊𝚃𝚎𝚐𝚘𝚛𝚢 : ${lobby.category.toUpperCase()}\n`;
        lobbyText += `❖──────────【 𝙿𝙻𝙰𝚈𝙴𝚁𝚂 𝙕𝙾𝙽𝙴 】──────────❖\n`;
        lobbyText += playersListText;
        lobbyText += `❖─────────────────────────────❖\n`;
        lobbyText += `💡 Type #${lobby.triggerCmd} start to launch or #${lobby.triggerCmd} stop to cancel.\n\n`;
        lobbyText += `└─ 𝑷𝒐𝑘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝚍 ──`;

        await sock.sendMessage(from, { text: lobbyText, mentions }, { quoted: msg });
    }
};
