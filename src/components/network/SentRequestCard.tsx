/**
 * Sent Connection Request Card - Apple News Style
 * Displays connection requests that the user has sent with option to withdraw
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  XCircle, 
  Loader2,
  MapPin,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SentRequestCardProps {
  request: {
    connection_id: string;
    recipient_id: string;
    recipient_username?: string;
    recipient_name: string;
    recipient_avatar?: string | null;
    recipient_headline?: string | null;
    recipient_location?: string | null;
    recipient_profession?: string | null;
    created_at: string;
  };
  onWithdraw: () => void;
}

export const SentRequestCard: React.FC<SentRequestCardProps> = ({
  request,
  onWithdraw,
}) => {
  const navigate = useNavigate();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  };

  const timeAgo = formatDistanceToNow(new Date(request.created_at), {
    addSuffix: false,
  });

  const handleWithdraw = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWithdrawing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', request.connection_id)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('Connection request withdrawn');
      onWithdraw();
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/dna/${request.recipient_username || request.recipient_id}`);
  };

  // Build metadata string
  const getMetadataString = (): string => {
    const parts: string[] = [];
    parts.push(timeAgo);
    if (request.recipient_location) parts.push(request.recipient_location);
    return parts.join(' · ');
  };

  const metadata = getMetadataString();

  return (
    <Card 
      className="bg-card/60 backdrop-blur-sm border-border/30 overflow-hidden cursor-pointer hover:bg-card/80 transition-colors"
      onClick={handleViewProfile}
    >
      <div className="p-4">
        {/* Apple News style: Two columns - Text left, Image right */}
        <div className="flex gap-3">
          {/* Left column: Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Status badge */}
            <Badge 
              variant="outline" 
              className="w-fit mb-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            >
              Pending
            </Badge>

            {/* Headline: Name */}
            <h3 className="font-semibold text-base text-foreground leading-tight mb-1 line-clamp-2">
              {request.recipient_name}
            </h3>

            {/* Subheadline: Role/Profession */}
            <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mb-2">
              {request.recipient_headline || request.recipient_profession || 'DNA Community Member'}
            </p>

            {/* Metadata footer */}
            <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{metadata}</span>
            </div>
          </div>

          {/* Right column: Square avatar + overflow menu */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Square avatar with rounded corners */}
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage
                src={request.recipient_avatar || ''}
                alt={request.recipient_name}
                className="object-cover"
                loading="lazy"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold rounded-xl">
                {getInitials(request.recipient_name)}
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
                <DropdownMenuItem 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="text-destructive focus:text-destructive"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Withdraw Request
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};
