import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, TrendingUp } from 'lucide-react';
import { useProfileViewers } from '@/hooks/useProfileViewers';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ProfileViewersWidgetProps {
  profileId: string;
}

/**
 * ProfileViewersWidget - Display who viewed your profile
 * 
 * Shows:
 * - List of recent profile viewers with avatar and details
 * - View count and last viewed timestamp
 * - Connection status badges
 * - Quick navigation to viewer profiles
 */
export const ProfileViewersWidget: React.FC<ProfileViewersWidgetProps> = ({ profileId }) => {
  const { data: viewers, isLoading } = useProfileViewers(profileId);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const totalViews = viewers?.reduce((sum, viewer) => sum + Number(viewer.view_count), 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Who Viewed Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!viewers || viewers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Who Viewed Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No profile views yet. Keep building your network!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Who Viewed Your Profile
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {totalViews} {totalViews === 1 ? 'view' : 'views'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {viewers.slice(0, 5).map((viewer) => (
            <div
              key={viewer.viewer_id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/dna/${viewer.viewer_username}`)}
            >
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={viewer.viewer_avatar_url} alt={viewer.viewer_full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(viewer.viewer_full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {viewer.viewer_full_name}
                    </h4>
                    {viewer.viewer_headline && (
                      <p className="text-xs text-muted-foreground truncate">
                        {viewer.viewer_headline}
                      </p>
                    )}
                  </div>
                  {viewer.is_connected && (
                    <Badge variant="outline" className="flex-shrink-0">
                      <Users className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {viewer.view_count} {viewer.view_count === 1 ? 'view' : 'views'}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(viewer.last_viewed_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {viewers.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={() => {/* TODO: Navigate to full analytics page */}}
          >
            View All {viewers.length} Viewers
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
