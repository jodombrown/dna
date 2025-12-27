/**
 * Connection Card - Apple News Style
 * Displays an established connection with message and management actions
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users,
  MoreHorizontal,
  MapPin,
  UserMinus,
  User,
  Share2,
  Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutualConnections } from '@/hooks/useMutualConnections';
import { useToast } from '@/hooks/use-toast';
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

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    headline?: string;
    location?: string;
    professional_role?: string;
    connected_at: string;
  };
  onConnectionRemoved?: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onConnectionRemoved,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { mutualCount, hasMutualConnections } = useMutualConnections(user?.id, connection.id);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  };

  const handleMessage = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_other_user_id: connection.id,
      });

      if (error) throw error;

      navigate('/dna/messages');
    } catch (error: any) {
      console.error('Message error:', error);
      toast({
        title: 'Error opening conversation',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveConnection = async () => {
    setIsRemoving(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) throw new Error('Not authenticated');

      const { data: connectionData, error: fetchError } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${currentUser.user.id},recipient_id.eq.${connection.id}),and(requester_id.eq.${connection.id},recipient_id.eq.${currentUser.user.id})`)
        .eq('status', 'accepted')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!connectionData) throw new Error('Connection not found');

      const { error } = await supabase.rpc('remove_connection', {
        p_connection_id: connectionData.id,
      });

      if (error) throw error;

      toast({
        title: 'Connection removed',
        description: `You are no longer connected with ${connection.full_name}.`,
      });
      
      onConnectionRemoved?.();
    } catch (error: any) {
      console.error('Remove connection error:', error);
      toast({
        title: 'Error removing connection',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
      setShowRemoveDialog(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/dna/${connection.username}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}/dna/${connection.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Link copied',
      description: 'Profile link copied to clipboard',
    });
  };

  // Build metadata string
  const getMetadataString = (): string => {
    const parts: string[] = [];
    if (connection.location) parts.push(connection.location);
    if (hasMutualConnections) parts.push(`${mutualCount} mutual${mutualCount !== 1 ? 's' : ''}`);
    return parts.join(' · ');
  };

  const metadata = getMetadataString();

  return (
    <>
      <Card 
        className="bg-card/60 backdrop-blur-sm border-border/30 overflow-hidden cursor-pointer hover:bg-card/80 transition-colors"
        onClick={handleViewProfile}
      >
        <div className="p-4">
          {/* Apple News style: Two columns - Text left, Image right */}
          <div className="flex gap-3">
            {/* Left column: Content */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Source badge - role */}
              {connection.professional_role && (
                <Badge 
                  variant="secondary" 
                  className="w-fit mb-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary border-0"
                >
                  {connection.professional_role}
                </Badge>
              )}

              {/* Headline: Name */}
              <h3 className="font-semibold text-base text-foreground leading-tight mb-1 line-clamp-2">
                {connection.full_name}
              </h3>

              {/* Subheadline: Headline */}
              <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mb-2">
                {connection.headline || 'DNA Community Member'}
              </p>

              {/* Metadata footer */}
              <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground/70">
                {connection.location && <MapPin className="h-3 w-3 shrink-0" />}
                <span className="truncate">{metadata || 'Connected'}</span>
              </div>
            </div>

            {/* Right column: Square avatar + overflow menu */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Square avatar with rounded corners */}
              <Avatar className="h-20 w-20 rounded-xl">
                <AvatarImage
                  src={connection.avatar_url || ''}
                  alt={connection.full_name}
                  className="object-cover"
                  loading="lazy"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold rounded-xl">
                  {getInitials(connection.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Overflow menu */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMessage(); }}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); setShowRemoveDialog(true); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Connection
                  </DropdownMenuItem>
                  {hasMutualConnections && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {connection.full_name} from your connections?
              You will no longer be able to message each other unless you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConnection}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove Connection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
