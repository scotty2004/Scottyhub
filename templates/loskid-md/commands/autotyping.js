const settings   = require('../settings');
const autostate  = require('../lib/autostate');

function isOwner(message) {
    if (message.key.fromMe) return true;
    const senderJid = message.key.participant || message.key.remoteJid;
    return senderJid?.split('@')[0] === settings.ownerNumber;
}

module.exports = async (sock, chatId, message, args) => {
    if (!isOwner(message)) {
        return sock.sendMessage(chatId, { text: '❌ Owner only command.' }, { quoted: message });
    }

    const choice = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(choice)) {
        return sock.sendMessage(chatId, { text: `⚙️ Usage: .autotyping on | off\n\nCurrent: ${autostate.get().typing ? 'ON ✅' : 'OFF ❌'}` }, { quoted: message });
    }

    autostate.setTyping(choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-typing is now *${choice.toUpperCase()}*` }, { quoted: message });
};
