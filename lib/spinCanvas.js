import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import { WHEEL } from './spinWheel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_FAMILY = 'SpinRoboto';

let fontRegistered = false;
function ensureFontRegistered() {
    if (fontRegistered) return;
    try {
        GlobalFonts.registerFromPath(path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'), FONT_FAMILY);
        fontRegistered = true;
    } catch (e) {
        console.error('❌ [SPIN CANVAS] Font registration failed:', e.message);
    }
}

const COLOR_HEX = {
    RED: '#e63946', BLUE: '#3a86ff', GREEN: '#2dc653',
    YELLOW: '#ffd60a', PURPLE: '#9d4edd', GOLD: '#ff9500', BLACK: '#1a1a1a'
};

const SIZE = 500;
const CENTER = SIZE / 2;
const RADIUS = 220;

export async function renderSpinWheel(winningColor = null) {
    ensureFontRegistered();
    const font = fontRegistered ? FONT_FAMILY : 'sans-serif';

    const canvas = createCanvas(SIZE, SIZE + 60);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, SIZE, SIZE + 60);

    const totalWeight = WHEEL.reduce((s, c) => s + c.weight, 0);
    let startAngle = -Math.PI / 2;
    let winningMidAngle = null;

    for (const segment of WHEEL) {
        const sliceAngle = (segment.weight / totalWeight) * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;
        const midAngle = startAngle + sliceAngle / 2;

        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLOR_HEX[segment.color];
        ctx.fill();
        ctx.strokeStyle = '#0d1117';
        ctx.lineWidth = 3;
        ctx.stroke();

        const labelR = RADIUS * 0.68;
        const lx = CENTER + Math.cos(midAngle) * labelR;
        const ly = CENTER + Math.sin(midAngle) * labelR;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.fillStyle = segment.color === 'BLACK' ? '#fff' : '#000';
        ctx.font = `bold 16px ${font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${segment.payout}x`, 0, 0);
        ctx.restore();

        if (winningColor && segment.color === winningColor) {
            winningMidAngle = midAngle;
        }

        startAngle = endAngle;
    }

    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#58a6ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CENTER - 15, CENTER - RADIUS - 25);
    ctx.lineTo(CENTER + 15, CENTER - RADIUS - 25);
    ctx.lineTo(CENTER, CENTER - RADIUS + 5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    if (winningMidAngle !== null) {
        const winningSegment = WHEEL.find(c => c.color === winningColor);
        const sliceAngle = (winningSegment.weight / totalWeight) * Math.PI * 2;
        const highlightStart = winningMidAngle - sliceAngle / 2;
        const highlightEnd = winningMidAngle + sliceAngle / 2;

        ctx.beginPath();
        ctx.arc(CENTER, CENTER, RADIUS + 6, highlightStart, highlightEnd);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffd60a';
        ctx.stroke();
    }

    ctx.fillStyle = '#58a6ff';
    ctx.font = `bold 26px ${font}`;
    ctx.textAlign = 'center';
    if (winningColor) {
        ctx.fillText(`${winningColor} WINS!`, CENTER, SIZE + 40);
    } else {
        ctx.fillText('PLACE YOUR BETS', CENTER, SIZE + 40);
    }

    return canvas.encode('png');
}
