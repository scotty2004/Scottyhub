# ⚡ ♠ LØ$KÎD ♠ — WhatsApp Bot

A clean, minimal WhatsApp bot with 4 commands, ready for Pterodactyl.

## Commands
| Command | Description |
|---------|-------------|
| `.menu` | Show all commands |
| `.ping` | Check bot speed/latency |
| `.scotty` | Bot info & uptime |
| `.hack <target>` | Fun fake hack terminal |

## Setup on Pterodactyl

1. Create a new **Node.js** egg/server on your panel
2. Upload all files (or connect via Git)
3. Set **Startup Command**: `node index.js`
4. Set **Node version**: `18+`
5. Add environment variables:
   - `OWNER_NUMBER` = your WhatsApp number (e.g. `263788114185`)
   - `PORT` = assigned port from panel
   - `APP_URL` = your panel-assigned URL/IP

6. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
7. Start the server
8. Open the web panel URL in your browser
9. Enter your WhatsApp number and scan the QR code

## Folder Structure
```
Scotty_Crash/
├── index.js          ← Main bot + web server
├── settings.js       ← Bot config
├── package.json
├── .env              ← Environment variables
├── commands/
│   ├── menu.js
│   ├── ping.js
│   ├── scotty.js
│   └── hack.js
├── sessions/         ← Auto-created, stores auth
└── public/           ← Web pairing UI (auto-generated)
```

## Notes
- Sessions are saved in `./sessions/<phone>/`
- The web UI is auto-generated at startup — no manual HTML needed
- Bot auto-reconnects on disconnect
