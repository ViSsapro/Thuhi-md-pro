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

    const metadata = await conn.groupMetadata(jid);

    // FIX: :26, :27 wage device ID tika aragena asse
    const botNum = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isAdmin = metadata.participants.some(p => p.admin && p.id.split(':')[0] === botNum.split(':')[0]);

    if (!isAdmin) return reply('❌ Bot Admin nemei. Bot ekatata Admin denna.');

    const requests = await conn.groupRequestParticipantsList(jid).catch(() => []);
    if (!requests.length) return reply('✅ Pending requests na.');

    await reply(`⏳ Total: ${requests.length}\n2s delay ekka approve karanawa...`);

    let ok = 0;
    for (const u of requests) {
        await conn.groupRequestParticipantsUpdate(jid, [u.jid], 'approve').then(() => ok++).catch(() => {});
        await sleep(2000);
    }
    return reply(`✅ Done\nAccepted: ${ok}/${requests.length}`);
});
