import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';

interface FeedSpaceCardProps {
  activity: Activity;
}

export const FeedSpaceCard: React.FC<FeedSpaceCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const spaceData = activity.entity_data;

  const handleViewProfile = () => {
    navigate(`/dna/${activity.actor_username}`);
  };

  const handleViewSpace = () => {
    // Navigate to space detail - using space_id from entity_data
    navigate(`/dna/collaborate/spaces/${spaceData.space_id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
            <Users2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
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
                  {' '}joined{' '}
                  <span 
                    className="font-semibold hover:underline cursor-pointer text-blue-600 dark:text-blue-400"
                    onClick={handleViewSpace}
                  >
                    {spaceData.space_title}
                  </span>
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
                
                {spaceData.space_description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {spaceData.space_description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewSpace}
              >
                View Space
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
