import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DiaProfileCardProps {
  id: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
  location?: string;
  relevance?: string; // "High match" | "Skills match" | "Location match"
  mutualConnections?: number;
  skills?: string[];
  compact?: boolean;
  onConnect?: (profileId: string) => void;
}

export function DiaProfileCard({
  id,
  full_name,
  headline,
  avatar_url,
  location,
  relevance,
  mutualConnections,
  skills = [],
  compact = false,
  onConnect
}: DiaProfileCardProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile/${id}`);
  };

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnect?.(id);
  };

  const getRelevanceColor = (rel: string) => {
    switch (rel?.toLowerCase()) {
      case 'high match':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'skills match':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'location match':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleViewProfile}
        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group w-full"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={avatar_url} alt={full_name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700">
            {full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate flex items-center gap-1">
            {full_name}
            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {headline}
          </p>
        </div>
        {relevance && (
          <Badge variant="secondary" className={cn("text-xs shrink-0", getRelevanceColor(relevance))}>
            {relevance}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header with avatar and info */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
              <AvatarImage src={avatar_url} alt={full_name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                {full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{full_name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{headline}</p>
              {location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Relevance and mutual connections */}
          <div className="flex items-center gap-2 flex-wrap">
            {relevance && (
              <Badge variant="secondary" className={cn("text-xs", getRelevanceColor(relevance))}>
                <Sparkles className="h-3 w-3 mr-1" />
                {relevance}
              </Badge>
            )}
            {mutualConnections && mutualConnections > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {mutualConnections} mutual{mutualConnections > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
              className="flex-1 h-8 text-xs"
            >
              View Profile
            </Button>
            {onConnect && (
              <Button
                size="sm"
                onClick={handleConnect}
                className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiaProfileCard;
