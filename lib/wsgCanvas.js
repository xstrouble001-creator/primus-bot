import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_FAMILY = 'WSGRoboto';

let fontRegistered = false;
function ensureFontRegistered() {
    if (fontRegistered) return;
    try {
        GlobalFonts.registerFromPath(path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'), FONT_FAMILY);
        fontRegistered = true;
    } catch (e) {
        console.error('❌ [WSG CANVAS] Failed to register bundled font, falling back to system font:', e.message);
    }
}

const CELL_SIZE = 42;
const PADDING = 24;
const HEADER_HEIGHT = 90;

const THEME = {
    bg: '#0d1117',
    gridBg: '#161b22',
    letterDefault: '#c9d1d9',
    letterFound: '#39ff88',
    foundCellBg: 'rgba(57,255,136,0.18)',
    border: '#30363d',
    headerText: '#58a6ff'
};

export async function renderWSGGrid(grid, wordLocations, foundWords, meta = {}) {
    const dim = grid.length;
    const width = dim * CELL_SIZE + PADDING * 2;
    const height = dim * CELL_SIZE + PADDING * 2 + HEADER_HEIGHT;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = THEME.headerText;
    ensureFontRegistered();
    ctx.font = `bold 20px ${fontRegistered ? FONT_FAMILY : 'sans-serif'}`;
    ctx.textAlign = 'left';
    ctx.fillText(`Category: ${(meta.category || '').toUpperCase()}`, PADDING, 30);
    ctx.fillText(`Time: ${meta.timeLabel || ''}`, PADDING, 55);
    ctx.fillText(`Lobby owner: ${meta.ownerName || ''}`, PADDING, 80);

    const foundCellSet = new Set();
    if (Array.isArray(wordLocations) && Array.isArray(foundWords)) {
        for (const loc of wordLocations) {
            if (foundWords.includes(loc.word)) {
                for (const cell of loc.cells) {
                    foundCellSet.add(`${cell.r},${cell.c}`);
                }
            }
        }
    }

    const gridTop = HEADER_HEIGHT + PADDING;

    ctx.fillStyle = THEME.gridBg;
    ctx.fillRect(PADDING, gridTop, dim * CELL_SIZE, dim * CELL_SIZE);

    ctx.font = `bold 22px ${fontRegistered ? FONT_FAMILY : 'monospace'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let r = 0; r < dim; r++) {
        for (let c = 0; c < dim; c++) {
            const x = PADDING + c * CELL_SIZE;
            const y = gridTop + r * CELL_SIZE;
            const isFound = foundCellSet.has(`${r},${c}`);

            if (isFound) {
                ctx.fillStyle = THEME.foundCellBg;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }

            ctx.strokeStyle = THEME.border;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            ctx.fillStyle = isFound ? THEME.letterFound : THEME.letterDefault;
            ctx.fillText(grid[r][c], x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 1);
        }
    }

    return canvas.encode('png');
}

export function maskWord(word, foundWords) {
    if (foundWords.includes(word)) return `${word} ✅`;
    return word[0] + ' _'.repeat(word.length - 1);
}
