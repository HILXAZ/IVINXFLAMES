// Service Worker for PWA functionality
const CACHE_NAME = 'addiction-control-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline habit logging
self.addEventListener('sync', (event) => {
  if (event.tag === 'habit-log-sync') {
    event.waitUntil(syncHabitLogs());
  }
});

async function syncHabitLogs() {
  try {
    // Get pending logs from IndexedDB or localStorage
    const pendingLogs = JSON.parse(localStorage.getItem('pendingHabitLogs') || '[]');
    
    if (pendingLogs.length > 0) {
      // Try to sync each pending log
      for (const log of pendingLogs) {
        try {
          const response = await fetch('/api/habit-logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(log)
          });
          
          if (response.ok) {
            // Remove successfully synced log
            const remainingLogs = pendingLogs.filter(l => l.id !== log.id);
            localStorage.setItem('pendingHabitLogs', JSON.stringify(remainingLogs));
          }
        } catch (error) {
          console.error('Failed to sync habit log:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error during habit log sync:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New message from Addiction Control',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Addiction Control', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
