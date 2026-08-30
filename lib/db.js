import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./database/groups.json');

export const loadDB = () => {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {
        return {};
    }
};

export const saveDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export const getGroupData = (jid) => {
    const db = loadDB();
    if (!db[jid]) {
        db[jid] = {
            antilink: false,
            antibot: false,
            antitag: false,
            antimention: false,
            warns: {}
        };
        saveDB(db);
    }
    return db[jid];
};

export const updateGroupData = (jid, key, value) => {
    getGroupData(jid); // ensures the group entry exists on disk first
    const db = loadDB();
    db[jid][key] = value;
    saveDB(db);
};

export const updateWarn = (jid, userId, count) => {
    getGroupData(jid); // ensures the group entry exists on disk first
    const db = loadDB();
    if (!db[jid].warns) db[jid].warns = {};
    db[jid].warns[userId] = count;
    saveDB(db);
};

export const getAntilinkStrikes = (jid, userId) => {
    getGroupData(jid); // ensures the group entry exists on disk first
    const db = loadDB();
    return db[jid].antilinkStrikes?.[userId] || 0;
};

export const updateAntilinkStrikes = (jid, userId, count) => {
    getGroupData(jid); // ensures the group entry exists on disk first
    const db = loadDB();
    if (!db[jid].antilinkStrikes) db[jid].antilinkStrikes = {};
    db[jid].antilinkStrikes[userId] = count;
    saveDB(db);
};
