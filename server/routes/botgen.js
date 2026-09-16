const express = require('express');
const router = express.Router();
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { protect } = require('../middleware/auth');
const { getEffectivePlan } = require('../utils/plans');
const { db } = require('../db');

// Reuses the same OpenRouter key/model already configured for the AI Center (routes/ai.js)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ---------- S3 (same pattern as routes/upload.js) ----------
let s3 = null;
function getClient() {
  if (s3) return s3;
  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_BUCKET) return null;
  s3 = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: !!process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });
  return s3;
}

// ---------- helpers ----------

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(srcPath, destPath);
    else await fsp.copyFile(srcPath, destPath);
  }
}

function loadTemplateMeta(templateId) {
  const metaPath = path.join(TEMPLATES_DIR, templateId, 'template.meta.json');
  if (!fs.existsSync(metaPath)) return null;
  return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
}

function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => loadTemplateMeta(d.name))
    .filter(Boolean);
}

// Replaces `key: process.env.X || 'old'` or `key: 'old'`, preserving any env fallback
function applyFieldToSettings(source, settingsKey, newValue) {
  const escaped = settingsKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped}\\s*:\\s*)(process\\.env\\.[A-Z0-9_]+\\s*\\|\\|\\s*)?'[^']*'`);
  if (!re.test(source)) return source;
  const safeValue = String(newValue).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return source.replace(re, (_m, prefix, envPart) => `${prefix}${envPart || ''}'${safeValue}'`);
}

function insertBannerText(source, bannerText) {
  const literal = JSON.stringify(bannerText);
  if (/bannerText\s*:/.test(source)) {
    return source.replace(/bannerText\s*:\s*[^,]*,/, `bannerText: ${literal},`);
  }
  if (/packname\s*:.*,/.test(source)) {
    return source.replace(/(packname\s*:.*,\n)/, `$1    bannerText: ${literal},\n`);
  }
  return source.replace(/module\.exports\s*=\s*{\n/, `module.exports = {\n    bannerText: ${literal},\n`);
}

async function generateBanner({ theme, botName, placeholders }) {
  if (!theme || !OPENROUTER_API_KEY) return null;
  const placeholderList = (placeholders && placeholders.length ? placeholders : ['prefix']).map(p => `{${p}}`).join(', ');

  const systemPrompt = `You design ASCII/box-drawing menu banners for WhatsApp bots. ` +
    `Output ONLY the banner block as raw text (no markdown fences, no explanation). ` +
    `Keep it to 6-10 lines using box-drawing characters (╭ ╮ ╯ ╰ │ ─ ═ etc). ` +
    `The bot's name is "${botName}" and MUST appear in the top line. ` +
    `This template ONLY supports these exact placeholders — use ONLY ones from this list, on their own lines: ${placeholderList} ` +
    `(they will be substituted later — do not replace them yourself, and do not invent placeholders not in this list). ` +
    `Match the visual style/vibe the user describes.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://scottyhub.onrender.com',
      'X-Title': 'ScottyHub Bot Rebrander'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Style/vibe: ${theme}` }
      ]
    })
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

// Reuses the same daily-credit pattern as the AI Center so bot generation
// draws from the user's existing plan-based AI credit pool.
async function checkAndConsumeCredit(user) {
  const plan = await getEffectivePlan(user);
  const dailyLimit = plan.aiDailyLimit;
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = user.ai_daily_date ? user.ai_daily_date.slice(0, 10) : null;
  let used = lastDate === today ? (user.ai_daily_used || 0) : 0;
  if (used >= dailyLimit) return { allowed: false, remaining: 0, limit: dailyLimit };
  used += 1;
  await db.execute({
    sql: `UPDATE users SET ai_daily_used = ?, ai_daily_date = NOW()::text WHERE id = ?`,
    args: [used, user.id]
  });
  return { allowed: true, remaining: dailyLimit - used, limit: dailyLimit };
}

// ---------- routes ----------

// Public — just the template list/fields, no credit cost
router.get('/templates', (req, res) => {
  res.json(listTemplates());
});

router.post('/generate', protect, async (req, res) => {
  const { templateId, fields = {}, menuTheme } = req.body;
  const meta = loadTemplateMeta(templateId);
  if (!meta) return res.status(404).json({ message: 'Unknown template' });

  for (const f of meta.fields) {
    if (f.required && !fields[f.key] && !f.default) {
      return res.status(400).json({ message: `Missing required field: ${f.key}` });
    }
  }

  // Only consume a credit (and call the AI) if the user actually asked for a custom banner
  let creditInfo = null;
  if (menuTheme) {
    creditInfo = await checkAndConsumeCredit(req.user);
    if (!creditInfo.allowed) {
      return res.status(429).json({ message: `Daily AI credit limit reached (${creditInfo.limit}/day). Try again tomorrow, or generate without a custom banner theme.` });
    }
  }

  const jobId = uuidv4();
  const workDir = path.join('/tmp', 'botgen', jobId);
  const srcDir = path.join(TEMPLATES_DIR, templateId);

  try {
    await copyDir(srcDir, workDir);

    const settingsPath = path.join(workDir, meta.settingsFile);
    let settingsSrc = await fsp.readFile(settingsPath, 'utf8');

    for (const f of meta.fields) {
      const value = fields[f.key] ?? f.default;
      if (value !== undefined) settingsSrc = applyFieldToSettings(settingsSrc, f.settingsKey, value);
    }

    let bannerText = null;
    if (menuTheme) {
      try {
        bannerText = await generateBanner({ theme: menuTheme, botName: fields.botName, placeholders: meta.bannerPlaceholders });
      } catch (err) {
        console.error('Bot rebrander: banner generation failed, using default:', err.message);
      }
    }
    if (bannerText) settingsSrc = insertBannerText(settingsSrc, bannerText);

    await fsp.writeFile(settingsPath, settingsSrc, 'utf8');

    const pkgPath = path.join(workDir, meta.packageFile);
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf8'));
      if (fields.botName) {
        pkg.name = fields.botName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || pkg.name;
        pkg.description = `${fields.botName} — Multi-User WhatsApp Bot`;
      }
      await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    }

    const zip = new AdmZip();
    zip.addLocalFolder(workDir);
    const zipBuffer = zip.toBuffer();

    const client = getClient();
    let downloadUrl;
    if (client) {
      const key = `botgen/${req.user.id}/${jobId}.zip`;
      await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: zipBuffer,
        ContentType: 'application/zip'
      }));
      downloadUrl = `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
    } else {
      // Fallback for local/dev without S3 configured — not persistent across restarts
      const localDir = path.join(__dirname, '..', 'public', 'generated-bots');
      await fsp.mkdir(localDir, { recursive: true });
      await fsp.writeFile(path.join(localDir, `${jobId}.zip`), zipBuffer);
      downloadUrl = `/generated-bots/${jobId}.zip`;
    }

    res.json({ downloadUrl, bannerUsed: !!bannerText, creditsRemaining: creditInfo?.remaining });
  } catch (err) {
    console.error('Bot rebrander generation failed:', err);
    res.status(500).json({ message: 'Generation failed' });
  } finally {
    fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
});

module.exports = router;
