/**
 * Cache Utilities
 * 
 * Provides functions to manage the service worker cache,
 * useful for forcing updates across all user devices.
 */

/**
 * Clear all service worker caches and reload the page.
 * This forces a fresh fetch of all assets.
 */
export async function clearCacheAndReload(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Tell the service worker to clear all caches
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    
    // Listen for confirmation and reload
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_CLEARED') {
        window.location.reload();
      }
    });
    
    // Fallback: reload after a short delay if no response
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    // No service worker, just reload
    window.location.reload();
  }
}

/**
 * Unregister the service worker completely.
 * Useful for debugging cache issues.
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    return true;
  }
  return false;
}

/**
 * Check for service worker updates and apply them.
 */
export async function checkForUpdates(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
}

/**
 * Get the current cache version.
 */
export async function getCacheVersion(): Promise<string | null> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.version || null);
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
      // Timeout fallback
      setTimeout(() => resolve(null), 1000);
    });
  }
  return null;
}

// Expose to window for easy console access during development
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).dnaCacheUtils = {
    clearCacheAndReload,
    unregisterServiceWorker,
    checkForUpdates,
    getCacheVersion,
  };
}
