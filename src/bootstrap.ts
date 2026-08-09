/**
 * Non-React bootstrap for the Lovable/Vite preview.
 *
 * The app has a service worker that caches JS/CSS assets in production. In the
 * dev preview, those cached Vite dependency chunks can outlive a dependency
 * pre-bundle change. If React is served from one stale chunk and ReactDOM from a
 * fresh chunk, hooks crash before the app mounts with:
 *   "TypeError: null is not an object (evaluating 'dispatcher.useState')".
 *
 * Keep this file free of React imports so stale service-worker/cache state is
 * removed before /src/main.tsx imports React or ReactDOM.
 */
const clearDevelopmentPreviewCache = async () => {
  if (!import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return false;
  }

  let clearedState = Boolean(navigator.serviceWorker.controller);

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    clearedState = clearedState || registrations.length > 0;
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // Preview cache cleanup is best-effort.
  }

  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      const dnaCacheKeys = cacheKeys.filter(
        (key) => key.startsWith('dna-cache-') || key.startsWith('dna-runtime-')
      );

      clearedState = clearedState || dnaCacheKeys.length > 0;
      await Promise.all(dnaCacheKeys.map((key) => caches.delete(key)));
    } catch {
      // Preview cache cleanup is best-effort.
    }
  }

  return clearedState;
};

const RETRY_FLAG = 'dna-bootstrap-retry';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const importMainWithRetry = async () => {
  // A dev-server restart or a dropped chunk fetch can kill this import.
  // Retry a few times with backoff before falling back to a reload.
  // Keep the specifier static: a `?boot=` query string is not part of Vite's
  // module graph, so those requests 404 in the preview and never recover.
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await import('./main');
      return;
    } catch (error) {
      lastError = error;
      await wait(300 * (attempt + 1));
    }
  }
  throw lastError;
};

const boot = async () => {
  const clearedState = await clearDevelopmentPreviewCache();

  if (clearedState) {
    window.location.reload();
    return;
  }

  try {
    await importMainWithRetry();
    sessionStorage.removeItem(RETRY_FLAG);
  } catch (error) {
    // Reload once so the app self-heals instead of leaving a blank screen.
    if (!sessionStorage.getItem(RETRY_FLAG)) {
      sessionStorage.setItem(RETRY_FLAG, '1');
      window.location.reload();
      return;
    }
    throw error;
  }
};


void boot();