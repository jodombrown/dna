import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Briefcase, BookOpen } from 'lucide-react';
import { ProfileV2Activity as ActivityType, ProfileV2Visibility } from '@/types/profileV2';

interface ProfileV2ActivityProps {
  activity: ActivityType;
  visibility: ProfileV2Visibility;
  isOwner: boolean;
}

const ProfileV2Activity: React.FC<ProfileV2ActivityProps> = ({
  activity,
  visibility,
  isOwner,
}) => {
  if (visibility.activity === 'hidden' && !isOwner) {
    return null;
  }

  const hasActivity = activity.spaces.length > 0 || activity.events.length > 0 || activity.connections_count > 0;

  if (!hasActivity && !isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          DNA Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connections */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">Connections</span>
          </div>
          <span className="text-2xl font-bold text-primary">{activity.connections_count}</span>
        </div>

        {/* Spaces */}
        {activity.spaces.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Spaces ({activity.spaces.length})
              </span>
            </div>
            <div className="space-y-2">
              {activity.spaces.slice(0, 3).map((space) => (
                <div key={space.id} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md transition-colors">
                  <span className="text-sm">{space.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {space.role}
                  </Badge>
                </div>
              ))}
            </div>
            {activity.spaces.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{activity.spaces.length - 3} more spaces
              </p>
            )}
          </div>
        )}

        {/* Events */}
        {activity.events.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Events ({activity.events.length})
              </span>
            </div>
            <div className="space-y-2">
              {activity.events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md transition-colors">
                  <span className="text-sm">{event.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {event.role}
                  </Badge>
                </div>
              ))}
            </div>
            {activity.events.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{activity.events.length - 3} more events
              </p>
            )}
          </div>
        )}

        {/* Empty State for Owner */}
        {!hasActivity && isOwner && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm mb-2">Start your DNA journey</p>
            <p className="text-xs">Join spaces, attend events, and connect with the community</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Activity;
