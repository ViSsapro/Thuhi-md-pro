const { cmd } = require('../command'); // ඔබේ බොට් එකේ path එක අනුව මෙය වෙනස් විය හැක

cmd({
    pattern: "acceptall",
    desc: "Approve all pending group requests",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, reply }) => {
    if (!isGroup) return reply("මෙය පාවිච්චි කළ හැක්කේ සමූහයක පමණි.");
    if (!isAdmins) return reply("මේ සඳහා ඔබ සමූහයේ Admin කෙනෙක් විය යුතුය.");

    try {
        // පෙන්ඩින් ඉල්ලීම් ලබා ගැනීම
        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) return reply("දැනට අනුමත කිරීමට ඉල්ලීම් නොමැත.");

        await reply(`ඉල්ලීම් ${requests.length}ක් අනුමත කිරීම ආරම්භ කරනවා...`);

        for (let i of requests) {
            // සෑම ඉල්ලීමක්ම අනුමත කිරීම
            await conn.groupRequestParticipantsUpdate(from, [i.id], "approve");
        }

        await reply("සියලුම ඉල්ලීම් සාර්ථකව අනුමත කරන ලදී! ✅");
    } catch (e) {
        console.error(e);
        reply("දෝෂයක් සිදුවිය: " + e.message);
    }
});
