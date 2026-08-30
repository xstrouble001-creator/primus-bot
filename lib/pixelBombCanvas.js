import { createCanvas } from '@napi-rs/canvas';

const GRID_SIZE = 10;
const CELL_SIZE = 54;
const PADDING = 70;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE + PADDING * 2;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE + PADDING * 2 + 50;

// Vibrant, clean, high-contrast palette (Non-Neon)
const PLAYER_COLORS = [
    '#2563EB', // Royal Blue
    '#059669', // Emerald Green
    '#D97706', // Warm Amber
    '#7C3AED', // Vivid Purple
    '#DB2777', // Deep Rose
    '#0891B2'  // Ocean Cyan
];

export async function renderPixelGrid(gridState, playerColorMap, mode = 'MEDIUM') {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Smooth Charcoal Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Clean Outer Card Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, CANVAS_WIDTH - 24, CANVAS_HEIGHT - 24);

    // Header Title
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`PIXEL BOMB [${mode}]`, CANVAS_WIDTH / 2, 42);

    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    // Column Headers
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#38BDF8';
    for (let c = 0; c < GRID_SIZE; c++) {
        const x = PADDING + c * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillText(cols[c], x, PADDING - 18);
    }

    // Row Headers
    ctx.textAlign = 'right';
    for (let r = 0; r < GRID_SIZE; r++) {
        const y = PADDING + r * CELL_SIZE + CELL_SIZE / 2 + 6;
        ctx.fillText((r + 1).toString(), PADDING - 18, y);
    }

    // Draw Grid
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = PADDING + c * CELL_SIZE;
            const y = PADDING + r * CELL_SIZE;
            const cellKey = `${cols[c]}${r + 1}`;
            const cell = gridState[cellKey];

            if (cell.claimedBy) {
                if (cell.isBomb) {
                    // Bright Crimson Red for Bombs
                    ctx.fillStyle = '#E11D48';
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('💣', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 6);
                } else {
                    // Player Solid Color
                    const color = playerColorMap[cell.claimedBy] || '#2563EB';
                    ctx.fillStyle = color;
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 6);
                }
            } else {
                // High-Contrast Unclaimed Tile
                ctx.fillStyle = '#1E293B';
                ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);

                // Sharp readable coordinate label
                ctx.fillStyle = '#94A3B8';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(cellKey, x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 4);
            }
        }
    }

    return canvas.toBuffer('image/png');
}

export { PLAYER_COLORS };
