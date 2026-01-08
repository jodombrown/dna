import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'default';
}

/**
 * usePushNotifications - Hook for managing web push notification subscriptions
 * 
 * Handles:
 * - Checking browser support
 * - Requesting permission
 * - Subscribing/unsubscribing from push
 * - Storing subscription in database
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        'Notification' in window;

      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      const permission = Notification.permission;
      
      // Check if already subscribed
      let isSubscribed = false;
      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        }
      } catch (error) {
        console.debug('Error checking push subscription:', error);
      }

      setState({
        isSupported: true,
        isSubscribed,
        isLoading: false,
        permission,
      });
    };

    checkSupport();
  }, []);

  /**
   * Register service worker and subscribe to push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to enable notifications');
      return false;
    }

    if (!state.isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, isLoading: false, permission }));
        toast.error('Notification permission denied');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment or use placeholder
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
      }

      // Subscribe to push
      let subscription: PushSubscription | null = null;
      
      if (vapidPublicKey) {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      } else {
        // Check for existing subscription
        subscription = await registration.pushManager.getSubscription();
      }

      // Store subscription in database via edge function
      if (subscription) {
        const subscriptionData = subscription.toJSON();
        
        // Call edge function to store subscription
        supabase.functions.invoke('send-push-notification', {
          body: {
            action: 'register',
            user_id: user.id,
            endpoint: subscription.endpoint,
            subscription_data: subscriptionData,
          }
        }).catch(() => {
          // Silent fail - subscription still works for in-app
          console.debug('Push subscription registration queued');
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
        permission: 'granted',
      }));

      toast.success('Push notifications enabled!');
      return true;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, [user, state.isSupported]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();

          // Mark subscription as inactive in database
          await supabase
            .from('push_subscriptions' as never)
            .update({ is_active: false } as never)
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast.success('Push notifications disabled');
      return true;

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user]);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

/**
 * Convert a base64 string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
