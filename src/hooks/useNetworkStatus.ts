import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStrength, setConnectionStrength] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      testConnectionSpeed();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStrength('unknown');
    };

    const testConnectionSpeed = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          setConnectionStrength(duration < 500 ? 'fast' : 'slow');
        }
      } catch (error) {
        setConnectionStrength('slow');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection speed on mount if online
    if (navigator.onLine) {
      testConnectionSpeed();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionStrength };
};