import { createCanvas } from '@napi-rs/canvas';

/**
 * Generates a dynamic RPG/Boss Raid Status Card image buffer.
 */
export async function renderRaidCard(bossData, playersData) {
    const width = 800;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background Gradient (Cyberpunk Dark Theme)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0a12');
    bgGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Header Title
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('⚡ PIXEL DUNGEON BOSS RAID ⚡', 30, 50);

    // Boss Box
    ctx.fillStyle = '#16213e';
    ctx.fillRect(30, 70, 740, 100);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 70, 740, 100);

    // Boss Info & Health Bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`👹 ${bossData.name}`, 50, 105);

    const hpPercent = Math.max(0, bossData.hp / bossData.maxHp);
    ctx.fillStyle = '#333333';
    ctx.fillRect(50, 120, 700, 25);
    ctx.fillStyle = hpPercent > 0.3 ? '#e94560' : '#ff0055';
    ctx.fillRect(50, 120, 700 * hpPercent, 25);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${bossData.hp} / ${bossData.maxHp} HP`, 360, 138);

    // Players Section
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('PARTY STATUS:', 30, 205);

    let startY = 230;
    const playerJids = Object.keys(playersData);

    playerJids.forEach((jid, idx) => {
        const p = playersData[jid];
        const y = startY + (idx * 50);

        // Player Box
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(30, y, 740, 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        const name = `@${jid.split('@')[0]}`;
        ctx.fillText(`${idx + 1}. ${name} (${p.role.name})`, 45, y + 26);

        // Player HP Bar
        const pPercent = Math.max(0, p.hp / p.maxHp);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(450, y + 10, 300, 20);
        ctx.fillStyle = p.hp > 0 ? '#00ff88' : '#555555';
        ctx.fillRect(450, y + 10, 300 * pPercent, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${p.hp}/${p.maxHp} HP`, 580, y + 25);
    });

    return await canvas.toBuffer('image/png');
}

/**
 * Generates a visual Tactical Radar Map for City Heist / Map events.
 */
export async function renderTacticalMap(gridSize, playerPositions, objectivePos) {
    const tileSize = 60;
    const padding = 40;
    const width = (gridSize * tileSize) + (padding * 2);
    const height = (gridSize * tileSize) + (padding * 2);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Grid Background
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, width, height);

    // Grid Lines
    ctx.strokeStyle = '#1f293d';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(padding + (i * tileSize), padding);
        ctx.lineTo(padding + (i * tileSize), height - padding);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(padding, padding + (i * tileSize));
        ctx.lineTo(width - padding, padding + (i * tileSize));
        ctx.stroke();
    }

    // Render Objective / Vault
    if (objectivePos) {
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(
            padding + (objectivePos.x * tileSize) + (tileSize / 2),
            padding + (objectivePos.y * tileSize) + (tileSize / 2),
            18, 0, Math.PI * 2
        );
        ctx.fill();
    }

    // Render Players
    playerPositions.forEach((p) => {
        ctx.fillStyle = p.color || '#00e5ff';
        ctx.fillRect(
            padding + (p.x * tileSize) + 10,
            padding + (p.y * tileSize) + 10,
            tileSize - 20, tileSize - 20
        );
    });

    return await canvas.toBuffer('image/png');
}
