import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../database/spin_players.json');
const STARTING_BALANCE = 1000;

function loadDB() {
    if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getBalance(jid) {
    const db = loadDB();
    if (!db[jid]) {
        db[jid] = { balance: STARTING_BALANCE, totalWon: 0, totalLost: 0 };
        saveDB(db);
    }
    return db[jid].balance;
}

export function adjustBalance(jid, amount) {
    const db = loadDB();
    if (!db[jid]) db[jid] = { balance: STARTING_BALANCE, totalWon: 0, totalLost: 0 };

    db[jid].balance += amount;
    if (db[jid].balance < 0) db[jid].balance = 0;

    if (amount > 0) db[jid].totalWon += amount;
    else db[jid].totalLost += Math.abs(amount);

    saveDB(db);
    return db[jid].balance;
}

export function getLeaderboard(limit = 10) {
    const db = loadDB();
    return Object.entries(db)
        .sort((a, b) => b[1].balance - a[1].balance)
        .slice(0, limit);
}

const activeRounds = new Map();

export function getRound(chatId) {
    return activeRounds.get(chatId);
}

export function createRound(chatId, hostJid) {
    const round = { host: hostJid, bets: {}, state: 'betting' };
    activeRounds.set(chatId, round);
    return round;
}

export function placeBet(chatId, jid, color, amount) {
    const round = activeRounds.get(chatId);
    if (!round || round.state !== 'betting') return { success: false, reason: 'no_round' };

    const balance = getBalance(jid);
    if (amount > balance) return { success: false, reason: 'insufficient_funds', balance };
    if (amount <= 0) return { success: false, reason: 'invalid_amount' };

    round.bets[jid] = { color, amount };
    return { success: true };
}

export function endRound(chatId) {
    activeRounds.delete(chatId);
}
