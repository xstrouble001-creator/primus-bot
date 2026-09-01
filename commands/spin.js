import { renderSpinWheel } from '../lib/spinCanvas.js';
import { spinWheel, WHEEL, getColorByName } from '../lib/spinWheel.js';
import { getBalance, adjustBalance, getLeaderboard, getRound, createRound, placeBet, endRound } from '../lib/spinManager.js';

function normalizeJid(jid) {
    return jid.split(':')[0].split('@')[0] + '@s.whatsapp.net';
}

export default {
    name: 'spin',
    aliases: ['roulette', 'wheel'],
    description: 'Color prediction betting game for the whole group',
    category: 'games',
    groupOnly: true,
    async execute(sock, msg, args, context) {
        const { from, sender: rawSender, isSudo, isOwner } = context;
        const sender = normalizeJid(rawSender);
        const sub = args[0]?.toLowerCase();

        if (sub === 'help') {
            let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n`;
            text += `❖──────────【 🎡 𝚂𝙿𝙸𝙽 𝚆𝙷𝙴𝙴𝙻 】──────────❖\n`;
            text += `│ 🎮 #spin start — open a betting round\n`;
            text += `│ 💰 #spin bet <color> <amount> — place your bet\n`;
            text += `│ 🎯 #spin go — host spins the wheel\n`;
            text += `│ 💵 #spin balance — check your coins\n`;
            text += `│ 🏆 #spin leaderboard — top players\n`;
            text += `│\n│ 🎨 Colors: ${WHEEL.map(c => `${c.emoji}${c.color}`).join(', ')}\n`;
            text += `❖─────────────────────────────❖\n\n`;
            text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
            return await sock.sendMessage(from, { text }, { quoted: msg });
        }

        if (sub === 'balance' || sub === 'bal') {
            const balance = getBalance(sender);
            return await sock.sendMessage(from, { text: `💰 Your balance: *${balance}* coins` }, { quoted: msg });
        }

        if (sub === 'leaderboard' || sub === 'lb') {
            const top = getLeaderboard(10);
            if (top.length === 0) {
                return await sock.sendMessage(from, { text: '📋 No players yet.' }, { quoted: msg });
            }
            let text = `🏆 *SPIN WHEEL LEADERBOARD* 🏆\n\n`;
            top.forEach(([jid, data], idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
                text += `${medal} @${jid.split('@')[0]} — ${data.balance} coins\n`;
            });
            return await sock.sendMessage(from, { text, mentions: top.map(([jid]) => jid) }, { quoted: msg });
        }

        if (sub === 'start') {
            if (getRound(from)) {
                return await sock.sendMessage(from, { text: '⚠️ A round is already active! Use #spin bet to join.' }, { quoted: msg });
            }
            createRound(from, sender);
            const image = await renderSpinWheel(null);
            let caption = `🎡 *SPIN WHEEL ROUND OPEN!* 🎡\n\n`;
            caption += `💰 Bet with: #spin bet <color> <amount>\n`;
            caption += `🎨 Colors: ${WHEEL.map(c => `${c.emoji}${c.color}(${c.payout}x)`).join(' ')}\n\n`;
            caption += `⏳ Host runs #spin go when ready!`;
            return await sock.sendMessage(from, { image, caption }, { quoted: msg });
        }

        if (sub === 'bet') {
            const colorArg = args[1];
            const amount = parseInt(args[2]);
            const colorData = colorArg ? getColorByName(colorArg) : null;

            if (!colorData || !amount || amount <= 0) {
                return await sock.sendMessage(from, { text: `⚠️ *Usage:* #spin bet <color> <amount>\nColors: ${WHEEL.map(c => c.color).join(', ')}` }, { quoted: msg });
            }

            const result = placeBet(from, sender, colorData.color, amount);
            if (!result.success) {
                if (result.reason === 'no_round') return await sock.sendMessage(from, { text: '⚠️ No active round. Start one with #spin start.' }, { quoted: msg });
                if (result.reason === 'insufficient_funds') return await sock.sendMessage(from, { text: `❌ Not enough coins! Balance: ${result.balance}` }, { quoted: msg });
                return await sock.sendMessage(from, { text: '❌ Invalid bet.' }, { quoted: msg });
            }

            return await sock.sendMessage(from, {
                text: `✅ @${sender.split('@')[0]} bet *${amount}* on ${colorData.emoji} ${colorData.color} (${colorData.payout}x)`,
                mentions: [sender]
            }, { quoted: msg });
        }

        if (sub === 'go') {
            const round = getRound(from);
            if (!round) {
                return await sock.sendMessage(from, { text: '⚠️ No active round.' }, { quoted: msg });
            }
            if (sender !== round.host && !isSudo && !isOwner) {
                return await sock.sendMessage(from, { text: '❌ Only the round host or sudo/owner can spin.' }, { quoted: msg });
            }

            const betCount = Object.keys(round.bets).length;
            if (betCount === 0) {
                endRound(from);
                return await sock.sendMessage(from, { text: '⚠️ No one placed a bet — round cancelled.' }, { quoted: msg });
            }

            const winningSegment = spinWheel();
            const resultImage = await renderSpinWheel(winningSegment.color);

            let resultsText = `🎡 *${winningSegment.emoji} ${winningSegment.color} WINS!* (${winningSegment.payout}x)\n\n`;
            const mentions = [];

            for (const [jid, bet] of Object.entries(round.bets)) {
                mentions.push(jid);
                if (bet.color === winningSegment.color) {
                    const winnings = Math.round(bet.amount * winningSegment.payout);
                    adjustBalance(jid, winnings - bet.amount);
                    resultsText += `🎉 @${jid.split('@')[0]} won *${winnings}* coins!\n`;
                } else {
                    adjustBalance(jid, -bet.amount);
                    resultsText += `💸 @${jid.split('@')[0]} lost ${bet.amount} coins.\n`;
                }
            }

            endRound(from);
            await sock.sendMessage(from, { image: resultImage, caption: resultsText, mentions }, { quoted: msg });
            return;
        }

        return await this.execute(sock, msg, ['help'], context);
    }
};
