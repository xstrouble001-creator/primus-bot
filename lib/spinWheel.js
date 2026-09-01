export const WHEEL = [
    { color: 'RED',    emoji: '🔴', weight: 30, payout: 2 },
    { color: 'BLUE',   emoji: '🔵', weight: 25, payout: 2.5 },
    { color: 'GREEN',  emoji: '🟢', weight: 20, payout: 3 },
    { color: 'YELLOW', emoji: '🟡', weight: 12, payout: 5 },
    { color: 'PURPLE', emoji: '🟣', weight: 8,  payout: 8 },
    { color: 'GOLD',   emoji: '🟠', weight: 4,  payout: 15 },
    { color: 'BLACK',  emoji: '⚫', weight: 1,  payout: 50 },
];

const TOTAL_WEIGHT = WHEEL.reduce((sum, c) => sum + c.weight, 0);

export function spinWheel() {
    let roll = Math.random() * TOTAL_WEIGHT;
    for (const segment of WHEEL) {
        if (roll < segment.weight) return segment;
        roll -= segment.weight;
    }
    return WHEEL[0];
}

export function getColorByName(name) {
    return WHEEL.find(c => c.color === name.toUpperCase());
}
