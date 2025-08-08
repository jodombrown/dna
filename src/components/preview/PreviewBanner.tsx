import React, { useEffect, useState } from 'react';

// Lightweight preview mode banner. Activated via ?preview=1, /app/preview, or localStorage flag 'dna_preview'.
export const isPreviewActive = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') return true;
    if (window.location.pathname.includes('/app/preview')) return true;
    return localStorage.getItem('dna_preview') === '1';
  } catch {
    return false;
  }
};

const PreviewBanner: React.FC = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPathPreview = window.location.pathname.includes('/app/preview');
    if (params.get('preview') === '1' || isPathPreview) {
      try { localStorage.setItem('dna_preview', '1'); } catch {}
    }
    setActive(isPreviewActive());
  }, []);

  if (!active) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60]">
      <div className="mx-auto max-w-screen-2xl px-4 py-2">
        <div className="flex items-center justify-between rounded-md border bg-primary/10 text-primary border-primary/20 px-3 py-2 shadow-sm">
          <div className="text-sm font-medium">
            Preview Mode — data is mocked; auth is bypassed.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try { localStorage.removeItem('dna_preview'); } catch {}
                // Remove preview query param and reload
                const url = new URL(window.location.href);
                url.searchParams.delete('preview');
                window.location.replace(url.toString());
              }}
              className="inline-flex items-center rounded-sm border border-primary/30 bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5 transition"
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewBanner;
