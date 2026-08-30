import { loadSettings, saveSettings } from '../lib/database.js';

export default {
    name: 'sudoplus',
    aliases: ['sudo+'],
    category: 'settings',
    desc: 'Grant full owner-level access to a user (Host Number Only)',
    execute: async (sock, msg, args, context) => {
        const { from, sender, sessionName } = context;

        // Strictly verify that the sender IS the host account itself
        const botOwnerJid = sock.user?.id || '';
        const botNumber = botOwnerJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        const senderNum = sender.split('@')[0].replace(/[^0-9]/g, '');

        const isLinkedDevice = msg.key.fromMe || senderNum === botNumber;

        if (!isLinkedDevice) {
            await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙰𝙲𝙲𝙴𝚂𝚂  𝙳𝙴𝙽𝙸𝙴𝙳 】──────────❖\n` +
`│ ❌ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙳𝙴𝙽𝙸𝙴𝙳\n` +
`│ 🔐 𝙻𝚎𝚟𝚎𝚕       : 𝙿𝚁𝙸𝙼𝙰𝚁𝚈 𝙷𝙾𝚂𝚃\n` +
`│ 🛡️ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : #sudo+\n` +
`❖─────────────────────────────❖\n\n` +
`❌ 𝙰𝚌𝚌𝚎𝚜𝚜 𝙳𝚎𝚗𝚒𝚎𝚍.\n\n` +
`⚡ 𝙾𝚗𝚕𝚢 𝚝𝚑𝚎 𝚙𝚛𝚒𝚖𝚊𝚛𝚢 𝚕𝚒𝚗𝚔𝚎𝚍\n` +
`   𝚍𝚎𝚟𝚒𝚌𝚎 𝚑𝚘𝚜𝚝 𝚊𝚌𝚌𝚘𝚞𝚗𝚝\n` +
`   𝚌𝚊𝚗 𝚎𝚡𝚎𝚌𝚞𝚝𝚎 #sudo+.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` 
            }, { quoted: msg });
            return;
        }

        // Determine target number via tag, reply, or raw string argument
        let target = '';
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (mentionedJid) {
            target = mentionedJid.split('@')[0];
        } else if (quotedParticipant) {
            target = quotedParticipant.split('@')[0];
        } else if (args[0]) {
            target = args[0].replace(/[^0-9]/g, '');
        }

        if (!target) {
            await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝚂𝚈𝙽𝚃𝙰𝚇  𝙶𝚄𝙸𝙳𝙴 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝚄𝚂𝙰𝙶𝙴\n` +
`│ 🛡️ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : #sudo+\n` +
`│ 📝 𝚁𝚎𝚚𝚞𝚒𝚛𝚎𝚍    : @user / Reply\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ #sudo+ @user\n` +
`➤ Reply to a message with #sudo+\n\n` +
`💡 𝙼𝚎𝚗𝚝𝚒𝚘𝚗 𝚊 𝚞𝚜𝚎𝚛 𝚘𝚛\n` +
`   𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎\n` +
`   𝚝𝚘 𝚐𝚛𝚊𝚗𝚝 𝚂𝚞𝚍𝚘 𝚊𝚌𝚌𝚎𝚜𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` 
            }, { quoted: msg });
            return;
        }

        const settings = loadSettings() || {};
        if (!Array.isArray(settings.owners)) {
            settings.owners = [];
        }

        if (settings.owners.includes(target)) {
            await sock.sendMessage(from, { 
                text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙾𝚆𝙽𝙴𝚁  𝚂𝚃𝙰𝚃𝚄𝚂 】──────────❖\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝚁𝙴𝙶𝙸𝚂𝚃𝙴𝚁𝙴𝙳\n` +
`│ 👤 𝚃𝚊𝚛𝚐𝚎𝚝      : @${target}\n` +
`│ 👑 𝚁𝚘𝚕𝚎        : 𝙾𝚆𝙽𝙴𝚁\n` +
`❖─────────────────────────────❖\n\n` +
`⚠️ @${target} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢\n` +
`   𝚒𝚗 𝚝𝚑𝚎 𝙾𝚠𝚗𝚎𝚛 𝚍𝚊𝚝𝚊𝚋𝚊𝚜𝚎.\n\n` +
`📌 𝙽𝚘 𝚌𝚑𝚊𝚗𝚐𝚎𝚜 𝚠𝚎𝚛𝚎 𝚖𝚊𝚍𝚎.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`,
                mentions: [`${target}@s.whatsapp.net`] 
            }, { quoted: msg });
            return;
        }

        // Elevate user to Full Owner
        settings.owners.push(target);
        saveSettings(settings);

        await sock.sendMessage(from, { 
            text:  `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙾𝚆𝙽𝙴𝚁  𝙰𝙲𝙲𝙴𝚂𝚂 】──────────❖\n` +
`│ 👑 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙶𝚁𝙰𝙽𝚃𝙴𝙳\n` +
`│ 👤 𝚃𝚊𝚛𝚐𝚎𝚝      : @${target}\n` +
`│ 🔓 𝙻𝚎𝚟𝚎𝚕       : 𝙵𝚄𝙻𝙻 𝙾𝚆𝙽𝙴𝚁\n` +
`❖─────────────────────────────❖\n\n` +
`👑 𝙵𝚞𝚕𝚕 𝙾𝚠𝚗𝚎𝚛 𝙰𝚌𝚌𝚎𝚜𝚜 𝙶𝚛𝚊𝚗𝚝𝚎𝚍!\n\n` +
`⚡ @${target} 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚊𝚍𝚍𝚎𝚍\n` +
`   𝚝𝚘 𝚝𝚑𝚎 𝙾𝚠𝚗𝚎𝚛𝚜 𝚕𝚒𝚜𝚝.\n\n` +
`🔓 𝚄𝚗𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍 𝚊𝚌𝚌𝚎𝚜𝚜 𝚝𝚘\n` +
`   𝚊𝚕𝚕 𝚋𝚘𝚝 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗\n` +
`   𝚊𝚌𝚝𝚒𝚟𝚊𝚝𝚎𝚍.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`,
            mentions: [`${target}@s.whatsapp.net`]
        }, { quoted: msg });
    }
};
