import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';

interface FeedContributionCardProps {
  activity: Activity;
}

export const FeedContributionCard: React.FC<FeedContributionCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const needData = activity.entity_data;

  const handleViewProfile = () => {
    navigate(`/dna/${activity.actor_username}`);
  };

  const handleViewContribution = () => {
    // Navigate to space's contribute section with the need highlighted
    navigate(`/dna/collaborate/spaces/${needData.space_id}?tab=contribute&need=${needData.need_id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-full">
            <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
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
                  {' '}posted a new contribution need
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Contribution Need Details */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-base flex-1">{needData.need_title}</h4>
                <Badge variant={getPriorityColor(needData.priority)} className="text-xs">
                  {needData.priority}
                </Badge>
              </div>
              
              {needData.need_description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {needData.need_description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  {needData.need_type}
                </Badge>
                {activity.metadata.status && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.metadata.status}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleViewContribution}
              >
                <Heart className="h-3 w-3 mr-1" />
                Support This
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
