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
        return sock.sendMessage(chatId, { text: `⚙️ Usage: .autorecording on | off\n\nCurrent: ${autostate.get().recording ? 'ON ✅' : 'OFF ❌'}` }, { quoted: message });
    }

    autostate.setRecording(choice === 'on');
    await sock.sendMessage(chatId, { text: `✅ Auto-recording is now *${choice.toUpperCase()}*` }, { quoted: message });
};
