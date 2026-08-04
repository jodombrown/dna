/**
 * ConnectRelatedRail — the Connect surface's right rail (AppShell `related`).
 *
 * Two panels: DIA and Invitations (BD363 §5). The map lens passes no `related`
 * at all, so this component never renders there and the shell drops the track.
 *
 * Empty states are verbatim from the frame and are text only — never a
 * fabricated member, count or avatar (BD111). DIA speaks only when it has an
 * introduction worth making; an empty DIA panel says so rather than inventing a
 * card, and Invitations shows the honest "none pending" line.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { MateMasie } from '@/components/icons/adinkra';
import { DIAInsightCard } from '@/components/dia/DIAInsightCard';
import { ConnectionRequestCard } from '@/components/connect/ConnectionRequestCard';
import {
  getDIACards,
  dismissDIACard,
  type DIACardAction,
} from '@/services/diaCardService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface ConnectRelatedRailProps {
  /** BD063: messaging is OUT at v0.0, so this is a no-op today. */
  onMessageUser?: (userId: string) => void;
}

export function ConnectRelatedRail({ onMessageUser }: ConnectRelatedRailProps) {
  const { user } = useAuth();

  const {
    data: diaCards,
    isLoading: diaLoading,
    refetch: refetchDia,
  } = useQuery({
    queryKey: ['dia-cards', 'connect_hub', user?.id],
    queryFn: () =>
      getDIACards({
        userId: user?.id || '',
        surface: 'connect_hub',
        limit: 2,
        excludeDismissed: true,
      }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: invitations, isLoading: invitesLoading } = useQuery({
    queryKey: ['connect-invitations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as Array<{ connection_id: string }>;
      const { data, error } = await supabase.rpc('get_connection_requests', {
        user_id: user.id,
      });
      if (error) {
        logger.warn('ConnectRelatedRail', 'Failed to load invitations:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const handleAction = (_action: DIACardAction) => {
    // Navigation is handled inside DIAInsightCard.
  };

  const handleDismiss = (dismissKey: string) => {
    dismissDIACard(dismissKey);
    refetchDia();
  };

  const hasDia = !!diaCards && diaCards.length > 0;
  const hasInvites = !!invitations && invitations.length > 0;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* DIA */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <MateMasie className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="text-body font-semibold text-foreground">DIA</h2>
        </div>

        {diaLoading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-meta">Loading insights…</span>
          </div>
        ) : hasDia ? (
          <div className="flex flex-col gap-3">
            {diaCards!.map((card) => (
              <DIAInsightCard
                key={card.id}
                card={card}
                onAction={handleAction}
                onDismiss={handleDismiss}
                onMessageUser={onMessageUser}
              />
            ))}
          </div>
        ) : (
          <p className="text-meta text-muted-foreground">
            Nothing to propose on Connect yet. DIA speaks when it has an
            introduction worth making, not to fill a panel.
          </p>
        )}
      </section>

      {/* Invitations */}
      <section className="flex flex-col gap-3">
        <h2 className="text-body font-semibold text-foreground">Invitations</h2>

        {invitesLoading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-meta">Loading invitations…</span>
          </div>
        ) : hasInvites ? (
          <div className="flex flex-col gap-3">
            {invitations!.map((request: { connection_id: string }) => (
              <ConnectionRequestCard key={request.connection_id} request={request as never} />
            ))}
          </div>
        ) : (
          <p className="text-meta text-muted-foreground">No pending invitations.</p>
        )}
      </section>
    </div>
  );
}

export default ConnectRelatedRail;
