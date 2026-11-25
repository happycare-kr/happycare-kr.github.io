// L1 장기요양 통합앱 PWA Service Worker (v70 no-store + Web Push 알림 수신·자동설정·딥링크)
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request)));
});

self.addEventListener('push', (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch (_) {
    try { d = { body: e.data ? e.data.text() : '새 알림이 도착했습니다.' }; } catch (_2) {}
  }
  const title = d.title || 'L1 업무 메신저';
  const opts = {
    body: d.body || '새 메시지 또는 요청이 도착했습니다.',
    icon: '/assets/app_icon_192.png',
    badge: '/assets/app_icon_192.png',
    tag: d.tag || ('hc-msg-' + (d.roomId || 'general')),
    renotify: true,
    vibrate: [180, 80, 180],
    data: {
      url: d.url || '/care_app.html',
      roomId: d.roomId || '',
      tab: d.tab || '',
      agency: d.agency || '',
    },
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const info = (e.notification && e.notification.data) || {};
  const targetUrl = info.url || '/care_app.html';
  e.waitUntil((async () => {
    const winList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of winList) {
      try {
        await c.focus();
        c.postMessage({
          type: 'pushOpenRoom',
          roomId: info.roomId || '',
          tab: info.tab || '',
          agency: info.agency || '',
        });
        return;
      } catch (_) {}
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});
