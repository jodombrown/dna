import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Share2, Globe, Users, PieChart as PieChartIcon, Code2, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEventManagement } from '../EventManagementContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { config, getEventUrl } from '@/lib/config';

interface ConnectionProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AttributionRow {
  source: string;
  count: number;
  pct: number;
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  referral: 'Referral',
  share_link: 'Share Link',
  embed: 'Embed',
  api: 'API',
  import: 'Import',
  'walk-up': 'Walk-up',
};

const PromotionPanel: React.FC = () => {
  const { event } = useEventManagement();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const eventUrl = getEventUrl(event.slug || event.id);
  const ogImage = event.cover_image_url || `${config.APP_URL}/og-image.png`;
  const description = (event as { short_description?: string }).short_description || event.description || '';

  // Network share: connections not yet on the guest list for this event
  const { data: suggestions, isFetched: suggestionsFetched } = useQuery({
    queryKey: ['promotion-network-share', event.id, user?.id],
    queryFn: async (): Promise<ConnectionProfile[]> => {
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .eq('status', 'accepted')
        .limit(100);

      if (!connections || connections.length === 0) return [];

      const connectionIds = connections.map(c =>
        c.requester_id === user!.id ? c.recipient_id : c.requester_id
      );

      const { data: existingAttendees } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', event.id)
        .in('user_id', connectionIds);

      const alreadyInvited = new Set((existingAttendees || []).map(a => a.user_id));
      const candidateIds = connectionIds.filter(id => !alreadyInvited.has(id));

      if (candidateIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', candidateIds.slice(0, 20));

      return (profiles || []).slice(0, 6);
    },
    enabled: !!event.id && !!user?.id,
  });

  // Attribution: where registrations came from
  const { data: attribution = [], isFetched: attributionFetched } = useQuery({
    queryKey: ['promotion-attribution', event.id],
    queryFn: async (): Promise<AttributionRow[]> => {
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('source, status')
        .eq('event_id', event.id)
        .in('status', ['going', 'maybe', 'pending', 'waitlist']);

      const counts: Record<string, number> = {};
      (attendees || []).forEach(a => {
        const source = a.source || 'direct';
        counts[source] = (counts[source] || 0) + 1;
      });

      const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
      return Object.entries(counts)
        .map(([source, count]) => ({
          source,
          count,
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: !!event.id,
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(eventUrl);
    toast({ title: 'Link Copied', description: 'Event link copied to clipboard' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-h1">Promotion</h1>
        <p className="text-muted-foreground">Share this event and see how people are finding it</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OG Card Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Link Preview
            </CardTitle>
            <CardDescription>How this event appears when shared elsewhere</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border overflow-hidden bg-background">
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={ogImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-micro text-muted-foreground uppercase truncate">
                  {new URL(config.APP_URL).hostname}
                </p>
                <p className="font-semibold truncate">{event.title}</p>
                {description && (
                  <p className="text-body text-muted-foreground line-clamp-2">{description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dna/convene/events/${event.id}/edit`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Edit Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Share */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Network Share
            </CardTitle>
            <CardDescription>Connections who aren't on the guest list yet</CardDescription>
          </CardHeader>
          <CardContent>
            {!suggestionsFetched ? null : suggestions && suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback>{(profile.full_name || profile.username || '?')[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-body font-medium truncate">{profile.full_name || profile.username}</p>
                        {profile.username && (
                          <p className="text-meta text-muted-foreground truncate">@{profile.username}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body text-muted-foreground py-4 text-center">
                No suggestions right now
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Attribution
          </CardTitle>
          <CardDescription>Where registrations are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {!attributionFetched ? null : attribution.length === 0 ? (
            <p className="text-body text-muted-foreground py-4 text-center">No registrations yet</p>
          ) : (
            <div className="space-y-3">
              {attribution.map(row => (
                <div key={row.source} className="space-y-1">
                  <div className="flex items-center justify-between text-body">
                    <span className="font-medium">{SOURCE_LABELS[row.source] || row.source}</span>
                    <span className="text-muted-foreground">{row.count} · {row.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embeddable Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Embeddable Widget
            <Badge variant="outline" className="ml-2">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Embed this event's card on another site. Widget generation lands in a follow-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" disabled>
            <Code2 className="h-4 w-4 mr-2" />
            Generate Embed Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionPanel;
