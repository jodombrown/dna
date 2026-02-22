/**
 * DNA | Interest Manager — Sprint 13D
 *
 * Shows the opportunity poster a list of interested users.
 * Allows accept/decline actions and messaging.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMessage } from '@/contexts/MessageContext';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/services/notificationService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageCircle, Clock, Loader2 } from 'lucide-react';

interface InterestManagerProps {
  opportunityId: string;
  opportunityTitle: string;
}

interface OpportunityInterest {
  id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  profile?: {
    id: string;
    full_name: string | null;
    username: string;
    avatar_url: string | null;
    headline: string | null;
  };
}

const InterestManager: React.FC<InterestManagerProps> = ({
  opportunityId,
  opportunityTitle,
}) => {
  const queryClient = useQueryClient();
  const { openMessageOverlay } = useMessage();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: interests = [], isLoading } = useQuery({
    queryKey: ['opportunity-interests', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_interests' as any)
        .select(`
          *,
          profile:profiles!opportunity_interests_user_id_fkey(
            id, full_name, username, avatar_url, headline
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as OpportunityInterest[];
    },
    enabled: !!opportunityId,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ interestId, status, userId }: { interestId: string; status: 'accepted' | 'declined'; userId: string }) => {
      setProcessingId(interestId);

      const { error } = await supabase
        .from('opportunity_interests' as any)
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', interestId);

      if (error) throw error;

      // If accepted, update opportunity status to in_progress
      if (status === 'accepted') {
        await supabase
          .from('opportunities')
          .update({ status: 'in_progress' })
          .eq('id', opportunityId);

        await createNotification({
          user_id: userId,
          type: 'opportunity_interest_accepted',
          title: 'Interest accepted!',
          message: `Your interest in "${opportunityTitle}" has been accepted.`,
          link_url: `/dna/contribute`,
        });
      } else {
        await createNotification({
          user_id: userId,
          type: 'opportunity_interest_declined',
          title: 'Interest update',
          message: `Your interest in "${opportunityTitle}" was not selected.`,
          link_url: `/dna/contribute`,
        });
      }
    },
    onSuccess: (_, variables) => {
      setProcessingId(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity-interests', opportunityId] });
      toast({
        title: variables.status === 'accepted' ? 'Interest accepted' : 'Interest declined',
        description: variables.status === 'accepted'
          ? 'The opportunity is now in progress.'
          : 'The interested party has been notified.',
      });
    },
    onError: () => {
      setProcessingId(null);
      toast({ title: 'Error', description: 'Failed to respond. Please try again.', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (interests.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Interested People</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No one has expressed interest yet. Share your opportunity to get responses.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingInterests = interests.filter(i => i.status === 'pending');
  const respondedInterests = interests.filter(i => i.status !== 'pending');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Interested People
          <Badge variant="secondary" className="text-xs">
            {interests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {/* Pending interests first */}
        {pendingInterests.map((interest) => (
          <InterestItem
            key={interest.id}
            interest={interest}
            isProcessing={processingId === interest.id}
            onAccept={() => respondMutation.mutate({
              interestId: interest.id,
              status: 'accepted',
              userId: interest.user_id,
            })}
            onDecline={() => respondMutation.mutate({
              interestId: interest.id,
              status: 'declined',
              userId: interest.user_id,
            })}
            onMessage={() => openMessageOverlay(interest.user_id)}
          />
        ))}

        {/* Responded interests */}
        {respondedInterests.map((interest) => (
          <InterestItem
            key={interest.id}
            interest={interest}
            isProcessing={false}
            onMessage={() => openMessageOverlay(interest.user_id)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================================
// InterestItem sub-component
// ============================================================

function InterestItem({
  interest,
  isProcessing,
  onAccept,
  onDecline,
  onMessage,
}: {
  interest: OpportunityInterest;
  isProcessing: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMessage: () => void;
}) {
  const profile = interest.profile;
  const isPending = interest.status === 'pending';
  const initials = (profile?.full_name || profile?.username || 'DN')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {profile?.full_name || profile?.username || 'DNA Member'}
          </span>
          {!isPending && (
            <Badge
              variant={interest.status === 'accepted' ? 'default' : 'secondary'}
              className="text-[10px] h-5"
            >
              {interest.status === 'accepted' ? 'Accepted' : 'Declined'}
            </Badge>
          )}
        </div>
        {profile?.headline && (
          <p className="text-xs text-muted-foreground truncate">{profile.headline}</p>
        )}
        {interest.message && (
          <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{interest.message}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {new Date(interest.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isPending && onAccept && onDecline && (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onAccept}
              disabled={isProcessing}
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
              title="Accept"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDecline}
              disabled={isProcessing}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
              title="Decline"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onMessage}
          className="h-8 w-8 p-0"
          title="Message"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default InterestManager;
