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
  Star,
  Globe,
  Languages,
  Linkedin,
  Image
} from 'lucide-react';
import { calculateProfileCompletionPts, getMissingFields, type ProfileFieldCheck } from '@/lib/profileCompletion';

interface ProfileCompletenessWidgetProps {
  className?: string;
}

// Map canonical field names to icons
const getFieldIcon = (field: string) => {
  const iconMap: Record<string, React.ElementType> = {
    avatar_url: Camera,
    full_name: User,
    headline: Briefcase,
    profession: Briefcase,
    bio: MessageSquare,
    linkedin_url: Linkedin,
    skills: Star,
    focus_areas: Globe,
    interests: Heart,
    country_of_origin: MapPin,
    current_country: MapPin,
    languages: Languages,
    banner_url: Image,
    industries: Globe,
  };
  return iconMap[field] || Star;
};

export const ProfileCompletenessWidget: React.FC<ProfileCompletenessWidgetProps> = ({ className }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  // Use canonical completion score (0-100 pts)
  const completenessScore = calculateProfileCompletionPts(profile);
  const isProfileComplete = completenessScore >= 80;

  // Get missing fields from canonical utility, take top 3
  const missingFields = getMissingFields(profile).slice(0, 3);
  const incompleteItems = missingFields.map((field: ProfileFieldCheck) => ({
    icon: getFieldIcon(field.field),
    label: field.label,
    points: field.points,
    action: () => navigate('/dna/profile/edit'),
  }));

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
            <span className="text-muted-foreground">Profile Strength</span>
            <span className="font-medium">{completenessScore} pts</span>
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
            onClick={() => navigate('/dna/profile/edit')} 
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