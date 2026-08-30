import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./database/settings.json');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Initialize file if missing
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ groups: {} }, null, 2), 'utf-8');
}

// In-memory cache so we don't hit disk on every single message
let settingsCache = null;

export const loadSettings = () => {
    if (settingsCache) return settingsCache;
    try {
        if (!fs.existsSync(dbPath)) return (settingsCache = { groups: {} });
        const data = fs.readFileSync(dbPath, 'utf-8');
        settingsCache = JSON.parse(data) || { groups: {} };
        return settingsCache;
    } catch (err) {
        console.error('❌ [DB ERROR] Failed to load settings:', err);
        return (settingsCache = { groups: {} });
    }
};

export const saveSettings = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
        settingsCache = data; // keep cache in sync with what we just wrote
        console.log('✅ [DB SUCCESS] Settings successfully written to disk!');
        return true;
    } catch (err) {
        console.error('❌ [DB ERROR] Failed to save settings to disk:', err);
        return false;
    }
};
