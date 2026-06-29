module.exports = {
    name: "dp",
    alias: ["pp", "profile"],
    desc: "Save WhatsApp Profile Picture with Number",
    category: "owner",
    use: ".dp [tag/reply/947xxxxxxx]",

    async execute(sock, m, args) {
        let targetJid = null;

        // 1. Tag කර ඇති පරිශීලකයා හඳුනා ගැනීම
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = m.mentionedJid[0];
        } 
        // 2. Reply කර ඇති පරිශීලකයා හඳුනා ගැනීම
        else if (m.quoted) {
            targetJid = m.quoted.sender;
        } 
        // 3. අංකයක් ලබා දී ඇත්නම් එය හඳුනා ගැනීම
        else if (args[0] && /^\d+$/.test(args[0])) {
            let num = args[0].replace(/[^0-9]/g, '');
            // ශ්‍රී ලංකා අංකයක් නම් 94 එකතු කිරීම
            if (!num.startsWith('94') && num.length < 10) num = '94' + num;
            targetJid = num + '@s.whatsapp.net';
        } 
        // 4. කිසිවක් නැත්නම් තමන්ගේම DP එක ලබා ගැනීම
        else {
            targetJid = m.sender;
        }

        try {
            // පළමුව High Quality 'image' එක උත්සාහ කරයි, එය නොමැති නම් 'preview' එක ගනී
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = await sock.profilePictureUrl(targetJid, 'preview');
            }

            let number = targetJid.split('@')[0];

            // ප්‍රතිදානය (Caption)
            let caption = `*Type:* Image\n*Dp number info:* +${number}\n\n𝗧𝗛𝗨𝗛𝗜 𝗠𝗗 𝗩𝟬𝟭\n©> ᴩᴏᴡᴇʀᴅ ʙʏ ᴛʜᴜʜɪɴᴀ ᴠɪᴍᴜᴋᴛʜɪ ᴡɪᴊᴇʀᴀᴛʜɴᴀ`;

            // පින්තූරය යැවීම
            await sock.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: caption
            }, { quoted: m });

        } catch (err) {
            // දෝෂයක් වුවහොත් ලැබෙන පණිවිඩය
            return m.reply(`❌ DP එක ලබා ගැනීමට නොහැක.\nහේතුව: ඒ කෙනා Privacy Lock කර ඇත හෝ අංකය වැරදියි.`);
        }
    }
};
