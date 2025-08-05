import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Heart, 
  Camera, 
  MessageSquare,
  ChevronRight,
  Star
} from 'lucide-react';

interface ProfileCompletenessWidgetProps {
  className?: string;
}

export const ProfileCompletenessWidget: React.FC<ProfileCompletenessWidgetProps> = ({ className }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  // Use database-calculated completion score
  const completenessScore = profile?.profile_completeness_score || 0;
  const isProfileComplete = completenessScore >= 80;

  const getIncompleteItems = () => {
    const items = [];
    
    if (!profile.full_name) items.push({ icon: User, label: 'Add your full name', action: () => navigate('/app/profile/edit') });
    if (!profile.bio) items.push({ icon: MessageSquare, label: 'Write your bio', action: () => navigate('/app/profile/edit') });
    if (!profile.avatar_url) items.push({ icon: Camera, label: 'Upload profile picture', action: () => navigate('/app/profile/edit') });
    if (!profile.location) items.push({ icon: MapPin, label: 'Add your location', action: () => navigate('/app/profile/edit') });
    if (!profile.profession) items.push({ icon: Briefcase, label: 'Add your profession', action: () => navigate('/app/profile/edit') });
    if (!profile.skills || profile.skills.length === 0) items.push({ icon: Star, label: 'Add your skills', action: () => navigate('/app/profile/edit') });
    if (!profile.intro_text) {
      items.push({ icon: Heart, label: 'Add your DNA statement', action: () => navigate('/app/profile/edit') });
    }
    
    return items.slice(0, 3); // Show max 3 items
  };

  const incompleteItems = getIncompleteItems();
  const engagementScore = Math.min(100, (profile.connections_count || 0) * 10 + completenessScore);

  if (isProfileComplete && engagementScore >= 70) {
    return null; // Hide widget when profile is complete and engagement is good
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full" />
          Complete Your DNA Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile Completeness</span>
            <span className="font-medium">{completenessScore}%</span>
          </div>
          <Progress value={completenessScore} className="h-2" />
        </div>

        {/* Engagement Score */}
        {engagementScore < 70 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Community Engagement</span>
              <span className="font-medium">{engagementScore}%</span>
            </div>
            <Progress value={engagementScore} className="h-2" />
          </div>
        )}

        {/* Incomplete Items */}
        {incompleteItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Actions:</h4>
            <div className="space-y-1">
              {incompleteItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-2 text-left"
                    onClick={item.action}
                  >
                    <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Button 
            onClick={() => navigate('/app/profile/edit')} 
            className="w-full"
            size="sm"
          >
            {completenessScore < 50 ? 'Complete Profile Setup' : 'Finish Your Profile'}
          </Button>
        </div>

        {/* Benefit Text */}
        <p className="text-xs text-muted-foreground text-center">
          {completenessScore < 50 
            ? 'A complete profile helps you connect with the right people and opportunities'
            : 'You\'re almost there! A complete profile increases your visibility by 3x'
          }
        </p>
      </CardContent>
    </Card>
  );
};