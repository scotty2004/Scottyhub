/* ScottyHub Service Worker — Web Push notifications */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// OS-level push notification — fires even when the tab/site is closed.
self.addEventListener('push', (e) => {
  let data = {
    title: 'ScottyHub',
    body: 'You have a new notification',
    url: '/',
    icon: '/icon-192.png',
    tag: null,
    data: {}
  };
  try {
    const payload = e.data && e.data.json();
    if (payload) data = Object.assign(data, payload);
  } catch (_) { /* malformed payload — fall back to defaults */ }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/icon-192.png',
    data: Object.assign({ url: data.url || '/' }, data.data || {}),
    renotify: !!data.tag,
    vibrate: [120, 60, 120]
  };
  if (data.tag) options.tag = data.tag;

  e.waitUntil(self.registration.showNotification(data.title, options));

  // Relay to any open tabs so the in-app toast/bell also updates.
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      list.forEach((c) => c.postMessage({ type: 'scottyhub-push', title: data.title, body: data.body, url: data.url }));
    })
  );
});

// Clicking the notification opens (or focuses) the app at the right place.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          try { c.navigate(url); } catch (_) { /* same-origin only */ }
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'scottyhub-skip') self.skipWaiting();
});
