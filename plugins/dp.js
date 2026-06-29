const { cmd } = require('../command');

cmd({
    pattern: "dp",
    alias: ["pp", "profile"],
    react: "🖼️",
    desc: "Save WhatsApp Profile Picture with Number",
    category: "owner", // <-- මේක නිසයි Owner Menu එකට එන්නේ
    use: '.dp [tag/reply/947xxxxxxx]',
    filename: __filename
},
async (conn, mek, m, { from, args, q, isOwner, reply, sender }) => {
    try {
        let targetJid = null;

        // 1. Tag කරලා නම්:.dp @user
        if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0];
        }
        // 2. Reply කරලා නම්:.dp
        else if (m.quoted) {
            targetJid = m.quoted.sender;
        }
        // 3. Number දාලා නම්:.dp 94701153310
        else if (q && /[0-9]/.test(q)) {
            let num = q.replace(/[^0-9]/g, '');
            if (!num.startsWith('94')) num = '94' + num;
            targetJid = num + '@s.whatsapp.net';
        }
        // 4. මොකුත් නැත්තම්: Own DP
        else {
            targetJid = sender;
        }

        let ppUrl = await conn.profilePictureUrl(targetJid, 'image');
        let number = targetJid.split('@')[0];

        // ඔය ඉල්ලපු Format එක
        let caption = `*Type:* Image\n*Dp number info:* +${number}\n\n𝗧𝗛𝗨𝗛𝗜 𝗠𝗗 𝗩𝟬𝟭\n©> ᴩᴏᴡᴇʀᴅ ʙʏ ᴛʜᴜʜɪɴᴀ ᴠɪᴍᴜᴋᴛʜɪ ᴡɪᴊᴇʀᴀᴛʜɴᴀ`;

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        return reply(`❌ DP එක ගන්න බැරි වුණා.\nහේතුව: ඒ කෙනා Privacy Lock කරලා.`);
    }
});
