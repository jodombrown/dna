import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video, MoreHorizontal, Edit3, Pin, Link, Trash2, Loader2 } from 'lucide-react';
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

  const handleViewProfile = () => {
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

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow overflow-hidden"
        style={{ border: '2px solid hsl(38, 92%, 50%)', borderRadius: '12px' }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={handleViewProfile}>
                    <AvatarImage src={activity.actor_avatar_url} alt={activity.actor_full_name} />
                    <AvatarFallback>
                      {(activity.actor_full_name || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="text-sm">
                      <span 
                        className="font-semibold hover:underline cursor-pointer"
                        onClick={handleViewProfile}
                      >
                        {activity.actor_full_name}
                      </span>
                      {' '}created a new event
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isOwner && (
                      <>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit event
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pin className="mr-2 h-4 w-4" />
                          Pin to profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Link className="mr-2 h-4 w-4" />
                      Copy link
                    </DropdownMenuItem>
                    {isOwner && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setShowDeleteDialog(true)}
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
              
              {/* Event Details */}
              <div 
                className="bg-muted/50 rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={handleViewEvent}
              >
                <h4 className="font-semibold text-base">{eventData.event_title}</h4>
                
                {eventData.event_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {eventData.event_description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {eventData.start_time && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(eventData.start_time), 'MMM dd, yyyy • h:mm a')}
                    </div>
                  )}
                  
                  {eventData.is_virtual ? (
                    <Badge variant="secondary" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Virtual
                    </Badge>
                  ) : eventData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {eventData.location}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={handleViewEvent}
                  style={{ backgroundColor: 'hsl(38, 92%, 50%)', color: 'white' }}
                >
                  RSVP Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
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
