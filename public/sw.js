// Service Worker with Android-specific notification events and background action listeners
const CACHE_NAME = 'loki-gym-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network requests pass through, fallback to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  
  if (action === 'drink-250' || action === 'drink-500') {
    const amount = action === 'drink-250' ? 250 : 500;
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Send postMessage to any open tabs so they update state instantly
        let openClient = null;
        for (const client of clientList) {
          client.postMessage({ type: 'ADD_WATER_FROM_NOTIFICATION', amount });
          openClient = client;
        }
        
        // If a tab is open, focus it
        if (openClient && 'focus' in openClient) {
          return openClient.focus();
        }
        
        // If no tab is open, open a new window with a query parameter
        if (self.clients.openWindow) {
          return self.clients.openWindow(`/?add_water=${amount}`);
        }
      })
    );
  } else {
    // Standard click: Focus or open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});
