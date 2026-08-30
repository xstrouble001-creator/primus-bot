import { createCanvas } from '@napi-rs/canvas';

const CARD_WIDTH = 600;

export async function renderUndercoverCard(game) {
    const players = Array.from(game.players);
    const CARD_HEIGHT = 120 + (players.length * 45);

    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Smooth Charcoal Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, CARD_WIDTH - 24, CARD_HEIGHT - 24);

    // Header Title
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🕵️ UNDERCOVER STATUS [${game.phase.toUpperCase()}]`, CARD_WIDTH / 2, 45);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Host: ${game.hostName} | Round: ${game.round}`, CARD_WIDTH / 2, 70);

    // Draw Player Status List
    ctx.textAlign = 'left';
    let startY = 105;

    players.forEach((playerJid, idx) => {
        const isAlive = !game.eliminated.has(playerJid);
        const name = game.playerNames[playerJid] || playerJid.split('@')[0];
        const isCurrentTurn = game.turnOrder[game.currentTurnIdx] === playerJid && game.phase === 'clue';

        // Row Box Background
        ctx.fillStyle = isAlive ? (isCurrentTurn ? '#1E3A8A' : '#1E293B') : '#27272A';
        ctx.fillRect(30, startY, CARD_WIDTH - 60, 36);

        ctx.strokeStyle = isCurrentTurn ? '#3B82F6' : '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, startY, CARD_WIDTH - 60, 36);

        // Player Name & Status
        ctx.fillStyle = isAlive ? '#F8FAFC' : '#71717A';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`${idx + 1}. ${name}`, 45, startY + 23);

        // Turn Indicator / Status
        ctx.textAlign = 'right';
        if (!isAlive) {
            const role = game.roles[playerJid];
            ctx.fillStyle = '#EF4444';
            ctx.fillText(`ELIMINATED (${role})`, CARD_WIDTH - 45, startY + 23);
        } else if (isCurrentTurn) {
            ctx.fillStyle = '#38BDF8';
            ctx.fillText('👉 CURRENT TURN', CARD_WIDTH - 45, startY + 23);
        } else {
            const votesReceived = Object.values(game.votes).filter(v => v === playerJid).length;
            ctx.fillStyle = '#10B981';
            ctx.fillText(game.phase === 'voting' ? `Votes: ${votesReceived}` : 'ALIVE', CARD_WIDTH - 45, startY + 23);
        }
        ctx.textAlign = 'left';

        startY += 45;
    });

    return canvas.toBuffer('image/png');
}
