import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// /dna/dev route: enables Dev Bypass and redirects into the app
const DnaDev: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('dna_dev', '1');
    } catch {}
    // Small delay to ensure storage is persisted before navigation
    const t = setTimeout(() => navigate('/app', { replace: true }), 50);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold">Developer Bypass Enabled</h1>
        <p className="text-muted-foreground">Redirecting you to the dashboard…</p>
      </div>
    </main>
  );
};

export default DnaDev;
