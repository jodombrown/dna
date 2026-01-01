/**
 * usePulseNavigation - Unified Navigation Data Hook
 *
 * Serves both PulseDock (mobile) and PulseBar (desktop) with consistent
 * Five C's data, message/notification counts, and computed MORE button state.
 */

import { useMemo } from 'react';
import { usePulseBar } from './usePulseBar';
import { useUnreadCounts } from './useUnreadCounts';
import type { PulseSection, PulseStatus } from '@/types/pulse';

export interface MoreButtonState {
  hasActivity: boolean;
  totalCount: number;
  hasAttention: boolean;
  hasUrgent: boolean;
  status: PulseStatus;
}

export interface PulseNavigationData {
  // Five C's (from usePulseBar)
  connect: PulseSection | undefined;
  convene: PulseSection | undefined;
  collaborate: PulseSection | undefined;
  contribute: PulseSection | undefined;
  convey: PulseSection | undefined;

  // Additional for mobile tray
  messages: { unreadCount: number };
  notifications: { unreadCount: number };

  // Computed for MORE button
  more: MoreButtonState;

  // Meta
  isLoading: boolean;
  lastUpdated: string | undefined;
}

export function usePulseNavigation(): PulseNavigationData {
  const { pulseData, isLoading: pulseLoading } = usePulseBar();
  const { messages, notifications, isLoading: unreadLoading } = useUnreadCounts();

  // Compute MORE button aggregate from tray items
  const more = useMemo((): MoreButtonState => {
    const trayItems = [
      pulseData?.contribute,
      pulseData?.convey,
      {
        count: messages.unreadCount,
        status: (messages.unreadCount > 0 ? 'active' : 'dormant') as PulseStatus,
      },
      {
        count: notifications.unreadCount,
        status: (notifications.unreadCount > 0 ? 'active' : 'dormant') as PulseStatus,
      },
    ];

    const hasActivity = trayItems.some((item) => item && item.count > 0);
    const totalCount = trayItems.reduce((sum, item) => sum + (item?.count || 0), 0);
    const hasAttention = trayItems.some((item) => item?.status === 'attention');
    const hasUrgent = trayItems.some((item) => item?.status === 'urgent');

    let status: PulseStatus = 'dormant';
    if (hasUrgent) status = 'urgent';
    else if (hasAttention) status = 'attention';
    else if (hasActivity) status = 'active';

    return { hasActivity, totalCount, hasAttention, hasUrgent, status };
  }, [pulseData, messages, notifications]);

  return {
    connect: pulseData?.connect,
    convene: pulseData?.convene,
    collaborate: pulseData?.collaborate,
    contribute: pulseData?.contribute,
    convey: pulseData?.convey,
    messages: { unreadCount: messages.unreadCount },
    notifications: { unreadCount: notifications.unreadCount },
    more,
    isLoading: pulseLoading || unreadLoading,
    lastUpdated: pulseData?.last_updated,
  };
}
