const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { protect } = require('../middleware/auth');
const { progressMission } = require('../utils/missions');

// Spin wheel prize table (weighted). Weight = relative chance, higher = more likely.
const SPIN_PRIZES = [
  { type: 'points', value: 10,  weight: 30, label: '10 Points' },
  { type: 'points', value: 25,  weight: 25, label: '25 Points' },
  { type: 'points', value: 50,  weight: 15, label: '50 Points' },
  { type: 'points', value: 100, weight: 8,  label: '100 Points' },
  { type: 'cops',   value: 5,   weight: 12, label: '5 COPS' },
  { type: 'cops',   value: 20,  weight: 5,  label: '20 COPS' },
  { type: 'xp',     value: 20,  weight: 4,  label: '20 XP Boost' },
  { type: 'nothing',value: 0,   weight: 1,  label: 'Try Again' },
];

function pickPrize() {
  const total = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of SPIN_PRIZES) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return SPIN_PRIZES[0];
}

// GET /api/earn/overview — everything the Earn Center home tab needs
router.get('/overview', protect, async (req, res) => {
  try {
    const uid = req.user.id;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastSpin = await db.execute({
      sql: "SELECT created_at FROM spin_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [uid]
    });
    const canSpin = !lastSpin.rows[0] || lastSpin.rows[0].created_at.slice(0, 10) !== todayKey;

    const tasks = await db.execute({
      sql: `SELECT t.id, t.title, t.description, t.platform, t.link, t.points_reward, t.xp_reward,
                   CASE WHEN ut.user_id IS NULL THEN 0 ELSE 1 END as completed
            FROM tasks t LEFT JOIN user_tasks ut ON ut.task_id = t.id AND ut.user_id = ?
            WHERE t.active = 1 ORDER BY t.created_at ASC`,
      args: [uid]
    });

    const referralCount = await db.execute({
      sql: 'SELECT COUNT(*) as c FROM users WHERE referred_by = ?',
      args: [req.user.referral_code]
    });
    const referralEarnings = await db.execute({
      sql: "SELECT COALESCE(SUM(amount),0) as total FROM wallet_transactions WHERE user_id = ? AND type = 'referral'",
      args: [uid]
    });

    res.json({
      balance: { cops: req.user.wallet_balance || 0, points: req.user.points_balance || 0 },
      spin: { canSpin, prizes: SPIN_PRIZES.map(p => ({ type: p.type, label: p.label })) },
      tasks: tasks.rows,
      referral: {
        code: req.user.referral_code,
        totalReferrals: referralCount.rows[0].c,
        totalEarnings: referralEarnings.rows[0].total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/earn/spin — one free spin per day
router.post('/spin', protect, async (req, res) => {
  try {
    const uid = req.user.id;
    const todayKey = new Date().toISOString().slice(0, 10);
    const prize = pickPrize();

    // Insert-first with a UNIQUE(user_id, spin_date) constraint: this is the
    // atomic check — if it inserts 0 rows, someone already spun today (even
    // if two requests race in at the same instant, only one can win).
    const inserted = await db.execute({
      sql: `INSERT INTO spin_history (id, user_id, prize_type, prize_value, spin_date)
            VALUES (?, ?, ?, ?, ?) ON CONFLICT (user_id, spin_date) DO NOTHING`,
      args: [uuidv4(), uid, prize.type, String(prize.value), todayKey]
    });
    if (!inserted.info.changes) {
      return res.status(400).json({ message: 'You already spun today — come back tomorrow!' });
    }

    if (prize.type === 'points') {
      await db.execute({ sql: 'UPDATE users SET points_balance = points_balance + ? WHERE id = ?', args: [prize.value, uid] });
    } else if (prize.type === 'cops') {
      await db.execute({ sql: 'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', args: [prize.value, uid] });
      await db.execute({
        sql: `INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, 'reward', ?, 'Spin wheel prize')`,
        args: [uuidv4(), uid, prize.value]
      });
    } else if (prize.type === 'xp') {
      await db.execute({ sql: 'UPDATE users SET xp = xp + ? WHERE id = ?', args: [prize.value, uid] });
    }

    await progressMission(uid, 'spin', 1);

    res.json({ message: 'Spin complete!', prize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/earn/tasks/:id/complete — claim a one-time task reward
router.post('/tasks/:id/complete', protect, async (req, res) => {
  try {
    const uid = req.user.id;
    const taskId = req.params.id;

    const task = await db.execute({ sql: 'SELECT * FROM tasks WHERE id = ? AND active = 1', args: [taskId] });
    if (task.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    const t = task.rows[0];

    const existing = await db.execute({ sql: 'SELECT 1 FROM user_tasks WHERE user_id = ? AND task_id = ?', args: [uid, taskId] });
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Task already completed' });

    await db.execute({ sql: 'INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)', args: [uid, taskId] });
    await db.execute({
      sql: 'UPDATE users SET points_balance = points_balance + ?, xp = xp + ? WHERE id = ?',
      args: [t.points_reward, t.xp_reward, uid]
    });

    res.json({ message: 'Task completed!', pointsEarned: t.points_reward, xpEarned: t.xp_reward });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/earn/referrals — detailed referral list + commission history
router.get('/referrals', protect, async (req, res) => {
  try {
    const uid = req.user.id;
    const referred = await db.execute({
      sql: `SELECT id, username, avatar, created_at FROM users WHERE referred_by = ? ORDER BY created_at DESC`,
      args: [req.user.referral_code]
    });
    const commissions = await db.execute({
      sql: `SELECT id, amount, description, created_at FROM wallet_transactions
            WHERE user_id = ? AND type = 'referral' ORDER BY created_at DESC LIMIT 50`,
      args: [uid]
    });
    res.json({
      code: req.user.referral_code,
      totalReferrals: referred.rows.length,
      referredUsers: referred.rows,
      commissions: commissions.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/earn/leaderboard?period=weekly|monthly|alltime
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const period = req.query.period || 'alltime';
    let rows;
    if (period === 'alltime') {
      const r = await db.execute(
        `SELECT id, username, avatar, points_balance, level FROM users ORDER BY points_balance DESC LIMIT 20`
      );
      rows = r.rows;
    } else {
      const days = period === 'weekly' ? 7 : 30;
      const r = await db.execute({
        sql: `SELECT u.id, u.username, u.avatar, u.level,
                     COALESCE(SUM(wt.amount), 0) as period_earnings
              FROM users u
              LEFT JOIN wallet_transactions wt ON wt.user_id = u.id
                AND wt.created_at >= datetime('now', '-' || ? || ' days')
              GROUP BY u.id
              ORDER BY period_earnings DESC
              LIMIT 20`,
        args: [days]
      });
      rows = r.rows;
    }
    res.json({ period, leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── CPA OFFER WALL ──────────────────────────────────────────
// COPS conversion rate — keep in sync with the frontend's COPS_RATE in index.html
const COPS_RATE_USD = 0.012; // 1 COP = $0.012 USD

// GET /api/earn/offerwall — returns the embeddable offer wall URL for this user.
// Set CPA_OFFERWALL_URL with the literal placeholder text "SUBID" wherever your
// network's tracking ID should go (e.g. https://playabledownload.com/1906989/SUBID
// for CPAGrip's Smart Link format). If your URL has no "SUBID" placeholder at all,
// it falls back to appending ?subid=... as a query param instead.
router.get('/offerwall', protect, async (req, res) => {
  const base = process.env.CPA_OFFERWALL_URL;
  if (!base) return res.status(503).json({ message: 'Offer wall is not configured yet' });
  const uid = encodeURIComponent(req.user.id);
  let url;
  if (base.includes('SUBID')) {
    url = base.replace(/SUBID/g, uid);
  } else {
    const sep = base.includes('?') ? '&' : '?';
    url = `${base}${sep}subid=${uid}`;
  }
  res.json({ url });
});

// GET /api/earn/cpa-postback — server-to-server callback the CPA network calls
// when a user completes an offer. NOT behind `protect` (the network isn't a
// logged-in user) — instead it's guarded by a shared secret + strict validation.
//
// Expected query params (standard across most networks, though param names vary —
// check your network's documentation and adjust the field names read below):
//   subid          = the ScottyHub user id we passed when building the offerwall URL
//   transaction_id = the network's unique id for this specific conversion
//   payout         = USD payout for this conversion
//   secret         = CPA_POSTBACK_SECRET (set this exact value in your network's postback URL config)
router.get('/cpa-postback', async (req, res) => {
  try {
    const configuredSecret = process.env.CPA_POSTBACK_SECRET;
    if (!configuredSecret) return res.status(503).send('NOT_CONFIGURED');
    if (req.query.secret !== configuredSecret) return res.status(403).send('INVALID_SECRET');

    const userId = String(req.query.subid || '').trim();
    const transactionId = String(req.query.transaction_id || req.query.trans_id || '').trim();
    const payoutUsd = Number(req.query.payout || req.query.amount);
    const network = String(req.query.network || 'default').trim().slice(0, 50);
    const offerId = String(req.query.offer_id || '').trim().slice(0, 100);

    if (!userId || !transactionId || !Number.isFinite(payoutUsd) || payoutUsd <= 0) {
      return res.status(400).send('MISSING_OR_INVALID_PARAMS');
    }

    const userCheck = await db.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [userId] });
    if (!userCheck.rows.length) return res.status(404).send('UNKNOWN_USER');

    const copsCredited = Math.max(1, Math.round(payoutUsd / COPS_RATE_USD));

    // Insert-first: the UNIQUE(network, transaction_id) constraint is the real
    // guard here. If this exact conversion was already recorded — whether from
    // a genuine network retry or a replay attempt — this insert affects 0 rows
    // and we skip crediting entirely.
    const recorded = await db.execute({
      sql: `INSERT INTO cpa_conversions (id, user_id, network, offer_id, transaction_id, payout_usd, cops_credited, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (network, transaction_id) DO NOTHING`,
      args: [uuidv4(), userId, network, offerId, transactionId, payoutUsd, copsCredited, req.ip || '']
    });
    if (!recorded.info.changes) return res.status(200).send('ALREADY_RECORDED');

    await db.execute({ sql: 'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', args: [copsCredited, userId] });
    await db.execute({
      sql: `INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, 'reward', ?, ?)`,
      args: [uuidv4(), userId, copsCredited, `CPA offer completed (${network})`]
    });
    await progressMission(userId, 'cpa_offer', 1);

    res.status(200).send('OK');
  } catch (err) {
    console.error('CPA postback error:', err);
    res.status(500).send('SERVER_ERROR');
  }
});

// GET /api/earn/cpa-history — a user's own completed CPA offers (for the Earn Center UI)
router.get('/cpa-history', protect, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT network, cops_credited, created_at FROM cpa_conversions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      args: [req.user.id]
    });
    res.json({ conversions: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
