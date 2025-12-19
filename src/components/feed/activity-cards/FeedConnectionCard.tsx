import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';

interface FeedConnectionCardProps {
  activity: Activity;
}

export const FeedConnectionCard: React.FC<FeedConnectionCardProps> = ({ activity }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/dna/${activity.actor_username}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-full">
            <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                  {' '}is now connected with you
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
                
                {activity.metadata.message && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{activity.metadata.message}"
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
