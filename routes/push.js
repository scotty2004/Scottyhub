const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { protect } = require('../middleware/auth');
const { getVapidPublicKey } = require('../utils/webpush');

// GET /api/push/vapid-key — public VAPID key the browser needs to subscribe
router.get('/vapid-key', async (req, res) => {
  try {
    const key = await getVapidPublicKey();
    if (!key) return res.status(503).json({ message: 'Push not configured yet' });
    res.json({ key });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/push/subscribe — save (or refresh) the logged-in user's subscription
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: 'Invalid subscription' });
    }
    await db.execute({
      sql: `INSERT INTO push_subscriptions (endpoint, user_id, keys, user_agent)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (endpoint)
            DO UPDATE SET user_id = excluded.user_id, keys = excluded.keys,
                          user_agent = excluded.user_agent, updated_at = NOW()::text`,
      args: [subscription.endpoint, req.user.id, JSON.stringify(subscription.keys), req.headers['user-agent'] || '']
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/push/subscribe — remove a subscription (user turned notifications off)
router.delete('/subscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await db.execute({
        sql: 'DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?',
        args: [endpoint, req.user.id]
      });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
