export const sendAnimatedLoader = async (sock, from, quotedMsg) => {
    // Previously this sent 5 sequential frames with 500ms sleeps between
    // each (~2.5s of forced delay + 4 extra message edits) on *every*
    // command call. Repeated rapid-fire message edits are also a known
    // trigger for WhatsApp-side instability on unofficial clients.
    // Callers only ever need ONE editable message key back — they do the
    // real "finish" edit themselves once their actual work is done — so
    // we now send a single lightweight status message instead.
    const sentMsg = await sock.sendMessage(
        from,
        { text: `⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳\n\n⚙️ _Processing..._` },
        { quoted: quotedMsg }
    );
    return sentMsg.key;
};
