import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  Video,
  Globe,
  Users,
  Eye,
  Edit,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MutualAttendeesLine } from './MutualAttendeesLine';

export interface ConveneEventCardProps {
  event: {
    id: string;
    title: string;
    start_time?: string;
    date_time?: string;
    end_time?: string;
    location_name?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    location?: string | null;
    cover_image_url?: string | null;
    banner_url?: string | null;
    image_url?: string | null;
    event_type?: string;
    format?: string;
    is_cancelled?: boolean;
    is_virtual?: boolean;
    slug?: string | null;
    max_attendees?: number | null;
    meeting_url?: string | null;
    organizer_id?: string;
    creator_profile?: {
      id?: string;
      full_name: string;
      avatar_url?: string;
      username?: string;
    } | null;
    organizer?: {
      id?: string;
      full_name: string;
      avatar_url?: string | null;
      username?: string;
    } | null;
    // Support for legacy fields
    organizer_full_name?: string;
    organizer_avatar_url?: string | null;
    organizer_username?: string;
    is_curated?: boolean;
    curated_source?: string | null;
    curated_source_url?: string | null;
    attendee_count?: number;
    event_attendees?: Array<{ count: number }>;
    rsvp_status?: string | null;
    user_rsvp_status?: string | null;
  };
  variant?: 'full' | 'compact';
  showRsvp?: boolean;
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  onRsvp?: (status: string) => void;
  showOrganizer?: boolean;
  showActions?: boolean;
  isOrganizer?: boolean;
  onClick?: () => void;
  showMutualAttendees?: boolean;
  className?: string;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function ConveneEventCard({
  event,
  variant = 'full',
  showRsvp = false,
  rsvpStatus: rsvpStatusProp,
  onRsvp,
  showOrganizer = true,
  showActions = false,
  isOrganizer = false,
  onClick,
  showMutualAttendees = false,
  className,
}: ConveneEventCardProps) {
  const navigate = useNavigate();

  // Normalize data
  const rsvpStatus = rsvpStatusProp ?? event.rsvp_status ?? event.user_rsvp_status ?? null;
  const attendeeCount =
    event.attendee_count ?? event.event_attendees?.[0]?.count ?? 0;
  const organizerName =
    event.organizer?.full_name ?? event.creator_profile?.full_name ?? event.organizer_full_name ?? '';
  const organizerAvatar =
    event.organizer?.avatar_url ?? event.creator_profile?.avatar_url ?? event.organizer_avatar_url ?? undefined;
  const organizerUsername =
    event.organizer?.username ?? event.creator_profile?.username ?? event.organizer_username;

  // Dates
  const rawDate = event.start_time || event.date_time;
  const startDate = rawDate ? new Date(rawDate) : null;
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : '';
  const dayNumber = startDate ? format(startDate, 'd') : '';
  const isPast = startDate ? startDate < new Date() : false;

  // Location
  const getLocationInfo = () => {
    const isVirtual = event.is_virtual || event.format === 'virtual';
    const isHybrid = event.format === 'hybrid';
    if (isVirtual) return { icon: Video, text: 'Virtual Event', subtext: null };
    if (isHybrid) {
      const loc =
        event.location_city || event.location_name;
      return { icon: Globe, text: 'Hybrid Event', subtext: loc || null };
    }
    const parts = [event.location_name, event.location_city, event.location_country].filter(Boolean);
    if (parts.length === 0) return null;
    return { icon: MapPin, text: parts[0]!, subtext: parts.slice(1).join(', ') || null };
  };
  const locationInfo = getLocationInfo();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/dna/convene/events/${event.slug || event.id}`);
    }
  };

  const handleOrganizerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (organizerUsername) navigate(`/dna/${organizerUsername}`);
  };

  // ── COMPACT VARIANT ────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-module-convene',
          event.is_cancelled && 'opacity-60',
          className,
        )}
        onClick={handleClick}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Date box */}
          <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center">
            <span className="text-[10px] font-semibold text-module-convene uppercase leading-none">
              {monthAbbrev}
            </span>
            <span className="text-lg font-bold leading-none mt-0.5">
              {dayNumber}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {event.event_type && (
                <Badge variant="secondary" className="capitalize text-xs">
                  {event.event_type}
                </Badge>
              )}
              {event.format && (
                <Badge variant="outline" className="capitalize text-xs">
                  {(event.format as string).replace('_', ' ')}
                </Badge>
              )}
              {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
              {event.is_cancelled && (
                <Badge variant="destructive" className="text-xs">Cancelled</Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-1 text-foreground">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
              {startDate && <span>{format(startDate, 'MMM d, yyyy · h:mm a')}</span>}
              {locationInfo && (
                <span className="flex items-center gap-1">
                  <locationInfo.icon className="h-3 w-3" />
                  {locationInfo.text}
                </span>
              )}
            </div>

            {/* RSVP badge */}
            {rsvpStatus && (
              <Badge
                variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                className="mt-2 text-xs capitalize"
              >
                {rsvpStatus === 'going' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {rsvpStatus === 'maybe' && <HelpCircle className="h-3 w-3 mr-1" />}
                {rsvpStatus}
              </Badge>
            )}
          </div>

          {/* Actions (host mode) */}
          {showActions && (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dna/convene/events/${event.slug || event.id}`);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isOrganizer && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dna/convene/events/${event.slug || event.id}/analytics`);
                    }}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  {!isPast && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dna/convene/events/${event.slug || event.id}/edit`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Attendee count (non-action mode) */}
          {!showActions && attendeeCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Users className="h-3 w-3" />
              {attendeeCount}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // ── FULL VARIANT ───────────────────────────────────────
  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-all cursor-pointer group rounded-xl border-l-4 border-l-module-convene',
        event.is_cancelled && 'opacity-60',
        className,
      )}
      onClick={handleClick}
    >
      {/* Cover Image */}
      {(event.cover_image_url || event.banner_url || event.image_url) ? (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={event.cover_image_url || event.banner_url || event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gradient-to-br from-module-convene/60 via-module-convene to-module-convene-dark/80 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-white/20" />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Status badges */}
        {event.is_cancelled && (
          <Badge variant="destructive" className="self-start mb-2">Cancelled</Badge>
        )}

        {/* Title */}
        <h3 className="font-bold text-xl leading-tight mb-3 line-clamp-2 text-foreground group-hover:text-module-convene transition-colors">
          {event.title}
        </h3>

        {/* Organizer or Curated Badge */}
        {event.is_curated ? (
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="h-3 w-3 mr-1" />
              Curated by DNA
            </Badge>
          </div>
        ) : showOrganizer && organizerName ? (
          <button
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity text-left"
            onClick={handleOrganizerClick}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={organizerAvatar} alt={organizerName} />
              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                {getInitials(organizerName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
              {organizerName}
            </span>
          </button>
        ) : null}

        {/* Date & Time */}
        {startDate && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold text-module-convene uppercase leading-none">
                {monthAbbrev}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">
                {dayNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">
                {format(startDate, 'EEEE')}, {format(startDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(startDate, 'h:mm a')}
                {endDate ? ` – ${format(endDate, 'h:mm a')}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {locationInfo && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex items-center justify-center">
              <locationInfo.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{locationInfo.text}</p>
              {locationInfo.subtext && (
                <p className="text-sm text-muted-foreground truncate">{locationInfo.subtext}</p>
              )}
            </div>
          </div>
        )}

        {/* Mutual Attendees */}
        {showMutualAttendees && <MutualAttendeesLine eventId={event.id} />}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          {attendeeCount > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {attendeeCount} going
                {event.max_attendees && attendeeCount >= event.max_attendees && (
                  <Badge variant="secondary" className="ml-2 text-xs">Full</Badge>
                )}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Be the first to register</span>
          )}

          {/* RSVP status or action */}
          {rsvpStatus === 'going' ? (
            <Badge className="bg-module-convene hover:bg-module-convene-dark">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Going
            </Badge>
          ) : rsvpStatus === 'maybe' ? (
            <Badge variant="outline">
              <HelpCircle className="h-3 w-3 mr-1" />
              Maybe
            </Badge>
          ) : showRsvp && onRsvp ? (
            <Button
              size="sm"
              className="bg-module-convene hover:bg-module-convene-dark text-white"
              onClick={(e) => {
                e.stopPropagation();
                onRsvp('going');
              }}
            >
              RSVP
            </Button>
          ) : showActions && isOrganizer ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dna/convene/events/${event.slug || event.id}/edit`);
              }}
            >
              Manage
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default ConveneEventCard;
