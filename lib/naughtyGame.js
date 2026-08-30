import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../database/naughty_questions.json');

class NaughtyLobbyManager {
    constructor() {
        this.questions = [];
        this.lobbies = new Map();
        this.loadQuestions();
    }

    loadQuestions() {
        try {
            if (fs.existsSync(DB_PATH)) {
                this.questions = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            } else {
                console.error('[PRIMUS_ERR] database/naughty_questions.json missing!');
            }
        } catch (e) {
            console.error('[PRIMUS_ERR] Failed to load questions:', e.message);
        }
    }

    createLobby(chatId, hostJid) {
        const lobby = {
            host: hostJid,
            players: [hostJid],
            started: false,
            usedQuestions: new Set(),
            turnIndex: 0
        };
        this.lobbies.set(chatId, lobby);
        return lobby;
    }

    getLobby(chatId) {
        return this.lobbies.get(chatId);
    }

    addPlayers(chatId, newJids) {
        const lobby = this.lobbies.get(chatId);
        if (!lobby) return null;

        let addedCount = 0;
        newJids.forEach(jid => {
            if (!lobby.players.includes(jid)) {
                lobby.players.push(jid);
                addedCount++;
            }
        });
        return { lobby, addedCount };
    }

    nextTurn(chatId) {
        const lobby = this.lobbies.get(chatId);
        if (!lobby || !lobby.started || lobby.players.length === 0) return null;

        if (lobby.usedQuestions.size >= this.questions.length) {
            lobby.usedQuestions.clear();
        }

        const available = this.questions.filter(q => !lobby.usedQuestions.has(q.id));
        const selected = available[Math.floor(Math.random() * available.length)];
        lobby.usedQuestions.add(selected.id);

        const currentPlayer = lobby.players[lobby.turnIndex];
        
        let randomTarget = currentPlayer;
        if (lobby.players.length > 1) {
            const pool = lobby.players.filter(p => p !== currentPlayer);
            randomTarget = pool[Math.floor(Math.random() * pool.length)];
        }

        lobby.turnIndex = (lobby.turnIndex + 1) % lobby.players.length;

        return {
            question: selected,
            target: currentPlayer,
            dmTarget: randomTarget
        };
    }

    endLobby(chatId) {
        return this.lobbies.delete(chatId);
    }
}

export default new NaughtyLobbyManager();
