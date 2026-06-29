const { cmd } = require('../command');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const meta = await conn.groupMetadata(jid);
    if (!meta.participants.find(p => p.id === botJid)?.admin) return reply('❌ Bot Admin nemei.');

    const list = await conn.groupRequestParticipantsList(jid).catch(() => []);
    if (!list.length) return reply('✅ Pending requests na.');

    await reply(`⏳ Total: ${list.length}\n2s delay ekka approve karanawa...`);

    let ok = 0;
    for (const u of list) {
        await conn.groupRequestParticipantsUpdate(jid, [u.jid], 'approve').then(() => ok++).catch(() => {});
        await sleep(2000);
    }
    return reply(`✅ Done\nTotal: ${list.length}\nAccepted: ${ok}`);
});
