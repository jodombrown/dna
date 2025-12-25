import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showSlowWarning?: boolean;
  dismissible?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showSlowWarning = true,
  dismissible = true,
}) => {
  const { isOnline, connectionStrength } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Listen for service worker update events
  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleRefresh = () => {
    setIsReconnecting(true);
    // Force refresh to get latest content
    window.location.reload();
  };

  const handleUpdate = () => {
    // Tell service worker to skip waiting and activate new version
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  // Show update available banner
  if (updateAvailable) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-dna-emerald text-white px-4 py-3 shadow-lg',
          'flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin-slow" />
          <span className="text-sm font-medium">
            A new version of DNA is available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            Update Now
          </Button>
          {dismissible && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setUpdateAvailable(false)}
              className="hover:bg-white/20 text-white h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show offline banner
  if (!isOnline && !dismissed) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-3 shadow-lg',
          'flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">You're offline</span>
            <span className="text-xs opacity-80">
              Some features may not work until you reconnect
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isReconnecting}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            {isReconnecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </>
            )}
          </Button>
          {dismissible && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="hover:bg-white/20 text-white h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show slow connection warning
  if (showSlowWarning && isOnline && connectionStrength === 'slow' && !dismissed) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 shadow-md',
          'flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Slow connection detected</span>
        </div>
        {dismissible && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="hover:bg-white/20 text-white h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return null;
};

// Compact version for inline use (e.g., in headers)
export const OfflineIndicatorCompact: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { isOnline, connectionStrength } = useNetworkStatus();

  if (isOnline && connectionStrength !== 'slow') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        !isOnline
          ? 'bg-destructive/10 text-destructive'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        className
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          <span>Slow</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
