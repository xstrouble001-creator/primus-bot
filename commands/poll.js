export default {
    name: 'poll',
    description: 'Create an interactive group poll with custom options',
    category: 'group',
    execute: async (sock, msg, args, context) => {
        const { from } = context;
        const input = args.join(' ');
        const parts = input.split('|').map(p => p.trim()).filter(p => p.length > 0);

        if (parts.length < 3) {
            return sock.sendMessage(from, { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳 ⚡\n\n` +
`❖──────────【 𝙿𝙾𝙻𝙻  𝙲𝚁𝙴𝙰𝚃𝙾𝚁 】──────────❖\n` +
`│ 📊 𝙲𝚘𝚖𝚖𝚊𝚗𝚍     : .poll\n` +
`│ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜      : 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝙵𝚘𝚛𝚖𝚊𝚝\n` +
`│ 📝 𝚁𝚎𝚚𝚞𝚒𝚛𝚎𝚍    : 𝚀𝚞𝚎𝚜𝚝𝚒𝚘𝚗 + 𝙾𝚙𝚝𝚒𝚘𝚗𝚜\n` +
`❖─────────────────────────────❖\n\n` +
`📌 𝚄𝚂𝙰𝙶𝙴:\n` +
`➤ .poll Question | Option 1 | Option 2\n` +
`➤ .poll Question | Option 1 | Option 2 | Option 3\n\n` +
`💡 𝚈𝚘𝚞 𝚖𝚞𝚜𝚝 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊𝚝 𝚕𝚎𝚊𝚜𝚝 𝚝𝚠𝚘 𝚘𝚙𝚝𝚒𝚘𝚗𝚜.\n\n` +
`└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──` }, { quoted: msg });
        }

        const question = parts[0];
        const values = parts.slice(1);

        await sock.sendMessage(from, {
            poll: {
                name: question,
                values: values,
                selectableCount: 1
            }
        });
    }
};
