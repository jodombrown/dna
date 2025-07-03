
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle,
  Share,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/CleanAuthContext';
import FollowButton from '@/components/FollowButton';
import BookmarkButton from '@/components/BookmarkButton';
import EventCard from './EventCard';
import InitiativeCard from './InitiativeCard';
import OpportunityCard from './OpportunityCard';
import { RichContentItem as RichContentType } from '@/hooks/useRichContent';

interface RichContentItemProps {
  item: RichContentType;
}

const RichContentItem: React.FC<RichContentItemProps> = ({ item }) => {
  const { user } = useAuth();

  const getTargetType = (): 'post' | 'event' | 'opportunity' => {
    if (item.type === 'event') return 'event';
    if (item.type === 'opportunity') return 'opportunity';
    return 'post'; // Default fallback, though initiatives might need different handling
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Author header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={item.author?.avatar_url} alt={item.author?.full_name} />
              <AvatarFallback className="bg-dna-mint text-dna-forest">
                {item.author?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {item.author?.full_name || 'Community Member'}
                </p>
                {item.created_by && item.created_by !== user?.id && (
                  <FollowButton 
                    targetType="user" 
                    targetId={item.created_by} 
                    size="sm" 
                    variant="ghost"
                    showCount={false}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {item.author?.professional_role && `${item.author.professional_role} • `}
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BookmarkButton 
              targetType={getTargetType()} 
              targetId={item.id} 
            />
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Rich content card */}
        <div className="mb-4">
          {item.type === 'event' && (
            <EventCard event={item.data} showInFeed={true} />
          )}
          {item.type === 'initiative' && (
            <InitiativeCard initiative={item.data} showInFeed={true} />
          )}
          {item.type === 'opportunity' && (
            <OpportunityCard opportunity={item.data} showInFeed={true} />
          )}
        </div>

        {/* Interaction buttons */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-sm">0</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">0</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 transition-colors">
            <Share className="w-4 h-4 mr-1" />
            <span className="text-sm">0</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RichContentItem;
