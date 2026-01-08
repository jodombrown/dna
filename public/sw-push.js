/**
 * DNA Push Notification Service Worker
 * Handles background push notifications for messages, mentions, etc.
 */

const CACHE_NAME = 'dna-push-v1';
const APP_URL = 'https://diasporanetwork.africa';

// Handle push events
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event received but no data');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || data.body || 'You have a new notification',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || `dna-notification-${Date.now()}`,
      data: {
        url: data.action_url || data.url || '/dna/notifications',
        notification_id: data.notification_id,
        type: data.type,
      },
      vibrate: [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
    };

    // Add actor avatar if available
    if (data.actor_avatar_url) {
      options.image = data.actor_avatar_url;
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'DNA Notification', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action: open the URL
  const urlToOpen = notificationData?.url || '/dna/notifications';
  const fullUrl = urlToOpen.startsWith('http') ? urlToOpen : `${APP_URL}${urlToOpen}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(APP_URL) && 'focus' in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Service worker install
self.addEventListener('install', (event) => {
  console.log('DNA Push Service Worker installed');
  self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
  console.log('DNA Push Service Worker activated');
  event.waitUntil(clients.claim());
});
