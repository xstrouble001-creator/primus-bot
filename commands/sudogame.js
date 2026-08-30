import fs from 'fs';
import path from 'path';
import { resolveCanonicalJid } from '../lib/jidResolver.js';

const DB_PATH = path.join(process.cwd(), 'database', 'wsg_players.json');

function getPlayerData(userId) {
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        if (!data[userId]) {
            data[userId] = { xp: 0, level: 1 };
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        }
        return data[userId];
    } catch (e) {
        return { xp: 0, level: 1 };
    }
}

export default {
    name: 'sudogame',
    description: 'Add a player to any active game lobby',
    category: 'games',
    execute: async (sock, msg, args, context) => {
        const { from, isGroup, sender, isOwner, isSudo, quotedMessage } = context;

        if (!isGroup) {
            await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙 𝚌𝚑𝚊𝒕𝚜!' }, { quoted: msg });
            return;
        }

        if (!global.activeLobbies || !global.activeLobbies[from]) {
            await sock.sendMessage(from, { text: '⚠️ 𝙽𝚘 𝚊𝚌𝚝𝚒𝚟𝚎 𝚐𝚊𝚖𝚎 𝚕𝚘𝚋𝚋𝚢 𝚏𝚘𝚞𝚗𝚍 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙!' }, { quoted: msg });
            return;
        }

        const lobby = global.activeLobbies[from];
        if (lobby.started || lobby.state === 'ingame') {
            await sock.sendMessage(from, { text: '⚠️ 𝚃𝚑𝚎 𝚐𝚊𝚖𝚎 𝚑𝚊𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚜𝚝𝚊𝚛𝚝𝚎𝚍! 𝚈𝚘𝚞 𝚌𝚊𝚗𝚗𝚘𝚝 𝚊𝚍𝚍 𝚗𝚎𝚠 𝚙𝚕𝚊𝚢𝚎𝚛𝚜 𝚗𝚘𝚠.' }, { quoted: msg });
            return;
        }

        const isHost = lobby.host === sender;
        if (!isOwner && !isSudo && !isHost) {
            await sock.sendMessage(from, { text: '⚠️ 𝙾𝚗𝚕𝚢 𝚝𝚑𝚎 𝚕𝚘𝚋𝚋𝚢 𝚘𝛀𝚗𝚎𝚛 𝚘𝚛 𝚋𝚘𝚝 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚊𝚍𝚍 𝚙𝚕𝚊𝚢𝚎𝚛𝚜 𝚝𝚘 𝚝𝚑𝚒𝚜 𝚕𝚘𝚋𝚋𝚢!' }, { quoted: msg });
            return;
        }

        let rawTarget = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            rawTarget = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (quotedMessage && quotedMessage.sender) {
            rawTarget = quotedMessage.sender;
        }

        if (!rawTarget) {
            await sock.sendMessage(from, { text: '⚠️ 𝑷𝒍𝒆𝒂𝒔𝒆 𝒕𝒂𝒈 𝒂 𝒑𝒍𝒂𝒚𝒆𝒓 (@user) 𝒐𝒓 𝒓𝒆𝒑𝒍𝒚 𝒕𝒐 𝒕𝒉𝒆𝒊𝒓 𝒎𝒆𝒔𝒔𝒂𝒈𝒆 𝒕𝒐 𝒂𝒅𝒅 𝒕𝒉𝒆𝒎!' }, { quoted: msg });
            return;
        }

        const targetUser = await resolveCanonicalJid(sock, from, rawTarget);

        if (lobby.players.some(p => p.id === targetUser)) {
            await sock.sendMessage(from, { text: `⚠️ @${targetUser.split('@')[0]} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚒𝚗 𝚝𝚑𝚎 𝚕𝚘𝚋𝚋𝚢!`, mentions: [targetUser] }, { quoted: msg });
            return;
        }

        const playerData = getPlayerData(targetUser);
        lobby.players.push({ id: targetUser, level: playerData.level });

        let playersListText = '';
        const mentions = [];
        lobby.players.forEach((p, idx) => {
            const tag = `@${p.id.split('@')[0]}`;
            mentions.push(p.id);
            const role = p.id === lobby.host ? ' (Host)' : '';
            const indicator = idx === 0 ? '👑' : '⚪';
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
        lobbyText += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

        await sock.sendMessage(from, { text: lobbyText, mentions }, { quoted: msg });
    }
};
