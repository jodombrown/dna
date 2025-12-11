import React from 'react';
import { CheckCircle2, Circle, Camera, User, Briefcase, MapPin, Globe, Heart, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileMissingFieldsProps {
  profile: any;
  compact?: boolean;
  maxItems?: number;
}

interface FieldCheck {
  key: string;
  label: string;
  icon: React.ReactNode;
  complete: boolean;
  points: number;
  priority: number; // 1 = highest priority
}

export const getProfileFieldChecks = (profile: any): FieldCheck[] => {
  if (!profile) return [];

  const fields: FieldCheck[] = [
    // Basic Info (30 points) - Priority 1
    {
      key: 'avatar_url',
      label: 'Profile photo',
      icon: <Camera className="h-4 w-4" />,
      complete: !!profile.avatar_url,
      points: 10,
      priority: 1,
    },
    {
      key: 'full_name',
      label: 'Full name',
      icon: <User className="h-4 w-4" />,
      complete: !!profile.full_name?.length,
      points: 5,
      priority: 1,
    },
    {
      key: 'headline',
      label: 'Professional headline',
      icon: <Briefcase className="h-4 w-4" />,
      complete: !!profile.headline?.length,
      points: 5,
      priority: 1,
    },
    {
      key: 'bio',
      label: 'Bio (50+ characters)',
      icon: <User className="h-4 w-4" />,
      complete: profile.bio?.length > 50,
      points: 5,
      priority: 2,
    },
    // Professional Info (20 points) - Priority 2
    {
      key: 'profession',
      label: 'Profession/Role',
      icon: <Briefcase className="h-4 w-4" />,
      complete: !!profile.profession?.length,
      points: 5,
      priority: 2,
    },
    {
      key: 'skills',
      label: 'Skills (3+ required)',
      icon: <Heart className="h-4 w-4" />,
      complete: profile.skills?.length >= 3,
      points: 10,
      priority: 2,
    },
    // Discovery Tags (30 points) - Priority 1 (critical for findability)
    {
      key: 'focus_areas',
      label: 'Focus areas (2+ required)',
      icon: <Globe className="h-4 w-4" />,
      complete: profile.focus_areas?.length >= 2,
      points: 10,
      priority: 1,
    },
    {
      key: 'regional_expertise',
      label: 'Regional expertise',
      icon: <MapPin className="h-4 w-4" />,
      complete: profile.regional_expertise?.length >= 1,
      points: 10,
      priority: 1,
    },
    {
      key: 'industries',
      label: 'Industries (2+ required)',
      icon: <Briefcase className="h-4 w-4" />,
      complete: profile.industries?.length >= 2,
      points: 10,
      priority: 2,
    },
    // Heritage & Identity (10 points) - Priority 2
    {
      key: 'country_of_origin',
      label: 'Country of origin',
      icon: <Globe className="h-4 w-4" />,
      complete: !!profile.country_of_origin?.length,
      points: 5,
      priority: 2,
    },
    {
      key: 'current_country',
      label: 'Current location',
      icon: <MapPin className="h-4 w-4" />,
      complete: !!profile.current_country?.length,
      points: 5,
      priority: 2,
    },
  ];

  return fields.sort((a, b) => {
    // Sort by: incomplete first, then by priority, then by points
    if (a.complete !== b.complete) return a.complete ? 1 : -1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.points - a.points;
  });
};

export const getMissingFields = (profile: any): FieldCheck[] => {
  return getProfileFieldChecks(profile).filter(f => !f.complete);
};

export const getCompletedFields = (profile: any): FieldCheck[] => {
  return getProfileFieldChecks(profile).filter(f => f.complete);
};

export const ProfileMissingFields: React.FC<ProfileMissingFieldsProps> = ({
  profile,
  compact = false,
  maxItems = 5,
}) => {
  const fields = getProfileFieldChecks(profile);
  const missingFields = fields.filter(f => !f.complete);
  const displayFields = compact ? missingFields.slice(0, maxItems) : fields;

  if (compact && missingFields.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span>Profile complete!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayFields.map((field) => (
        <div
          key={field.key}
          className={cn(
            'flex items-center gap-3 text-sm',
            field.complete ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          <div className={cn(
            'flex-shrink-0',
            field.complete ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {field.complete ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </div>
          <span className={cn(
            field.complete && 'line-through opacity-60'
          )}>
            {field.label}
          </span>
          {!field.complete && !compact && (
            <span className="text-xs text-dna-copper font-medium ml-auto">
              +{field.points}%
            </span>
          )}
        </div>
      ))}
      {compact && missingFields.length > maxItems && (
        <p className="text-xs text-muted-foreground pl-7">
          +{missingFields.length - maxItems} more fields to complete
        </p>
      )}
    </div>
  );
};

export default ProfileMissingFields;
