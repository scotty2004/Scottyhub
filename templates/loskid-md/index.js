/**
 * ♠ LØ$KÎD ♠ — WhatsApp Bot
 * Pairing system ported from TUNZY-MD
 */

require('dotenv').config();

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const express  = require('express');
const pino     = require('pino');
const chalk    = require('chalk');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
} = require('@whiskeysockets/baileys');

const settings           = require('./settings');
const { handleMessages } = require('./main');

const PORT = process.env.PORT || 3000;

// ── Ensure folders ────────────────────────────────────────────────────────────
['session', 'public'].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── Readline — always ask on console (works on Pterodactyl too) ───────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const question = (text) => {
    return new Promise((resolve) => rl.question(text, resolve));
};

const pairingCode = true; // always use pairing code, never QR

// ── Start bot ─────────────────────────────────────────────────────────────────
async function startBot() {
    try {
        const { version }          = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });

        sock._ownerPhone = settings.ownerNumber;

        sock.ev.on('creds.update', saveCreds);

        // ── Pairing code — TUNZY style ────────────────────────────────────────
        if (pairingCode && !sock.authState.creds.registered) {

            let phoneNumber = await question(
                chalk.greenBright(
                    `\nEnter your WhatsApp number\nFormat: 2637XXXXXXXX (country code, no + or spaces)\n> `
                )
            );

            // Clean number
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

            rl.close();

            if (!phoneNumber || phoneNumber.length < 7) {
                console.log(chalk.red('[ERR] Invalid number. Restart and try again.'));
                process.exit(1);
            }

            // setTimeout — exactly like TUNZY
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;

                    console.log(chalk.green(`\nPairing Code: `) + chalk.white(code));
                    console.log(chalk.cyan('Steps:'));
                    console.log(chalk.white('  1. Open WhatsApp'));
                    console.log(chalk.white('  2. Settings > Linked Devices'));
                    console.log(chalk.white('  3. Link a Device'));
                    console.log(chalk.white('  4. "Link with phone number instead"'));
                    console.log(chalk.white('  5. Enter the code above ^\n'));

                } catch (err) {
                    console.error(chalk.red('[ERR] requestPairingCode:', err.message));
                    console.log(chalk.red('Failed to get pairing code. Check the number and try again.'));
                }
            }, 3000);
        }

        // ── Connection update ─────────────────────────────────────────────────
        sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'connecting') {
                console.log(chalk.yellow('[🔄] Connecting to WhatsApp...'));
            }

            if (connection === 'open') {
                console.log(chalk.green('\n[✅] Bot connected successfully!'));
                console.log(chalk.cyan(`\n╔══〔 ${settings.botName} 〕══╗`));
                console.log(chalk.cyan(`║  🌐 Panel : http://localhost:${PORT}`));
                console.log(chalk.cyan(`║  ⚡ Port  : ${PORT}`));
                console.log(chalk.cyan(`║  📋 Cmds  : menu, ping, scotty, hack + 32 new commands`));
                console.log(chalk.cyan(`╚════════════════════════╝\n`));
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const loggedOut  = statusCode === DisconnectReason.loggedOut || statusCode === 401;

                if (loggedOut) {
                    console.log(chalk.red('[❌] Logged out. Deleting session...'));
                    try { fs.rmSync('./session', { recursive: true, force: true }); } catch {}
                    console.log(chalk.yellow('[🔄] Restarting for re-pairing...'));
                    await delay(2000);
                    startBot();
                } else {
                    console.log(chalk.yellow(`[🔄] Disconnected (${statusCode}) — reconnecting in 5s...`));
                    await delay(5000);
                    startBot();
                }
            }
        });

        // ── Messages ──────────────────────────────────────────────────────────
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (chatUpdate.type !== 'notify') return;
                const mek = chatUpdate.messages[0];
                if (!mek?.message) return;
                await handleMessages(sock, chatUpdate);
            } catch (err) {
                console.error(chalk.red('[ERR] messages.upsert:', err.message));
            }
        });

        return sock;

    } catch (err) {
        console.error(chalk.red('[ERR] startBot:', err.message));
        await delay(5000);
        startBot();
    }
}

// ── Keep-alive Express server ─────────────────────────────────────────────────
const app = express();
app.get('/',     (_, res) => res.send('♠ LØ$KÎD ♠ is running ⚡'));
app.get('/ping', (_, res) => res.json({ status: 'ok', bot: settings.botName }));
app.listen(PORT, () => {
    console.log(chalk.cyan(`[⚡] Server on port ${PORT}`));
});

// ── Global crash guards ───────────────────────────────────────────────────────
process.on('uncaughtException',  err    => console.error(chalk.red('[UNCAUGHT]',  err.message)));
process.on('unhandledRejection', reason => console.error(chalk.red('[UNHANDLED]', reason)));

// ── Boot ──────────────────────────────────────────────────────────────────────
startBot().catch(err => {
    console.error(chalk.red('[FATAL]', err.message));
    process.exit(1);
});
