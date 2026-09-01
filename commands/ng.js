import ngManager from '../lib/naughtyGame.js';

export default {
    name: 'ng',
    category: 'games',
    description: 'Primus MD Naughty Bot Lobby & Game Engine',
    async execute(sock, msg, args, context) {
        const { isSudo, isAdmin } = context;
        const isGroupAdmin = isAdmin;
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const subCommand = args[0] ? args[0].toLowerCase() : 'lobby';

        let lobby = ngManager.getLobby(chatId);

        switch (subCommand) {
            case 'lobby':
            case 'create': {
                if (!lobby) {
                    lobby = ngManager.createLobby(chatId, sender);
                }

                const hostNum = lobby.host.split('@')[0];
                let mentions = [lobby.host, ...lobby.players];

                let playerList = `│ 👑 Host: @${hostNum}\n│\n│ 👥 𝙰𝙲𝚃𝙸𝚅𝙴 𝙿𝙻𝙰𝚈𝙴𝚁𝚂 (${lobby.players.length}):\n`;
                lobby.players.forEach((p, idx) => {
                    const num = p.split('@')[0];
                    const icon = p === lobby.host ? '🔴' : '🟢';
                    const role = p === lobby.host ? ' (Host)' : '';
                    playerList += `│  ${idx + 1}. ${icon} @${num}${role}\n`;
                });

                let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\n\n`;
                text += `❖──────────【 😈 𝙽𝙰𝚄𝙶𝙷𝚃𝚈 𝙱𝙾𝚃 𝙻𝙾𝙱𝙱𝚈 😈 】──────────❖\n`;
                text += playerList;
                text += `│\n│ 📌 𝙷𝙾𝚆 𝚃𝙾 𝙹𝙾𝙸𝙽:\n`;
                text += `│ • Tag players: #ng add @player\n`;
                text += `│ • Host launches: #ng start\n`;
                text += `❖─────────────────────────────❖\n`;
                text += `💡 Waiting for the host to start the game...\n`;
                text += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

                await sock.sendMessage(chatId, { text, mentions });
                break;
            }

            case 'add': {
                if (!lobby) {
                    lobby = ngManager.createLobby(chatId, sender);
                }

                const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

                if (mentionedJids.length === 0) {
                    return await sock.sendMessage(chatId, { text: '⚠️ Mention at least one player to add! Example: `#ng add @player`' });
                }

                ngManager.addPlayers(chatId, mentionedJids);
                return this.execute(sock, msg, ['lobby'], context);
            }

            case 'start': {
                if (!lobby) {
                    return await sock.sendMessage(chatId, { text: '❌ No active lobby found! Type `#ng` to open one.' });
                }

                if (sender !== lobby.host && !isSudo && !isGroupAdmin) {
                    return await sock.sendMessage(chatId, { text: '❌ Only the lobby host or group admin can start the game!' });
                }

                lobby.started = true;
                await sock.sendMessage(chatId, { text: '🔥 *[ PRIMUS MD ]*: Naughty Game started! Drawing the first question...' });
                return this.execute(sock, msg, ['spin'], context);
            }

            case 'spin':
            case 'next': {
                if (!lobby || !lobby.started) {
                    return await sock.sendMessage(chatId, { text: '⚠️ Game is not active. Host must start with `#ng start`.' });
                }

                const isFirstSpin = lobby.lastAsked === null;
                const isTheOnePreviouslyAsked = lobby.lastAsked === sender;
                const isPrivileged = sender === lobby.host || isSudo || isGroupAdmin;

                if (!isFirstSpin && !isTheOnePreviouslyAsked && !isPrivileged) {
                    const lastAskedTag = `@${lobby.lastAsked.split('@')[0]}`;
                    return await sock.sendMessage(chatId, {
                        text: `⚠️ Only ${lastAskedTag} (the player just asked) or the host/admin can spin next!`,
                        mentions: [lobby.lastAsked]
                    });
                }

                const data = ngManager.nextTurn(chatId);
                if (!data) return;

                const { question, target, dmTarget } = data;
                const targetTag = `@${target.split('@')[0]}`;
                const dmTag = `@${dmTarget.split('@')[0]}`;

                let card =
`⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙽𝙰𝚄𝙶𝙷𝚃𝚈  𝙶𝙰𝙼𝙴 】──────────❖\n` +
`│ 🎯 𝚀-𝙸𝙳        : #${question.id}\n` +
`│ 👤 𝚃𝙰𝚁𝙶𝙴𝚃      : ${targetTag}\n` +
`❖─────────────────────────────❖\n\n` +
`📜 𝚀𝚄𝙴𝚂𝚃𝙸𝙾𝙽 / 𝙳𝙰𝚁𝙴\n\n` +
`"${question.question}"\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

                let mentions = [target];

                if (question.isMediaReq) {
                    card += `├▶ *MEDIA REQUIREMENT:* ⚠️ YES\n`;
                    card += `├▶ *SEND PROOF TO DM:* ${dmTag}\n│\n`;
                    mentions.push(dmTarget);
                } else {
                    card += `├▶ *MEDIA REQUIREMENT:* ❌ NONE\n│\n`;
                }

                card += `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;

                await sock.sendMessage(chatId, { text: card, mentions });
                break;
            }

            case 'end':
            case 'stop': {
                if (!lobby) {
                    return await sock.sendMessage(chatId, { text: '⚠️ No active lobby to end.' });
                }

                if (sender !== lobby.host && !isSudo && !isGroupAdmin) {
                    return await sock.sendMessage(chatId, { text: '❌ Only host or admin can terminate the lobby.' });
                }

                ngManager.endLobby(chatId);
                await sock.sendMessage(chatId, { text: '🛑 *[ PRIMUS MD ]*: Lobby closed and player memory reset.' });
                break;
            }
        }
    }
};
