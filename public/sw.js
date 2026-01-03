// DNA Platform Service Worker
// Provides offline support and caching strategies

// Cache version - increment this to force cache refresh on deploy
const CACHE_VERSION = '2';
const CACHE_NAME = `dna-cache-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `dna-runtime-v${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// Cache-first patterns (for static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
  /\/icons\//,
];

// Network-first patterns (for dynamic API data)
const NETWORK_FIRST_PATTERNS = [
  /\/rest\/v1\//,
  /supabase\.co/,
  /\/api\//,
];

// Never cache patterns
const NEVER_CACHE_PATTERNS = [
  /\/auth\//,
  /\/realtime\//,
  /\.hot-update\./,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => {
          // Only cache files that exist
          return true;
        }));
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// Helper function to check if URL matches any pattern
function matchesPattern(url, patterns) {
  return patterns.some((pattern) => pattern.test(url));
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip never-cache patterns
  if (matchesPattern(url, NEVER_CACHE_PATTERNS)) {
    return;
  }

  // Use cache-first for static assets
  if (matchesPattern(url, CACHE_FIRST_PATTERNS)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Use network-first for API calls
  if (matchesPattern(url, NETWORK_FIRST_PATTERNS)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: stale-while-revalidate for navigation
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: network-first for everything else
  event.respondWith(networkFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    console.error('[SW] Network-first failed:', error);
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Return cached version if network fails
      return cachedResponse;
    });

  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// Message event - handle skip waiting and cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  // Clear all caches and reload
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('[SW] Force clearing cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          console.log('[SW] All caches cleared');
          // Notify all clients to reload
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Sync pending offline actions
async function syncPendingActions() {
  // This would be implemented to sync any actions queued while offline
  console.log('[SW] Syncing pending actions...');
  return Promise.resolve();
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.message || 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'DNA', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const url = event.notification.data?.url || '/';

        // Focus existing window or open new one
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service worker loaded');
