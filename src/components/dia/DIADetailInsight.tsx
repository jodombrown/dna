/**
 * DNA | DIA Detail Insight Component
 *
 * Compact, single-card DIA insight for detail pages (Event, Space, Opportunity).
 * Shows a contextual insight relevant to the specific entity being viewed.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { DIAInsightCard } from '@/components/dia/DIAInsightCard';
import {
  getDIACards,
  dismissDIACard,
  type DIACardSurface,
  type DIACardAction,
} from '@/services/diaCardService';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ──────────────────────────────────────────

interface DIADetailInsightProps {
  surface: DIACardSurface;
  entityId?: string;
  className?: string;
}

// ── Component ──────────────────────────────────────

export function DIADetailInsight({
  surface,
  entityId,
  className,
}: DIADetailInsightProps) {
  const { user } = useAuth();

  const { data: cards, refetch } = useQuery({
    queryKey: ['dia-detail-cards', surface, user?.id, entityId],
    queryFn: () =>
      getDIACards({
        userId: user?.id || '',
        surface,
        limit: 1,
        excludeDismissed: true,
      }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleAction = (_action: DIACardAction) => {
    // Navigation handled in DIAInsightCard
  };

  const handleDismiss = (dismissKey: string) => {
    dismissDIACard(dismissKey);
    refetch();
  };

  if (!cards || cards.length === 0) {
    return null;
  }

  const card = cards[0];

  return (
    <div className={cn('my-4', className)}>
      <DIAInsightCard
        card={card}
        onAction={handleAction}
        onDismiss={handleDismiss}
        compact
      />
    </div>
  );
}

export default DIADetailInsight;
