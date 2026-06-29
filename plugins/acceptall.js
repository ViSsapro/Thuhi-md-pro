const { cmd } = require('../command');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

cmd({
    pattern: "acceptall",
    alias: ["approveall", "acceptreq"],
    react: "⏳",
    desc: "Accept all pending group join requests",
    category: "owner", // Owner list එකට
    filename: __filename,
    onlyOwner: true // Owner Only
},
async (conn, mek, m, { from, isGroup, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply(`❌ *Group එකකින් විතරක් Use කරන්න.*`);
        if (!isBotAdmins) return reply(`❌ *Bot එකට Admin දෙන්න.*`);

        await reply(`⏳ *Pending Requests Check කරනවා...*`);

        const requests = await conn.groupRequestParticipantsList(from);
        if (!requests
