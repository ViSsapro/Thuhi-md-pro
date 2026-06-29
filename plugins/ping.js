const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "ping",
    desc: "Check bot's response time.",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now();
        
        // පින්තූරය සමඟ යැවීමට අවශ්‍ය පණිවිඩය
        const pingText = `╭━━━〔 ᴛʜᴜʜɪ ᴍᴅ ᴠ01 〕━━━┈⊷
┃ 🏓 𝐏 𝐎 𝐍 𝐆 !
╰━━━━━━━━━━━━━━━┈⊷

⭔ 𝙎𝙥𝙚𝙚𝙙 : Pinging...
⭔ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙁𝙖𝙨𝙩 & 𝘼𝙘𝙩𝙞𝙫𝙚 🟢

*© ᴛʜᴜʜɪ ᴍᴅ ᴠ01*`;

        // පින්තූරය සමඟ පණිවිඩය යැවීම
        const message = await conn.sendMessage(from, { 
            image: { url: 'https://i.ibb.co/Z6gnPvV2/file-000009be47207afef1535933c3f19.png' }, 
            caption: pingText 
        }, { quoted: mek });
        
        const endTime = Date.now();
        const ping = endTime - startTime;
        
        // පින්තූරය සමඟම අගය යාවත්කාලීන කිරීම (Edit message)
        const updatedPingText = `╭━━━〔 ᴛʜᴜʜɪ ᴍᴅ ᴠ01 〕━━━┈⊷
┃ 🏓 𝐏 𝐎 𝐍 𝐆 !
╰━━━━━━━━━━━━━━━┈⊷

⭔ 𝙎𝙥𝙚𝙚𝙙 : ${ping}ms
⭔ 𝙎𝙩𝙖𝙩𝙪𝙨 : 𝙁𝙖𝙨𝙩 & 𝘼𝙘𝙩𝙞𝙫ᴇ 🟢

*© ᴛʜᴜʜɪ ᴍᴅ ᴠ01*`;

        await conn.sendMessage(from, { text: updatedPingText, edit: message.key });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
})
