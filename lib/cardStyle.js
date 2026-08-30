export function buildCard({ sections, tip }) {
    let text = `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳   𝙶 𝙰 𝙼 𝙴 𝚂 ⚡\n\n`;

    for (const section of sections) {
        if (section.title) {
            text += `❖──────────【 ${section.title} 】──────────❖\n`;
        }
        for (const line of section.lines) {
            text += `│ ${line}\n`;
        }
        text += `❖─────────────────────────────❖\n`;
    }

    if (tip) {
        text += `💡 ${tip}\n`;
    }

    text += `\n└─ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑷𝒓𝒊𝒎𝒖𝒔 𝑴𝒅 ──`;
    return text;
}
