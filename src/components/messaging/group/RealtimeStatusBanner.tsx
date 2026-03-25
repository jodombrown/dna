/**
 * RealtimeStatusBanner - Connection state feedback
 * 
 * Shows at top of thread when connection is degraded:
 * - reconnecting: yellow banner with spinner
 * - offline: red banner with tap-to-retry
 * - connected: hidden (or brief green flash after reconnect)
 */

import React, { useState, useEffect } from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/types/groupMessaging';

interface RealtimeStatusBannerProps {
  status: ConnectionStatus;
  onRetry: () => void;
}

export function RealtimeStatusBanner({ status, onRetry }: RealtimeStatusBannerProps) {
  const [showConnected, setShowConnected] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    if (status === 'reconnecting' || status === 'offline') {
      setWasDisconnected(true);
    }

    if (status === 'connected' && wasDisconnected) {
      setShowConnected(true);
      const timer = setTimeout(() => {
        setShowConnected(false);
        setWasDisconnected(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, wasDisconnected]);

  if (status === 'connected' && !showConnected) return null;

  return (
    <div
      className={cn(
        'flex-shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium transition-all animate-in slide-in-from-top duration-200',
        status === 'reconnecting' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        status === 'offline' && 'bg-destructive/10 text-destructive cursor-pointer',
        status === 'connected' && showConnected && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      )}
      onClick={status === 'offline' ? onRetry : undefined}
    >
      {status === 'reconnecting' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Reconnecting...
        </>
      )}
      {status === 'offline' && (
        <>
          <WifiOff className="h-3 w-3" />
          No connection. Tap to retry.
        </>
      )}
      {status === 'connected' && showConnected && (
        <>Connected</>
      )}
    </div>
  );
}
