// Web Push helper — OS-level push notifications (VAPID via web-push).
//
// VAPID keys are auto-generated on first boot and persisted in the app_settings
// table so they survive restarts. For production you can instead set:
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT
const webpush = require('web-push');
const { db } = require('../db');

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:maposacourage41@gmail.com';

let vapidPublicKey = null;
let vapidReady = false;

async function ensureVapidKeys() {
  if (vapidReady && vapidPublicKey) return;
  try {
    let publicKey = process.env.VAPID_PUBLIC_KEY || null;
    let privateKey = process.env.VAPID_PRIVATE_KEY || null;

    if (!publicKey || !privateKey) {
      const rows = (
        await db.execute({
          sql: 'SELECT key, value FROM app_settings WHERE key IN (?, ?)',
          args: ['vapid_public_key', 'vapid_private_key']
        })
      ).rows;
      const stored = {};
      for (const r of rows) stored[r.key] = r.value;
      publicKey = stored.vapid_public_key || publicKey;
      privateKey = stored.vapid_private_key || privateKey;
    }

    if (!publicKey || !privateKey) {
      const keys = webpush.generateVAPIDKeys();
      publicKey = keys.publicKey;
      privateKey = keys.privateKey;
      await db.execute({
        sql: 'INSERT INTO app_settings (key, value) VALUES (?, ?), (?, ?) ON CONFLICT (key) DO NOTHING',
        args: ['vapid_public_key', publicKey, 'vapid_private_key', privateKey]
      });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
    vapidPublicKey = publicKey;
    vapidReady = true;
  } catch (e) {
    console.error('[push] VAPID setup failed:', e.message);
  }
}

async function getVapidPublicKey() {
  await ensureVapidKeys();
  return vapidPublicKey;
}

// Fire a push to every device subscription belonging to `userId`.
// Dead subscriptions (404 / 410 Gone) are cleaned up automatically.
async function sendPushToUser(userId, { title, body, url = '/', tag = null, data = {} } = {}) {
  try {
    await ensureVapidKeys();
    if (!vapidReady) return;
    const res = await db.execute({
      sql: 'SELECT endpoint, keys FROM push_subscriptions WHERE user_id = ?',
      args: [userId]
    });
    const payload = JSON.stringify({ title, body, url, icon: '/icon-192.png', tag, data });

    for (const row of res.rows) {
      let subscription;
      try {
        subscription = { endpoint: row.endpoint, keys: JSON.parse(row.keys || '{}') };
      } catch {
        continue;
      }
      if (!subscription.keys || !subscription.keys.p256dh) continue;
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db.execute({ sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?', args: [row.endpoint] }).catch(() => {});
        } else {
          console.error('[push] send error:', err.message);
        }
      }
    }
  } catch (e) {
    console.error('[push] sendPushToUser error:', e.message);
  }
}

module.exports = { getVapidPublicKey, sendPushToUser };
