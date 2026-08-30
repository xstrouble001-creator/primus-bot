export async function sendLoadingAnimation(sock, jid, msg) {
    const frames = [
        "⚡ [██░░░░░░░░] 𝑷𝒓𝒐𝒄𝒆𝒔𝒔𝒊𝒏𝒈...",
        "⚡ [████░░░░░░] 𝑺𝒆𝒂𝒓𝒄𝒉𝒊𝒏𝒈 𝑸𝒖𝒂𝒅𝒓𝒂𝒏𝒕...",
        "⚡ [███████░░░] 𝑭𝒆𝒕𝒄𝒉𝒊𝒏𝒈 𝑴𝒆𝒕𝒂𝒅𝒂𝒕𝒂...",
        "⚡ [██████████] 𝑴𝒂𝒕𝒄𝒉 𝑭𝒐𝒖𝒏𝒅!"
    ];

    const sentMsg = await sock.sendMessage(jid, { text: frames[0] }, { quoted: msg });
    
    for (let i = 1; i < frames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        await sock.sendMessage(jid, { text: frames[i], edit: sentMsg.key });
    }
    
    return sentMsg;
}
