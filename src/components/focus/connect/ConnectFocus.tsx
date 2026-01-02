/**
 * ConnectFocus - Focus Mode Content for Connect Module
 *
 * Displays actionable Connect content including:
 * - Pending connection requests with accept/decline actions
 * - Connection suggestions with connect action
 * - Recent network activity
 * - Zero state for new users
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Check, X, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useConnectFocusData, type PendingRequest, type ConnectionSuggestion } from '@/hooks/useConnectFocusData';
import { connectionService } from '@/services/connectionService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function PendingRequestCard({ request, onAccept, onDecline }: {
  request: PendingRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const initials = request.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarImage src={request.avatarUrl || undefined} alt={request.fullName} />
        <AvatarFallback className="bg-dna-terra/20 text-dna-terra text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-neutral-900 truncate">
          {request.fullName}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {request.location || request.headline || 'Wants to connect'}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onAccept}
          className="p-1.5 rounded-full bg-dna-emerald text-white hover:bg-dna-emerald/90 transition-colors"
          aria-label="Accept connection request"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onDecline}
          className="p-1.5 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition-colors"
          aria-label="Decline connection request"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion, onConnect }: {
  suggestion: ConnectionSuggestion;
  onConnect: () => void;
}) {
  const initials = suggestion.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3 border border-neutral-100 rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarImage src={suggestion.avatarUrl || undefined} alt={suggestion.fullName} />
        <AvatarFallback className="bg-dna-sunset/20 text-dna-sunset text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-neutral-900 truncate">
          {suggestion.fullName}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {suggestion.headline || suggestion.location || 'DNA Member'}
        </p>
        {suggestion.mutualConnectionsCount > 0 && (
          <p className="text-xs text-dna-emerald mt-0.5">
            {suggestion.mutualConnectionsCount} mutual connection{suggestion.mutualConnectionsCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onConnect}
        className="shrink-0 text-xs"
      >
        <UserPlus className="w-3 h-3 mr-1" />
        Connect
      </Button>
    </div>
  );
}

function ZeroState() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dna-terra/10 flex items-center justify-center">
        <Users className="w-8 h-8 text-dna-terra" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">Your network awaits</h3>
      <p className="text-sm text-neutral-500 mb-4">
        The diaspora is 200M+ strong. Let's find your people.
      </p>
      <Link to="/dna/connect/discover">
        <Button className="bg-dna-emerald hover:bg-dna-emerald/90">
          Discover People
        </Button>
      </Link>
    </div>
  );
}

export function ConnectFocus() {
  const {
    pendingRequests,
    suggestions,
    isLoading,
    pendingCount,
    suggestionCount,
    refetch,
  } = useConnectFocusData();

  const queryClient = useQueryClient();

  const handleAccept = async (connectionId: string) => {
    try {
      await connectionService.acceptConnectionRequest(connectionId);
      toast.success('Connection accepted!');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['pulse-bar'] });
    } catch (error) {
      toast.error('Failed to accept connection');
    }
  };

  const handleDecline = async (connectionId: string) => {
    try {
      await connectionService.rejectConnectionRequest(connectionId);
      toast.success('Connection declined');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['pulse-bar'] });
    } catch (error) {
      toast.error('Failed to decline connection');
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await connectionService.sendConnectionRequest(userId);
      toast.success('Connection request sent!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send connection request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-dna-emerald" />
      </div>
    );
  }

  // Zero state if no pending requests and no suggestions
  if (pendingCount === 0 && suggestionCount === 0) {
    return <ZeroState />;
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Pending Requests ({pendingCount})
            </h3>
            {pendingCount > 3 && (
              <Link
                to="/dna/connect/network"
                className="text-xs text-dna-emerald hover:underline"
              >
                View All
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {pendingRequests.slice(0, 3).map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onAccept={() => handleAccept(request.id)}
                onDecline={() => handleDecline(request.id)}
              />
            ))}
          </div>
          {pendingCount > 1 && (
            <Button
              variant="outline"
              className="w-full mt-3 text-sm"
              onClick={async () => {
                try {
                  await Promise.all(
                    pendingRequests.map(r => connectionService.acceptConnectionRequest(r.id))
                  );
                  toast.success(`Accepted ${pendingCount} connections!`);
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ['pulse-bar'] });
                } catch {
                  toast.error('Failed to accept all');
                }
              }}
            >
              Accept All
            </Button>
          )}
        </section>
      )}

      {/* Suggestions */}
      {suggestionCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              People You May Know ({suggestionCount})
            </h3>
            <Link
              to="/dna/connect/discover"
              className="text-xs text-dna-emerald hover:underline"
            >
              See More
            </Link>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.userId}
                suggestion={suggestion}
                onConnect={() => handleConnect(suggestion.userId)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ConnectFocus;
