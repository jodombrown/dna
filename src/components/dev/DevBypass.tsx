import React, { useEffect, useState } from 'react';

// Dev Bypass: silently skip auth redirects and provide mock session without showing the preview banner
export const isDevBypassActive = (): boolean => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1') return true;
    if (window.location.pathname.includes('/app/dev')) return true;
    return localStorage.getItem('dna_dev') === '1';
  } catch {
    return false;
  }
};

// Mount helper to honor ?dev=1 (enable) and ?dev=0 (disable) or /app/dev path
export const DevBypassMount: React.FC = () => {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pathDev = window.location.pathname.includes('/app/dev');
      const enable = params.get('dev') === '1' || pathDev;
      const disable = params.get('dev') === '0';

      if (enable) localStorage.setItem('dna_dev', '1');
      if (disable) localStorage.removeItem('dna_dev');
    } catch {}
  }, []);
  return null;
};

// Small toggle button; uses design tokens (no hard-coded colors)
export const DevBypassToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(isDevBypassActive());
  }, []);

  const toggle = () => {
    try {
      if (active) {
        localStorage.removeItem('dna_dev');
      } else {
        localStorage.setItem('dna_dev', '1');
      }
    } catch {}
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? 'Disable Dev Bypass' : 'Enable Dev Bypass'}
      className={`fixed bottom-4 right-4 z-[60] rounded-md border px-3 py-1.5 text-xs font-medium transition bg-background text-foreground border-border hover:bg-primary/10 hover:text-primary ${className ?? ''}`}
    >
      {active ? 'Dev Bypass: ON' : 'Dev Bypass: OFF'}
    </button>
  );
};
