import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ChevronDown, ChevronUp, Loader2, Building2, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface PartyRoleCategory {
  value: string;
  label: string;
}

// BD423 role vocabulary for this pane. `all` narrows nothing; every other
// value is both a filter and, when active, the role a new party is added
// under (event_engagement_roles.role has no DB check constraint, so this
// list is the actual source of truth for what's offered here).
export const PARTY_ROLE_CATEGORIES: PartyRoleCategory[] = [
  { value: 'all', label: 'All' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'partner', label: 'Partner' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'exhibitor', label: 'Exhibitor' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'team_member', label: 'Team member' },
];

// Volunteers and team members are individuals; the rest default to
// organizations. Keeps the add flow to a single field instead of a type picker.
const PERSON_ROLES = new Set(['volunteer', 'team_member']);

interface PartyRow {
  id: string;
  name: string;
  type: string;
  linked_profile_id: string | null;
}

interface EngagementRow {
  id: string;
  party_id: string;
  parties: PartyRow | null;
  event_engagement_roles: { id: string; role: string }[];
}

interface PartyRoleListProps {
  eventId: string;
  activeCategory: string;
  onCategoryChange: (value: string) => void;
}

export function PartyRoleList({
  eventId,
  activeCategory,
  onCategoryChange,
}: PartyRoleListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPartyId = searchParams.get('party');
  const [query, setQuery] = useState('');

  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['event-engagements', eventId, activeCategory],
    queryFn: async () => {
      let q = supabase
        .from('event_engagements')
        .select('id, party_id, parties(id, name, type, linked_profile_id), event_engagement_roles!inner(id, role)')
        .eq('event_id', eventId);
      if (activeCategory !== 'all') {
        q = q.eq('event_engagement_roles.role', activeCategory);
      }
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as EngagementRow[];
    },
    enabled: !!eventId,
  });

  const filtered = engagements.filter((row) => {
    if (!query.trim()) return true;
    return row.parties?.name.toLowerCase().includes(query.trim().toLowerCase());
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ['party-search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('id, name, type')
        .ilike('name', `%${query.trim()}%`)
        .limit(5);
      if (error) throw error;
      return (data ?? []) as PartyRow[];
    },
    enabled: query.trim().length >= 2,
  });

  const linkedPartyIds = new Set(engagements.map((row) => row.party_id));
  const unlinkedSuggestions = suggestions.filter((party) => !linkedPartyIds.has(party.id));

  const addMutation = useMutation({
    mutationFn: async (input: { partyId?: string; name?: string }) => {
      if (activeCategory === 'all') {
        throw new Error('Select a category to add someone in that role');
      }
      let resolvedPartyId = input.partyId;
      if (!resolvedPartyId) {
        const { data: newParty, error: partyErr } = await supabase
          .from('parties')
          .insert({
            name: input.name!.trim(),
            type: PERSON_ROLES.has(activeCategory) ? 'person' : 'organization',
          })
          .select('id')
          .single();
        if (partyErr) throw partyErr;
        resolvedPartyId = newParty.id;
      }

      const { data: engagement, error: engagementErr } = await supabase
        .from('event_engagements')
        .upsert({ event_id: eventId, party_id: resolvedPartyId }, { onConflict: 'event_id,party_id' })
        .select('id')
        .single();
      if (engagementErr) throw engagementErr;

      const { error: roleErr } = await supabase
        .from('event_engagement_roles')
        .upsert({ engagement_id: engagement.id, role: activeCategory }, { onConflict: 'engagement_id,role' });
      if (roleErr) throw roleErr;

      return resolvedPartyId;
    },
    onSuccess: (partyId) => {
      queryClient.invalidateQueries({ queryKey: ['event-engagements', eventId] });
      setQuery('');
      selectParty(partyId);
      toast({ title: 'Added', description: 'Added to the party list.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message || 'Failed to add.', variant: 'destructive' });
    },
  });

  const selectParty = (partyId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.get('party') === partyId) {
        next.delete('party');
      } else {
        next.set('party', partyId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {PARTY_ROLE_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.value;
          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-body font-medium whitespace-nowrap transition-all shrink-0',
                'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-[hsl(var(--module-convene))] text-white border-[hsl(var(--module-convene))] shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-[hsl(var(--module-convene)/0.4)] hover:bg-[hsl(var(--module-convene)/0.06)]',
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or add a person or organization"
            className="pl-9"
          />
        </div>

        {query.trim().length >= 2 && (
          <div className="mt-2 border border-border rounded-lg divide-y divide-border overflow-hidden">
            {unlinkedSuggestions.map((party) => (
              <button
                key={party.id}
                onClick={() => addMutation.mutate({ partyId: party.id })}
                disabled={activeCategory === 'all' || addMutation.isPending}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {party.type === 'organization' ? (
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-body">{party.name}</span>
                <span className="text-meta text-muted-foreground ml-auto">Link existing</span>
              </button>
            ))}
            <button
              onClick={() => addMutation.mutate({ name: query })}
              disabled={activeCategory === 'all' || addMutation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-body">Add "{query}"</span>
            </button>
          </div>
        )}

        {query.trim().length >= 2 && activeCategory === 'all' && (
          <p className="text-meta text-muted-foreground mt-1.5">
            Select a category above to add someone in that role.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-body text-muted-foreground py-8 text-center">
          No one here yet.
        </p>
      ) : (
        <ul className="border border-border rounded-lg divide-y divide-border">
          {filtered.map((row) => {
            const party = row.parties;
            if (!party) return null;
            const isSelected = selectedPartyId === party.id;
            return (
              <li key={row.id}>
                <button
                  onClick={() => selectParty(party.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    isSelected ? 'bg-muted/60' : 'hover:bg-muted/30',
                  )}
                >
                  {party.type === 'organization' ? (
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-body font-medium">{party.name}</span>
                  <div className="flex gap-1.5 ml-auto shrink-0">
                    {row.event_engagement_roles.map((r) => (
                      <Badge key={r.id} variant="outline" className="text-meta">
                        {PARTY_ROLE_CATEGORIES.find((c) => c.value === r.role)?.label ?? r.role}
                      </Badge>
                    ))}
                  </div>
                </button>
                {isSelected && <PartyDetailPanel partyId={party.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface CrossEventRow {
  id: string;
  event_id: string;
  events: { id: string; title: string; slug: string | null; start_time: string | null } | null;
  event_engagement_roles: { role: string }[];
}

function PartyDetailPanel({ partyId }: { partyId: string }) {
  const [expanded, setExpanded] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['party-history', partyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_engagements')
        .select('id, event_id, events(id, title, slug, start_time), event_engagement_roles(role)')
        .eq('party_id', partyId);
      if (error) throw error;
      return (data ?? []) as unknown as CrossEventRow[];
    },
  });

  return (
    <div className="px-4 pb-3 bg-muted/20">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-meta text-muted-foreground hover:text-foreground"
        disabled={isLoading}
      >
        <span>{history.length} event{history.length === 1 ? '' : 's'} across DNA</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1.5">
          {history.map((row) => (
            <li key={row.id} className="flex items-center gap-2 text-body">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{row.events?.title ?? 'Untitled event'}</span>
              {row.events?.start_time && (
                <span className="text-meta text-muted-foreground">
                  {format(new Date(row.events.start_time), 'MMM d, yyyy')}
                </span>
              )}
              <span className="text-meta text-muted-foreground ml-auto">
                {row.event_engagement_roles.map((r) => r.role).join(', ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
