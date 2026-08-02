/**
 * ♠ LØ$KÎD ♠ — Message Handler
 */

const chalk    = require('chalk');
const settings = require('./settings');

const menuCmd      = require('./commands/menu');
const pingCmd      = require('./commands/ping');
const scottyCmd    = require('./commands/scotty');
const hackCmd      = require('./commands/hack');
const tiktokCmd    = require('./commands/tiktok');
const pindlCmd     = require('./commands/pindl');
const fbdlCmd      = require('./commands/fbdl');
const lirikCmd     = require('./commands/lirik');
const ytmp3Cmd     = require('./commands/ytmp3');

// ── New Commands ─────────────────────────────────────────────────────────────
const vvCmd        = require('./commands/vv');
const tagallCmd    = require('./commands/tagall');
const ppCmd        = require('./commands/pp');
const bdCmd        = require('./commands/bd');
const stickerCmd   = require('./commands/sticker');
const aliveCmd     = require('./commands/alive');
const kickCmd      = require('./commands/kick');
const promoteCmd   = require('./commands/promote');
const demoteCmd    = require('./commands/demote');
const muteCmd      = require('./commands/mute');
const ownerCmd     = require('./commands/owner');
const groupinfoCmd = require('./commands/groupinfo');
const jokeCmd      = require('./commands/joke');
const quoteCmd     = require('./commands/quote');
const flipCmd      = require('./commands/flip');
const diceCmd      = require('./commands/dice');
const eightballCmd = require('./commands/eightball');
const timeCmd      = require('./commands/time');
const calcCmd      = require('./commands/calc');
const warnCmd      = require('./commands/warn');
const weatherCmd   = require('./commands/weather');
const translateCmd = require('./commands/translate');
const infoCmd      = require('./commands/info');
const tolinkCmd    = require('./commands/tolink');
const speedCmd     = require('./commands/speed');
const ttsCmd       = require('./commands/tts');
const banCmd       = require('./commands/ban');
const wikiCmd      = require('./commands/wiki');
const shortCmd     = require('./commands/short');
const everyoneCmd  = require('./commands/everyone');
const autotypingCmd    = require('./commands/autotyping');
const autorecordingCmd = require('./commands/autorecording');

const autostate = require('./lib/autostate');

const PREFIX = settings.prefix;

async function handleMessages(sock, { messages }) {
    if (!messages || !Array.isArray(messages)) return;

    for (const message of messages) {
        try {
            if (!message || !message.key || !message.message) continue;

            const chatId = message.key.remoteJid;
            if (!chatId || chatId === 'status@broadcast') continue;

            // ── Auto typing / recording presence (ambient, applies to all chats) ──
            if (!message.key.fromMe) {
                const st = autostate.get();
                if (st.typing)    sock.sendPresenceUpdate('composing', chatId).catch(() => {});
                if (st.recording) sock.sendPresenceUpdate('recording', chatId).catch(() => {});
            }

            if (Object.keys(message.message)[0] === 'ephemeralMessage') {
                message.message = message.message.ephemeralMessage.message;
            }
            if (Object.keys(message.message)[0] === 'viewOnceMessage') {
                message.message = message.message.viewOnceMessage.message;
            }

            const body = (
                message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                message.message?.imageMessage?.caption ||
                message.message?.videoMessage?.caption ||
                message.message?.buttonsResponseMessage?.selectedButtonId ||
                message.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                ''
            ).trim();

            message.body = body;

            if (!body.startsWith(PREFIX)) continue;

            const parts = body.slice(PREFIX.length).trim().split(' ');
            const cmd   = parts[0].toLowerCase();
            const args  = parts.slice(1);
            if (!cmd) continue;

            const xreply    = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
            const trashcore = sock;
            const chat      = chatId;
            const m         = message;

            console.log(chalk.cyan(`[CMD] .${cmd} from ${chatId}`));

            switch (cmd) {
                // ── Original ────────────────────────────────────────────────
                case 'menu':                                   await menuCmd(sock, chatId, message); break;
                case 'ping':                                   await pingCmd(sock, chatId, message); break;
                case 'scotty':                                 await scottyCmd(sock, chatId, message); break;
                case 'hack':                                   await hackCmd(sock, chatId, message); break;
                case 'tiktok': case 'tt':
                    await tiktokCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'pindl': case 'pinterest': case 'pintdl':
                    await pindlCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'fbdl': case 'fb': case 'facebookdl':
                    await fbdlCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'lirik': case 'lyrics':
                    await lirikCmd.run({ trashcore, m, args, xreply, chat }); break;
                case 'ytmp3': case 'play': case 'music':
                    await ytmp3Cmd.run({ trashcore, m, args, xreply, chat }); break;

                // ── New Commands ─────────────────────────────────────────────
                case 'vv':                                     await vvCmd(sock, chatId, message); break;
                case 'tagall': case 'tag':                     await tagallCmd(sock, chatId, message, args); break;
                case 'everyone':                               await everyoneCmd(sock, chatId, message, args); break;
                case 'pp':                                     await ppCmd(sock, chatId, message); break;
                case 'bd': case 'birthday':                    await bdCmd(sock, chatId, message, args); break;
                case 'sticker': case 's':                      await stickerCmd(sock, chatId, message); break;
                case 'alive':                                  await aliveCmd(sock, chatId, message); break;
                case 'kick':                                   await kickCmd(sock, chatId, message); break;
                case 'ban':                                    await banCmd(sock, chatId, message); break;
                case 'promote': case 'admin':                  await promoteCmd(sock, chatId, message); break;
                case 'demote':                                 await demoteCmd(sock, chatId, message); break;
                case 'mute': case 'unmute':                    await muteCmd(sock, chatId, message, args); break;
                case 'owner':                                  await ownerCmd(sock, chatId, message); break;
                case 'groupinfo': case 'ginfo':                await groupinfoCmd(sock, chatId, message); break;
                case 'joke':                                   await jokeCmd(sock, chatId, message); break;
                case 'quote':                                  await quoteCmd(sock, chatId, message); break;
                case 'flip':                                   await flipCmd(sock, chatId, message); break;
                case 'dice':                                   await diceCmd(sock, chatId, message); break;
                case '8ball': case 'ball':                     await eightballCmd(sock, chatId, message, args); break;
                case 'time': case 'date':                      await timeCmd(sock, chatId, message); break;
                case 'calc': case 'math':                      await calcCmd(sock, chatId, message, args); break;
                case 'warn':                                   await warnCmd(sock, chatId, message, args); break;
                case 'weather':                                await weatherCmd(sock, chatId, message, args); break;
                case 'translate': case 'tr':                   await translateCmd(sock, chatId, message, args); break;
                case 'info':                                   await infoCmd(sock, chatId, message); break;
                case 'tolink':                                 await tolinkCmd(sock, chatId, message); break;
                case 'speed':                                  await speedCmd(sock, chatId, message); break;
                case 'tts':                                    await ttsCmd(sock, chatId, message, args); break;
                case 'wiki':                                   await wikiCmd(sock, chatId, message, args); break;
                case 'short': case 'shorten':                  await shortCmd(sock, chatId, message, args); break;
                case 'autotyping':                              await autotypingCmd(sock, chatId, message, args); break;
                case 'autorecording': case 'autorecord':        await autorecordingCmd(sock, chatId, message, args); break;

                default: break;
            }

        } catch (err) {
            console.error(chalk.red(`[ERR] handleMessages: ${err.message}`));
        }
    }
}

module.exports = { handleMessages };
