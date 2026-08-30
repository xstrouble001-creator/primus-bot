import fs from 'fs';
import path from 'path';
import { getRank } from './rankSystem.js';

const dbPath = path.join(process.cwd(), 'database', 'wsg_players.json');

function loadDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function getPlayer(jid) {
    const db = loadDB();
    return db[jid] || { xp: 0, level: 1, points: 0 };
}

export function addXP(jid, amount) {
    const db = loadDB();
    if (!db[jid]) db[jid] = { xp: 0, level: 1, points: 0 };

    db[jid].xp += amount;
    if (db[jid].xp < 0) db[jid].xp = 0;

    let leveledUp = false;
    while (db[jid].xp >= 100) {
        db[jid].xp -= 100;
        db[jid].level += 1;
        leveledUp = true;
    }

    saveDB(db);
    return { player: db[jid], leveledUp, rank: getRank(db[jid].level) };
}

export function getAllPlayers() {
    return loadDB();
}

export function getPlayerDisplay(jid) {
    const p = getPlayer(jid);
    return { ...p, rank: getRank(p.level) };
}
