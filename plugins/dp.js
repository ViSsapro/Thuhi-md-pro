const { cmd } = require('../command');

cmd({
    pattern: "dp",
    alias: ["pp", "profile"],
    react: "🖼️",
    desc: "Get WhatsApp Profile Picture",
    category: "owner",
    use: '.dp [tag/reply/number]',
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        let targetJid;

        // JID එක තීරණය කිරීම (Tag, Reply, හෝ Number)
        if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0];
        } else if (m.quoted) {
            targetJid = m.quoted.sender;
        } else if (q) {
            let num = q.replace(/[^0-9]/g, '');
            targetJid = num + '@s.whatsapp.net';
        } else {
            targetJid = from;
        }

        // DP එක ලබා ගැනීමට උත්සාහ කිරීම
        try {
            let ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            
            let caption = `*👤 Profile Picture*\n\n*JID:* ${targetJid.split('@')[0]}\n\n> ᴛʜᴜʜɪ ᴍᴅ ᴠ1`;
            
            await conn.sendMessage(from, {
                image: { url: ppUrl },
                caption: caption
            }, { quoted: mek });

        } catch (e) {
            // DP එක පෞද්ගලික නම් හෝ නැත්නම් මෙතැනට එයි
            return reply("❌ *ප්‍රොෆයිල් පින්තූරය ලබාගත නොහැක.* \n\nමෙයට හේතු විය හැක:\n1. එම පුද්ගලයා DP එක 'Private' කර තිබීම.\n2. ඔබ එම අංකය Save කර නොතිබීම.\n3. ඔවුන් සතුව DP එකක් නොතිබීම.");
        }

    } catch (err) {
        console.log(err);
        return reply("❌ *දෝෂයක් සිදුවිය.*");
    }
});
