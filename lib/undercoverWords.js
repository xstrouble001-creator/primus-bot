export const WORD_PAIRS = [
    { civilian: 'Bitcoin', undercover: 'Ethereum' },
    { civilian: 'iPhone', undercover: 'Android' },
    { civilian: 'WhatsApp', undercover: 'Telegram' },
    { civilian: 'Football', undercover: 'Basketball' },
    { civilian: 'Coffee', undercover: 'Tea' },
    { civilian: 'Pizza', undercover: 'Burger' },
    { civilian: 'TikTok', undercover: 'YouTube' },
    { civilian: 'Batman', undercover: 'Spider-Man' },
    { civilian: 'Laptop', undercover: 'Tablet' },
    { civilian: 'Ferrari', undercover: 'Lamborghini' }
];

export function getRandomWordPair() {
    return WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
}
