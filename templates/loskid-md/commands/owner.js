const settings = require('../settings');
module.exports = async (sock, chatId, message) => {
    const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
    const text = `
╔══〔 *OWNER INFO* 〕══╗
║
║  👑 *Name*   : ${settings.botOwner}
║  📱 *Number* : +${settings.ownerNumber}
║  🤖 *Bot*    : ${settings.botName}
║
╚══〔 *${settings.author}* 〕══╝
`.trim();
    await sock.sendMessage(chatId, { text, mentions: [ownerJid] }, { quoted: message });
};
