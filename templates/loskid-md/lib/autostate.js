/**
 * Simple persisted state for global bot toggles (autotyping / autorecording)
 */
const fs   = require('fs');
const path = require('path');

const DIR  = path.join(__dirname, '..', 'data');
const FILE = path.join(DIR, 'autostate.json');

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const defaults = { typing: false, recording: false };

function load() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, JSON.stringify(defaults, null, 2));
            return { ...defaults };
        }
        const raw = fs.readFileSync(FILE, 'utf-8');
        return { ...defaults, ...JSON.parse(raw) };
    } catch {
        return { ...defaults };
    }
}

let state = load();

function save() {
    try { fs.writeFileSync(FILE, JSON.stringify(state, null, 2)); } catch {}
}

module.exports = {
    get()          { return state; },
    setTyping(v)   { state.typing = v;    save(); },
    setRecording(v){ state.recording = v; save(); },
};
