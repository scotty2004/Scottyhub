const settings = require('../settings');

module.exports = async (sock, chatId, message) => {
    const p = settings.prefix || '.';
    const ver = settings.version || '4.0.0';

    let mode = 'Public';
    try {
        const fs = require('fs');
        const m = JSON.parse(fs.readFileSync('./data/mode.json', 'utf8'));
        mode = m.mode ? m.mode.charAt(0).toUpperCase() + m.mode.slice(1) : 'Public';
    } catch {}

    let senderName = 'User';
    try {
        const jid = message?.key?.participant || message?.key?.remoteJid || '';
        senderName = jid.split('@')[0].split(':')[0] || 'User';
    } catch {}

    const defaultBanner =
`╭═══〘 *SCOTTY♤C* 〙═══⊷

┃✦╭─────────
┃✦│🫧 ᴘʀᴇғɪx  : ${p}
┃✦│🫧 ᴜsᴇʀ    : ${senderName}
┃✦│🫧 ᴍᴏᴅᴇ    : ${mode}
┃✦│🫧 ᴠᴇʀsɪᴏɴ : v${ver}
┃✦╰─────────
╰══════════════⊷`;

    const banner = settings.bannerText
        ? settings.bannerText
            .replace(/{prefix}/g, p)
            .replace(/{user}/g, senderName)
            .replace(/{mode}/g, mode)
            .replace(/{version}/g, ver)
        : defaultBanner;

    const menu =
`${banner}

╭════〘 🫧 ɢᴇɴᴇʀᴀʟ 〙════⊷
┃✦│ ${p}ping
┃✦│ ${p}alive
┃✦│ ${p}uptime
┃✦│ ${p}owner
┃✦│ ${p}menu
┃✦│ ${p}pair
┃✦│ ${p}botstatus
┃✦│ ${p}deviceinfo
┃✦│ ${p}repo
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ᴍᴇᴅɪᴀ 〙════⊷
┃✦│ ${p}sticker
┃✦│ ${p}toimg
┃✦│ ${p}steal
┃✦│ ${p}vv
┃✦│ ${p}savestatus
┃✦│ ${p}getdp
┃✦│ ${p}profile
┃✦│ ${p}toviewonce
┃✦│ ${p}remini
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ᴛᴏᴏʟs 〙════⊷
┃✦│ ${p}weather
┃✦│ ${p}wiki
┃✦│ ${p}news
┃✦│ ${p}tr
┃✦│ ${p}calc
┃✦│ ${p}define
┃✦│ ${p}qr
┃✦│ ${p}currency
┃✦│ ${p}remind
┃✦│ ${p}encode
┃✦│ ${p}decode
┃✦│ ${p}ocr
┃✦│ ${p}removebg
┃✦│ ${p}password
┃✦│ ${p}github
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 sᴇᴀʀᴄʜ 〙════⊷
┃✦│ ${p}google
┃✦│ ${p}pinterest
┃✦│ ${p}spotify
┃✦│ ${p}yts
┃✦│ ${p}gif
┃✦│ ${p}pixabay
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ᴅᴏᴡɴʟᴏᴀᴅ 〙════⊷
┃✦│ ${p}ytmp3
┃✦│ ${p}ytmp4
┃✦│ ${p}tiktok
┃✦│ ${p}instagram
┃✦│ ${p}twitter
┃✦│ ${p}facebook
┃✦│ ${p}song
┃✦│ ${p}video
┃✦│ ${p}mediafire
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ғᴜɴ 〙════⊷
┃✦│ ${p}joke
┃✦│ ${p}fact
┃✦│ ${p}quote
┃✦│ ${p}roast
┃✦│ ${p}ship
┃✦│ ${p}8ball
┃✦│ ${p}slot
┃✦│ ${p}flip
┃✦│ ${p}dice
┃✦│ ${p}truth
┃✦│ ${p}dare
┃✦│ ${p}memes
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ɢʀᴏᴜᴘ 〙════⊷
┃✦│ ${p}kick
┃✦│ ${p}promote
┃✦│ ${p}demote
┃✦│ ${p}mute
┃✦│ ${p}unmute
┃✦│ ${p}warn
┃✦│ ${p}tagall
┃✦│ ${p}hidetag
┃✦│ ${p}antilink
┃✦│ ${p}welcome
┃✦│ ${p}lock
┃✦│ ${p}unlock
┃✦│ ${p}groupinfo
┃✦│ ${p}invite
┃✦│ ${p}add
┃✦│ ${p}setname
┃✦│ ${p}setdesc
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ᴏᴡɴᴇʀ 〙════⊷
┃✦│ ${p}mode
┃✦│ ${p}ban
┃✦│ ${p}unban
┃✦│ ${p}bc
┃✦│ ${p}block
┃✦│ ${p}unblock
┃✦│ ${p}alwaysonline
┃✦│ ${p}antidelete
┃✦│ ${p}anticall
┃✦│ ${p}autoread
┃✦│ ${p}afk
┃✦│ ${p}autoreply
┃✦│ ${p}setprefix
┃✦│ ${p}react
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ᴀɪ 〙════⊷
┃✦│ ${p}ai
┃✦│ ${p}ask
┃✦│ ${p}deepseek
┃✦│ ${p}teach
┃✦╰──────────❍
╰═══════════════⊷

╭════〘 🫧 ʀᴇʟɪɢɪᴏɴ 〙════⊷
┃✦│ ${p}bible
┃✦│ ${p}quran
┃✦│ ${p}alquran
┃✦╰──────────❍
╰═══════════════⊷

╭══════════════⊷
┃✦ ⚡ _Fast • Clean • Always On_
┃✦ 💙 *Powered by Scotty♤C*
╰══════════════⊷`;

    await sock.sendMessage(chatId, { text: menu }, { quoted: message });
};
