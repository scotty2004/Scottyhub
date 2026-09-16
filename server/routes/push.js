const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { saveSubscription, removeSubscription, VAPID_PUBLIC_KEY, pushReady } = require('../utils/push');

// GET /api/push/vapid-public-key — frontend needs this to call pushManager.subscribe()
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY, ready: pushReady() });
});

// POST /api/push/subscribe — save/refresh a device's push subscription
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: 'subscription required' });
    await saveSubscription(req.user.id, subscription, req.headers['user-agent'] || '');
    res.status(201).json({ message: 'Subscribed to push notifications' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to subscribe' });
  }
});

// POST /api/push/unsubscribe — stop sending push to this device
router.post('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'endpoint required' });
    await removeSubscription(endpoint);
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
