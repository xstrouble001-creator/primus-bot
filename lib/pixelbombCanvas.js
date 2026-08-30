import { createCanvas } from '@napi-rs/canvas';

export async function renderPixelBombGrid(size = 5, claimed = {}, revealAll = false) {
    const cellSize = 80;
    const padding = 20;
    const headerHeight = 60;
    const canvasWidth = size * cellSize + padding * 2;
    const canvasHeight = size * cellSize + padding * 2 + headerHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dark Cyberpunk Background
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Cyan Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

    // Title Header
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💣 PIXEL BOMB GRID 💣', canvasWidth / 2, 45);

    // Render Tiles
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const index = r * size + c;
            const tileNumber = index + 1;
            const x = padding + c * cellSize;
            const y = padding + headerHeight + r * cellSize;

            ctx.lineWidth = 2;

            if (claimed[index]) {
                const item = claimed[index];
                if (item.type === 'bomb') {
                    ctx.fillStyle = '#ff0055';
                    ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 28px sans-serif';
                    ctx.fillText('💥', x + cellSize / 2, y + cellSize / 2 + 10);
                } else {
                    ctx.fillStyle = '#00ff88';
                    ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillText('💎', x + cellSize / 2, y + cellSize / 2 + 8);
                }
            } else if (revealAll) {
                ctx.fillStyle = '#2a2a40';
                ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
                ctx.fillStyle = '#888888';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText(String(tileNumber), x + cellSize / 2, y + cellSize / 2 + 7);
            } else {
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
                ctx.strokeStyle = '#3a3a60';
                ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

                ctx.fillStyle = '#00f0ff';
                ctx.font = 'bold 22px sans-serif';
                ctx.fillText(String(tileNumber), x + cellSize / 2, y + cellSize / 2 + 8);
            }
        }
    }

    return canvas.toBuffer('image/png');
}
