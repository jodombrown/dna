import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video, Globe, MoreHorizontal, Edit3, Pin, Link, Trash2, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface FeedEventCardProps {
  activity: Activity;
}

export const FeedEventCard: React.FC<FeedEventCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventData = activity.entity_data;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === activity.actor_id;

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dna/${activity.actor_username}`);
  };

  const handleViewEvent = () => {
    navigate(`/dna/convene/events/${eventData.event_slug || eventData.event_id}`);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dna/convene/events/${eventData.event_slug || eventData.event_id}`;
    navigator.clipboard.writeText(url);
    toast.success('Event link copied to clipboard');
  };

  const handleEdit = () => {
    navigate(`/dna/convene/events/${eventData.event_id}/edit`);
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventData.event_id)
        .eq('organizer_id', user.id);

      if (error) throw error;
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  // Parse event date for calendar box display
  const eventDate = eventData.start_time ? new Date(eventData.start_time) : null;
  const monthAbbrev = eventDate ? format(eventDate, 'MMM').toUpperCase() : '';
  const dayNumber = eventDate ? format(eventDate, 'd') : '';
  const dayOfWeek = eventDate ? format(eventDate, 'EEEE') : '';
  const fullDate = eventDate ? format(eventDate, 'MMMM d') : '';
  const timeRange = eventDate 
    ? `${format(eventDate, 'h:mm a')}${eventData.end_time ? ` - ${format(new Date(eventData.end_time), 'h:mm a')}` : ''}`
    : '';

  // Get location display
  const getLocationDisplay = () => {
    if (eventData.is_virtual || eventData.format === 'virtual') {
      return { icon: Video, text: 'Virtual Event', subtext: null };
    }
    if (eventData.format === 'hybrid') {
      return { icon: Globe, text: 'Hybrid Event', subtext: eventData.location || eventData.location_city };
    }
    if (eventData.location) {
      return { icon: MapPin, text: eventData.location, subtext: eventData.location_city };
    }
    if (eventData.location_city) {
      return { icon: MapPin, text: eventData.location_city, subtext: null };
    }
    return null;
  };

  const locationInfo = getLocationDisplay();
  const attendeeCount = eventData.attendee_count || 0;

  // Get format badge color
  const getFormatBadge = () => {
    const format = eventData.format || eventData.event_type;
    if (!format) return null;
    
    const formatColors: Record<string, string> = {
      virtual: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      hybrid: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      in_person: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      conference: 'bg-purple-100 text-purple-700',
      workshop: 'bg-blue-100 text-blue-700',
      meetup: 'bg-green-100 text-green-700',
      networking: 'bg-pink-100 text-pink-700',
    };
    
    return (
      <Badge variant="secondary" className={`text-xs capitalize ${formatColors[format] || ''}`}>
        {format.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
        style={{ border: '2px solid hsl(38, 92%, 50%)', borderRadius: '12px' }}
        onClick={handleViewEvent}
      >
        {/* Cover Image */}
        {eventData.cover_image_url ? (
          <div className="h-40 sm:h-48 overflow-hidden relative">
            <img
              src={eventData.cover_image_url}
              alt={eventData.event_title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="h-32 sm:h-40 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center relative">
            <Calendar className="h-16 w-16 text-white/30" />
          </div>
        )}

        <div className="p-4">
          {/* Top row: Host info + Actions */}
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleViewProfile}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={activity.actor_avatar_url} alt={activity.actor_full_name} />
                <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                  {(activity.actor_full_name || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Hosted by <span className="font-medium text-foreground">{activity.actor_full_name}</span>
              </span>
            </div>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin to profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}>
                  <Link className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete event
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Event Title - Prominent */}
          <h3 className="font-bold text-lg sm:text-xl leading-tight mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {eventData.event_title}
          </h3>

          {/* Date & Time - Luma-style calendar box */}
          {eventDate && (
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-12 text-center border border-border rounded-lg overflow-hidden bg-background">
                <div className="bg-amber-500 text-white text-[10px] font-semibold py-0.5">
                  {monthAbbrev}
                </div>
                <div className="text-lg font-bold py-1">
                  {dayNumber}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{dayOfWeek}, {fullDate}</p>
                <p className="text-sm text-muted-foreground">{timeRange}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {locationInfo && (
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-12 flex justify-center pt-0.5">
                <locationInfo.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{locationInfo.text}</p>
                {locationInfo.subtext && (
                  <p className="text-sm text-muted-foreground truncate">{locationInfo.subtext}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer: Badges + Attendees (only show if > 0) */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              {getFormatBadge()}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {/* Only show attendee count when meaningful (> 0) */}
            {attendeeCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{attendeeCount} {attendeeCount === 1 ? 'going' : 'going'}</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full mt-3 font-semibold"
            style={{ backgroundColor: 'hsl(38, 92%, 50%)', color: 'white' }}
            onClick={(e) => { e.stopPropagation(); handleViewEvent(); }}
          >
            View Event
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
