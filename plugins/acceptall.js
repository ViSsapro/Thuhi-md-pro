const { cmd } = require('../command');
const sleep = ms => new Promise(r => setTimeout(r, ms));

cmd({
    pattern: "acceptall",
    alias: ["approveall"],
    react: "⏳",
    desc: "Accept all pending group requests",
    category: "owner",
    filename: __filename,
    onlyOwner: true
}, async (conn, mek, m, { reply }) => {
    const jid = mek.key.remoteJid;
    if (!jid.endsWith('@g.us')) return reply('❌ Group ekaka witharak.');

    // Fix: Bot admin da kiyala direct check
    const metadata = await conn.groupMetadata(jid);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const botNumber = conn.user.id.replace(/:\d+/, '') + '@s.whatsapp.net'; // :26 remove kara
    
    if (!admins.includes(botNumber)) return reply('❌ Bot Admin nemei. Bot ekatata Admin denna.');

    const requests = await conn.groupRequestParticipantsList(jid).catch(() => null);
    if (!requests || requests.length === 0) return reply('✅ Pending requests na.');

    await reply(`⏳ Total: ${requests.length}\n2s delay ekka approve karanawa... ~${Math.ceil(requests.length*2/60)} min`);

    let ok = 0;
    for (const u of requests) {
        try {
            await conn.groupRequestParticipantsUpdate(jid, [u.jid], 'approve');
            ok++;
        } catch (e) {}
        await sleep(2000);
    }
    return reply(`✅ Done\nTotal: ${requests.length}\nAccepted: ${ok}`);
});
