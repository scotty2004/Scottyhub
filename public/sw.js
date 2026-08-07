// ScottyHub service worker — real push notifications.
// This keeps running in the background (per browser/OS push-service rules)
// so a notification can pop up even if no ScottyHub tab is open.

const SW_VERSION = 'v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// A push message arrived from our server (via web-push) — show it as a
// real system notification (lock screen / notification tray).
self.addEventListener('push', (event) => {
  let data = { title: 'ScottyHub', body: 'You have a new update.', url: '/', tag: 'scottyhub-general', icon: '/icon-192.png' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (e) { /* keep defaults */ }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag,
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// User tapped the notification — focus an existing ScottyHub tab if one is
// open, otherwise open a new one at the relevant page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c);
      if (existing) {
        existing.navigate(targetUrl).catch(() => {});
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
