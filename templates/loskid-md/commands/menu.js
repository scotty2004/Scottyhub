const settings = require('../settings');

const MENU_IMAGE = 'https://i.ibb.co/HfzdkHGX/file-00000000ca2872309b448fee6e0c5a7f.png';

module.exports = async (sock, chatId, message) => {
    const senderJid = message.key.participant || message.key.remoteJid;

    const menu = `╭═══〘 *${settings.botName}* 〙═══⊷

┃✦╭─────────────
┃✦│🫧 ᴘʀᴇғɪx : ${settings.prefix}
┃✦│🫧 ᴄᴍᴅs   : 41
┃✦│🫧 ᴅᴇᴠ    : loskid
┃✦╰─────────────
╰══════════════⊷

╭════〘 🫧 ɢᴇɴᴇʀᴀʟ 〙════⊷
┃✦│ .ping
┃✦│ .scotty
┃✦│ .alive
┃✦│ .hack
┃✦│ .owner
┃✦│ .menu
┃✦╰──────────────❍
╰═══════════════⊷

╭════〘 🫧 ᴅᴏᴡɴʟᴏᴀᴅ 〙════⊷
┃✦│ .tiktok
┃✦│ .tt
┃✦│ .pindl
┃✦│ .pinterest
┃✦│ .fbdl
┃✦│ .fb
┃✦│ .ytmp3
┃✦│ .play
┃✦│ .lirik
┃✦│ .lyrics
┃✦╰──────────────❍
╰═══════════════⊷

╭════〘 🫧 ɢʀᴏᴜᴘ 〙════⊷
┃✦│ .tagall
┃✦│ .everyone
┃✦│ .kick
┃✦│ .ban
┃✦│ .promote
┃✦│ .demote
┃✦│ .mute
┃✦│ .unmute
┃✦│ .warn
┃✦│ .groupinfo
┃✦╰──────────────❍
╰═══════════════⊷

╭════〘 🫧 ᴛᴏᴏʟs 〙════⊷
┃✦│ .vv
┃✦│ .pp
┃✦│ .bd
┃✦│ .sticker
┃✦│ .tts
┃✦│ .translate
┃✦│ .weather
┃✦│ .wiki
┃✦│ .short
┃✦│ .tolink
┃✦│ .info
┃✦│ .time
┃✦│ .calc
┃✦│ .speed
┃✦│ .autotyping
┃✦│ .autorecording
┃✦╰──────────────❍
╰═══════════════⊷

╭════〘 🫧 ғᴜɴ 〙════⊷
┃✦│ .joke
┃✦│ .quote
┃✦│ .flip
┃✦│ .dice
┃✦│ .8ball
┃✦╰──────────────❍
╰═══════════════⊷`;

    await sock.sendMessage(chatId, {
        image: { url: MENU_IMAGE },
        caption: menu,
        mentions: [senderJid]
    }, { quoted: message });
};
