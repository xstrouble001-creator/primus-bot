const RANKS = [
    { name: 'Gold', minLevel: 1, maxLevel: 9, levelsPerTier: 3 },
    { name: 'Platinum', minLevel: 10, maxLevel: 18, levelsPerTier: 3 },
    { name: 'Diamond', minLevel: 19, maxLevel: 27, levelsPerTier: 3 },
    { name: 'Master', minLevel: 28, maxLevel: 45, levelsPerTier: 6 },
];

export function getRank(level) {
    for (const rank of RANKS) {
        if (level >= rank.minLevel && level <= rank.maxLevel) {
            const levelIntoRank = level - rank.minLevel;
            const tierIndex = Math.floor(levelIntoRank / rank.levelsPerTier);
            const tier = 3 - tierIndex;
            return `${rank.name} ${Math.max(tier, 1)}`;
        }
    }
    return 'Mythic';
}

export function xpForNextLevel(level) {
    return 100;
}
