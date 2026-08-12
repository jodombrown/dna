import { useParams, useNavigate, useSearchParams, Navigate, Outlet } from 'react-router-dom';
import { CuratedEventPreview } from '@/pages/dna/convene/CuratedEventPreview';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, LayoutDashboard, Users, QrCode, Mail, BarChart3, UserCog, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ConveneShell } from '@/components/convene/ConveneShell';
import { SectionNav, type SectionNavItem } from '@/components/shell/SectionNav';
import { EventManagementContext } from '@/components/convene/management/EventManagementContext';
import EventOverview from '@/components/convene/EventOverview';
import { EventDetailLoading, EventDetailNotFound } from '@/components/convene/EventDetailStates';
import type { Event as ConveneEvent } from '@/types/eventTypes';

// Edit is deliberately absent — it's a header action, not a pane.
export const EVENT_MANAGE_NAV: SectionNavItem[] = [
  { label: 'Overview', path: '', icon: LayoutDashboard, roles: ['owner', 'co-host', 'manager', 'promoter'] },
  { label: 'Attendees', path: 'attendees', icon: Users, roles: ['owner', 'co-host', 'manager'] },
  { label: 'Check-In', path: 'check-in', icon: QrCode, roles: ['owner', 'co-host', 'manager', 'check-in'] },
  { label: 'Relationships', path: 'communications', icon: Mail, roles: ['owner', 'co-host', 'manager'] },
  { label: 'Promotion', path: 'promotion', icon: Share2, roles: ['owner', 'co-host', 'manager', 'promoter'] },
  { label: 'Team', path: 'team', icon: UserCog, roles: ['owner', 'co-host'] },
  { label: 'Analytics', path: 'analytics', icon: BarChart3, roles: ['owner', 'co-host', 'manager', 'promoter'] },
];

interface EventDetailProps {
  /** When supplied, used INSTEAD of the :id route param — the hosted caller
   *  (Browse's `related` slot) has no nested route to read it from. */
  eventId?: string;
  /** True when rendered inside another page's layout (e.g. AppShell's
   *  `related` slot) rather than as this route's own standalone page. Skips
   *  every ConveneShell wrap and the Outlet-based nested routing, since a
   *  hosted instance has neither its own shell nor a matched child route. */
  hosted?: boolean;
}

const EventDetail = ({ eventId: eventIdProp, hosted = false }: EventDetailProps = {}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const slugOrId = eventIdProp ?? paramId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Hosted mode has no shell of its own to supply a back affordance, so the
  // close control lives here: it unwinds exactly the `?event=` selection
  // Browse wrote, leaving every other filter on the URL untouched. Standalone
  // keeps today's plain history-back, unchanged.
  const handleBack = () => {
    if (hosted) {
      const next = new URLSearchParams(searchParams);
      next.delete('event');
      const qs = next.toString();
      navigate(qs ? `/dna/convene?${qs}` : '/dna/convene');
    } else {
      navigate(-1);
    }
  };

  const isLoggedIn = !!user;

  // Check if param is UUID or slug
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // Fetch event details.
  //  • signed OUT → the public projection (SECURITY DEFINER, granted to anon):
  //    organizer name/avatar, going_count, place with state — and DELIBERATELY
  //    no meeting_url, agenda, or organizer_id.
  //  • signed IN  → the table read; RLS returns the viewer's full entitlement
  //    (meeting_url, agenda and manage controls follow from it).
  const { data: eventData, isLoading, refetch: refetchEvent } = useQuery({
    queryKey: ['event-detail', slugOrId, isLoggedIn],
    queryFn: async () => {
      if (!isLoggedIn) {
        const { data, error } = await supabase.rpc('get_public_event', {
          p_slug_or_id: slugOrId!,
        });
        if (error) throw error;
        const row = data?.[0];
        if (!row) return null;

        if (slugOrId && isUUID(slugOrId) && row.slug) {
          navigate(`/dna/convene/events/${row.slug}`, { replace: true });
        }

        return {
          ...row,
          // The projection hands back flat organizer_* fields; the organizer
          // card wants an object. No organizer_id is exposed to strangers.
          organizer: row.organizer_name
            ? {
                id: '',
                username: row.organizer_username,
                full_name: row.organizer_name,
                avatar_url: row.organizer_avatar_url,
                headline: null,
              }
            : null,
          group: null,
        };
      }

      let event = null;

      if (slugOrId && isUUID(slugOrId)) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', slugOrId)
          .maybeSingle();
        if (!error) event = data;
      }

      if (!event && slugOrId) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slugOrId)
          .maybeSingle();
        if (!error) event = data;
      }

      if (!event) return null;

      if (slugOrId && isUUID(slugOrId) && event.slug) {
        navigate(`/dna/convene/events/${event.slug}`, { replace: true });
      }

      const eventRow: Record<string, unknown> = event;

      // Fetch organizer profile
      const { data: organizer } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, headline')
        .eq('id', event.organizer_id)
        .maybeSingle();

      // Fetch group info if event is group-hosted
      let group = null;
      if (event.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name, slug, description, avatar_url, member_count')
          .eq('id', event.group_id)
          .maybeSingle();
        group = groupData;
      }

      return {
        ...eventRow,
        organizer,
        group
      };
    },
    enabled: !!slugOrId,
  });

  const event = eventData as Record<string, unknown> | null;

  // The event's UUID, derived straight from the fetched row — never guessed
  // from the URL param (which may be a slug) and never staged through state,
  // so a cached load can't race ahead of it.
  const eventId = (event?.id as string | undefined) ?? null;

  // Guard against undefined === undefined: a signed-out visitor has no user
  // and the projection carries no organizer_id, so both sides would be
  // undefined and wrongly read as "organizer". This is the ONLY isOrganizer
  // determination in the merged page — every pane reads it from context.
  const isOrganizer = !!user && !!event && user.id === event.organizer_id;

  // Role-gating within the six panes (who sees Team, who sees Analytics)
  // needs the event_roles lookup; the owner short-circuit avoids the query
  // entirely for the common case.
  const { data: userRole = 'none' } = useQuery({
    queryKey: ['event-role', eventId, user?.id],
    queryFn: async () => {
      if (!user || !event) return 'none';
      if (isOrganizer) return 'owner';
      const { data: roleData } = await supabase
        .from('event_roles')
        .select('role')
        .eq('event_id', eventId!)
        .eq('user_id', user.id)
        .maybeSingle();
      return roleData?.role || 'none';
    },
    enabled: !!user && !!event,
  });

  // Never redirect on an unresolved session: `loading` is true during the
  // initial session check, so `user` is null for a signed-in visitor on any
  // cold load or hard refresh. A bare `!user` redirect here would bounce
  // organizers to the public view — with replace, permanently. Wait it out
  // behind a neutral loader (no shell: the viewer is not yet known to be a
  // member, so no in-app chrome may flash).
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Signed out (session resolved) → the public event page, which carries
  // PublicSiteHeader instead of in-app chrome. Redirect on the route param,
  // NOT on the fetched-row eventId (null until the query lands, and may be a
  // slug anyway): /event/:slugOrId resolves either form via get_public_event.
  if (!user) {
    return <Navigate to={`/event/${slugOrId}`} replace />;
  }

  if (isLoading) {
    if (hosted) return <EventDetailLoading onBack={handleBack} />;
    return (
      <ConveneShell tabs={null}>
        <div className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <EventDetailLoading onBack={handleBack} />
          </div>
        </div>
      </ConveneShell>
    );
  }

  if (!event) {
    const onBrowse = () => navigate('/dna/convene');
    if (hosted) return <EventDetailNotFound onBack={handleBack} onBrowse={onBrowse} />;
    return (
      <ConveneShell tabs={null}>
        <div className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <EventDetailNotFound onBack={handleBack} onBrowse={onBrowse} />
          </div>
        </div>
      </ConveneShell>
    );
  }

  // ── Curated event → render lightweight preview ──
  if (event.is_curated) {
    if (hosted) return <CuratedEventPreview event={event} />;
    return (
      <ConveneShell tabs={null}>
        <div className="min-h-screen bg-background">
          <CuratedEventPreview event={event} />
        </div>
      </ConveneShell>
    );
  }

  const mainContent = (
    <EventManagementContext.Provider
      value={{
        event: event as unknown as ConveneEvent,
        userRole,
        isOrganizer,
        refetchEvent: () => { refetchEvent(); },
      }}
    >
      {hosted ? (
        <div className="space-y-3">
          <button onClick={handleBack} className="inline-flex items-center text-meta text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Close
          </button>
          <EventOverview eventId={eventId ?? undefined} hosted />
        </div>
      ) : (
        <Outlet />
      )}
    </EventManagementContext.Provider>
  );

  return hosted ? (
    mainContent
  ) : (
    <ConveneShell
      showBottomNav={false}
      tabs={isOrganizer ? <SectionNav items={EVENT_MANAGE_NAV} userRole={userRole} /> : null}
    >
      {mainContent}
    </ConveneShell>
  );
};

export default EventDetail;
