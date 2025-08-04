import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Post } from './PostList';

interface SharedPostPreviewProps {
  sharedPost: Post;
}

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'connect': return 'bg-dna-emerald text-white';
    case 'collaborate': return 'bg-dna-copper text-white';
    case 'contribute': return 'bg-dna-gold text-black';
    default: return 'bg-dna-forest text-white';
  }
};

const getPillarLabel = (pillar: string) => {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const SharedPostPreview: React.FC<SharedPostPreviewProps> = ({ sharedPost }) => {
  return (
    <Card className="bg-muted/50 border-2 border-muted p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={sharedPost.profiles.avatar_url} 
            alt={`${sharedPost.profiles.full_name}'s profile picture`}
          />
          <AvatarFallback className="bg-dna-forest text-white text-xs">
            {getInitials(sharedPost.profiles.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-sm text-foreground truncate">
              {sharedPost.profiles.full_name}
            </h5>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getPillarColor(sharedPost.pillar)}`}
            >
              {getPillarLabel(sharedPost.pillar)}
            </Badge>
          </div>
          
          {sharedPost.profiles.professional_role && (
            <p className="text-xs text-muted-foreground truncate">
              {sharedPost.profiles.professional_role}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">
          {sharedPost.content}
        </p>

        {sharedPost.media_url && (
          <div className="rounded-md overflow-hidden border">
            <img 
              src={sharedPost.media_url} 
              alt="Shared post media" 
              className="w-full h-auto max-h-48 object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  );
};