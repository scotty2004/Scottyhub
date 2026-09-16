// utils/push.js
//
// Real browser push notifications — these show up as system notifications
// (lock screen, notification tray/center) even when ScottyHub isn't open in
// a tab, as long as the user granted permission once. Works on Android
// Chrome, desktop Chrome/Edge/Firefox. iOS Safari needs the site added to
// the Home Screen (PWA install) before push works — that's an Apple
// platform limit, not something we can code around.
//
// Setup (one-time):
//   1. Run:  node -e "console.log(require('web-push').generateVAPIDKeys())"
//   2. Put the printed publicKey/privateKey into Render env vars:
//        VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT=mailto:you@example.com
//   3. Deploy. That's it — subscriptions + sending are handled below.

let webpush;
try {
  webpush = require('web-push');
} catch (e) {
  console.warn('[push] "web-push" package not installed — run `npm install` after pulling these files. Push notifications disabled, rest of the site is unaffected.');
}
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@scottyhub.onrender.com';

let pushReady = false;
if (webpush && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  pushReady = true;
} else if (webpush) {
  console.warn('[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — push notifications disabled until configured.');
}

async function saveSubscription(userId, sub, ua = '') {
  const { endpoint, keys } = sub || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) throw new Error('Invalid subscription');
  await db.execute({
    sql: `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, ua)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT (endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, ua = excluded.ua`,
    args: [uuidv4(), userId, endpoint, keys.p256dh, keys.auth, ua]
  });
}

async function removeSubscription(endpoint) {
  await db.execute({ sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?', args: [endpoint] });
}

// Sends a push to every device a user is subscribed on.
// payload: { title, body, url, tag, icon }
async function sendPushToUser(userId, payload) {
  if (!pushReady || !webpush) return;
  try {
    const { rows } = await db.execute({ sql: 'SELECT * FROM push_subscriptions WHERE user_id = ?', args: [userId] });
    if (!rows.length) return;

    const data = JSON.stringify({
      title: payload.title || 'ScottyHub',
      body: payload.body || '',
      url: payload.url || '/',
      tag: payload.tag || 'scottyhub-general',
      icon: payload.icon || '/icon-192.png'
    });

    await Promise.all(rows.map(async (row) => {
      const sub = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
      try {
        await webpush.sendNotification(sub, data);
      } catch (err) {
        // 404/410 = subscription is dead (user revoked permission, uninstalled, etc.) — clean it up.
        if (err.statusCode === 404 || err.statusCode === 410) {
          await removeSubscription(row.endpoint).catch(() => {});
        }
      }
    }));
  } catch (e) { /* non-fatal — in-app notifications still work */ }
}

module.exports = { saveSubscription, removeSubscription, sendPushToUser, VAPID_PUBLIC_KEY, pushReady: () => pushReady };
