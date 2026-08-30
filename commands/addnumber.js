import { startSession, activeSessions } from '../lib/sessionManager.js';
import { commands, aliases } from '../index.js';
import config from '../config.js';

export default {
    name: 'pair',
    aliases: ['pair', 'adduser'],
    description: 'Pair a new WhatsApp number to the bot. Dev only.\nUsage: #addnumber <number>',
    category: 'settings',
    execute: async (sock, msg, args, context) => {
        const { from } = context;

        const devNumber = String(config.devNumber || '').replace(/[^0-9]/g, '');
        const senderNum = context.sender?.split('@')[0].replace(/[^0-9]/g, '');
        if (senderNum !== devNumber && !msg.key.fromMe) {
            return await sock.sendMessage(from, {
                text:
                    `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙰 𝙲 𝙲 𝙴 𝚂 𝚂  𝙳 𝙴 𝙽 𝙸 𝙴 𝙳 ⚡\n\n` +
                    `❖──────────【 🔒 Alpha 𝚉𝙾𝙽𝙴 】──────────❖\n` +
                    `│\n` +
                    `│ ⛔ 𝙲𝙻𝙰𝚂𝚂𝙸𝙵𝙸𝙲𝙰𝚃𝙸𝙾𝙽 : Alpha / 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝚃𝙴𝙳\n` +
                    `│ 🛡️ 𝚂𝚃𝙰𝚃𝚄𝚂          : 𝚄𝙽𝙰𝚄𝚃𝙷𝙾𝚁𝙸𝚉𝙴𝙳 𝙽𝙾𝙳𝙴\n` +
                    `│ 🔑 𝚁𝙴𝚀𝚄𝙸𝚁𝙴𝙳        : 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁  𝙲𝙻𝙴𝙰𝚁𝙰𝙽𝙲𝙴\n` +
                    `│\n` +
                    `❖─────────────────────────────❖\n\n` +
                    `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
        }

        const number = args[0]?.replace(/[^0-9]/g, '');
        if (!number || number.length < 7) {
            return await sock.sendMessage(from, {
                text:
                    `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶 ⚡\n\n` +
                    `❖──────────【 ⚡ 𝚂𝚈𝙽𝚃𝙰𝚇 𝙴𝚁𝚁𝙾𝚁 】──────────❖\n` +
                    `│\n` +
                    `│ 💡 𝚄𝚜𝚊𝚐𝚎   : ${config.prefix}addnumber <number>\n` +
                    `│ 📌 𝙴𝚡𝚊𝚖𝚙𝚕𝚎 : ${config.prefix}addnumber 2348012345678\n` +
                    `│\n` +
                    `❖─────────────────────────────❖\n\n` +
                    `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
        }

        const sessionName = `user_${number}`;

        if (activeSessions.has(sessionName)) {
            return await sock.sendMessage(from, {
                text:
                    `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶 ⚡\n\n` +
                    `❖──────────【 ⚠️ 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝙰𝙲𝚃𝙸𝚅𝙴 】──────────❖\n` +
                    `│\n` +
                    `│ 📱 ${number} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚕𝚒𝚗𝚔𝚎𝚍 𝚘𝚛 𝚙𝚎𝚗𝚍𝚒𝚗𝚐.\n` +
                    `│\n` +
                    `❖─────────────────────────────❖\n\n` +
                    `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
            }, { quoted: msg });
        }

        await sock.sendMessage(from, {
            text:
                `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶 ⚡\n\n` +
                `❖──────────【 📡 𝙸𝙽𝙸𝚃𝙸𝙰𝚃𝙸𝙽𝙶 】──────────❖\n` +
                `│\n` +
                `│ 📱 𝙽𝚞𝚖𝚋𝚎𝚛   : ${number}\n` +
                `│ ⏳ 𝚂𝚝𝚊𝚝𝚞𝚜   : 𝚁𝚎𝚚𝚞𝚎𝚜𝚝𝚒𝚗𝚐 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎...\n` +
                `│ 🕐 𝙴𝚃𝙰      : ~𝟺 𝚜𝚎𝚌𝚘𝚗𝚍𝚜\n` +
                `│\n` +
                `❖─────────────────────────────❖\n\n` +
                `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
        }, { quoted: msg });

        await startSession(
            { name: sessionName, number },
            commands,
            aliases,
            0,
            async (code, err) => {
                if (err || !code) {
                    return await sock.sendMessage(from, {
                        text:
                            `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶 ⚡\n\n` +
                            `❖──────────【 ❌ 𝙵𝙰𝙸𝙻𝙴𝙳 】──────────❖\n` +
                            `│\n` +
                            `│ ⛔ 𝙴𝚛𝚛𝚘𝚛 : ${err || 'Unknown error'}\n` +
                            `│ 💡 𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚒𝚗 𝚊 𝚏𝚎𝚠 𝚖𝚒𝚗𝚞𝚝𝚎𝚜.\n` +
                            `│\n` +
                            `❖─────────────────────────────❖\n\n` +
                            `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
                    }, { quoted: msg });
                }

                await sock.sendMessage(from, {
                    text:
                        `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶 ⚡\n\n` +
                        `❖──────────【 🔑 𝙲𝙾𝙳𝙴 𝚁𝙴𝙰𝙳𝚈 】──────────❖\n` +
                        `│\n` +
                        `│ 📱 𝙽𝚞𝚖𝚋𝚎𝚛 : ${number}\n` +
                        `│ 🔑 𝙲𝙾𝙳𝙴   : *${code}*\n` +
                        `│\n` +
                        `│ 📲 𝙾𝚙𝚎𝚗 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚘𝚗 𝚝𝚑𝚊𝚝 𝚙𝚑𝚘𝚗𝚎:\n` +
                        `│    𝙻𝚒𝚗𝚔𝚎𝚍 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 › 𝙻𝚒𝚗𝚔 𝚠𝚒𝚝𝚑\n` +
                        `│    𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 › 𝚃𝚢𝚙𝚎 𝚝𝚑𝚎 𝚌𝚘𝚍𝚎\n` +
                        `│\n` +
                        `│ ⚡ 𝙴𝚗𝚝𝚎𝚛 𝚒𝚝 𝚒𝚖𝚖𝚎𝚍𝚒𝚊𝚝𝚎𝚕𝚢 — 𝚌𝚘𝚍𝚎𝚜 𝚎𝚡𝚙𝚒𝚛𝚎 𝚏𝚊𝚜𝚝.\n` +
                        `│\n` +
                        `❖─────────────────────────────❖\n\n` +
                        `└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`
                }, { quoted: msg });
            }
        );
    }
};
