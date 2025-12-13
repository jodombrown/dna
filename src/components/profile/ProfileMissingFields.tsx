import React from 'react';
import { CheckCircle2, Circle, Camera, User, Briefcase, MapPin, Globe, Heart, Languages, Linkedin, Image } from 'lucide-react';
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
  pillar: 'identity' | 'professional' | 'discovery' | 'heritage' | 'engagement';
}

/**
 * DNA Profile Completion System - 5 Pillars, 100 Points Total
 * 
 * 1. Basic Identity (25 points) - Who you are
 * 2. Professional (20 points) - What you do
 * 3. Discovery Tags (30 points) - How others find you
 * 4. Heritage & Identity (15 points) - Your diaspora story
 * 5. Engagement (10 points) - Visual presence & activity
 */
export const getProfileFieldChecks = (profile: any): FieldCheck[] => {
  if (!profile) return [];

  const fields: FieldCheck[] = [
    // ========== PILLAR 1: Basic Identity (25 points) ==========
    {
      key: 'avatar_url',
      label: 'Profile photo',
      icon: <Camera className="h-4 w-4" />,
      complete: !!profile.avatar_url,
      points: 10,
      priority: 1,
      pillar: 'identity',
    },
    {
      key: 'full_name',
      label: 'Full name',
      icon: <User className="h-4 w-4" />,
      complete: !!profile.full_name?.length,
      points: 5,
      priority: 1,
      pillar: 'identity',
    },
    {
      key: 'headline',
      label: 'Professional headline',
      icon: <Briefcase className="h-4 w-4" />,
      complete: !!profile.headline?.length,
      points: 10,
      priority: 1,
      pillar: 'identity',
    },

    // ========== PILLAR 2: Professional (20 points) ==========
    {
      key: 'profession',
      label: 'Profession/Role',
      icon: <Briefcase className="h-4 w-4" />,
      complete: !!profile.profession?.length,
      points: 5,
      priority: 2,
      pillar: 'professional',
    },
    {
      key: 'bio',
      label: 'Bio (50+ characters)',
      icon: <User className="h-4 w-4" />,
      complete: profile.bio?.length >= 50,
      points: 10,
      priority: 2,
      pillar: 'professional',
    },
    {
      key: 'linkedin_url',
      label: 'LinkedIn profile',
      icon: <Linkedin className="h-4 w-4" />,
      complete: !!profile.linkedin_url?.length,
      points: 5,
      priority: 3,
      pillar: 'professional',
    },

    // ========== PILLAR 3: Discovery Tags (30 points) ==========
    {
      key: 'skills',
      label: 'Skills (3+ required)',
      icon: <Heart className="h-4 w-4" />,
      complete: Array.isArray(profile.skills) && profile.skills.length >= 3,
      points: 10,
      priority: 1,
      pillar: 'discovery',
    },
    {
      key: 'focus_areas',
      label: 'Focus areas (2+ required)',
      icon: <Globe className="h-4 w-4" />,
      complete: Array.isArray(profile.focus_areas) && profile.focus_areas.length >= 2,
      points: 10,
      priority: 1,
      pillar: 'discovery',
    },
    {
      key: 'interests',
      label: 'Interests (3+ required)',
      icon: <Heart className="h-4 w-4" />,
      complete: Array.isArray(profile.interests) && profile.interests.length >= 3,
      points: 10,
      priority: 2,
      pillar: 'discovery',
    },

    // ========== PILLAR 4: Heritage & Identity (15 points) ==========
    {
      key: 'country_of_origin',
      label: 'Country of origin/heritage',
      icon: <Globe className="h-4 w-4" />,
      complete: !!profile.country_of_origin?.length,
      points: 5,
      priority: 1,
      pillar: 'heritage',
    },
    {
      key: 'current_country',
      label: 'Current location',
      icon: <MapPin className="h-4 w-4" />,
      complete: !!profile.current_country?.length,
      points: 5,
      priority: 1,
      pillar: 'heritage',
    },
    {
      key: 'languages',
      label: 'Languages (1+ required)',
      icon: <Languages className="h-4 w-4" />,
      complete: Array.isArray(profile.languages) && profile.languages.length >= 1,
      points: 5,
      priority: 2,
      pillar: 'heritage',
    },

    // ========== PILLAR 5: Engagement (10 points) ==========
    {
      key: 'banner_url',
      label: 'Profile banner image',
      icon: <Image className="h-4 w-4" />,
      complete: !!profile.banner_url,
      points: 5,
      priority: 3,
      pillar: 'engagement',
    },
    {
      key: 'industries',
      label: 'Industries (1+ required)',
      icon: <Briefcase className="h-4 w-4" />,
      complete: Array.isArray(profile.industries) && profile.industries.length >= 1,
      points: 5,
      priority: 2,
      pillar: 'engagement',
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

export const getCompletionByPillar = (profile: any): Record<string, { earned: number; total: number }> => {
  const fields = getProfileFieldChecks(profile);
  const pillars: Record<string, { earned: number; total: number }> = {
    identity: { earned: 0, total: 0 },
    professional: { earned: 0, total: 0 },
    discovery: { earned: 0, total: 0 },
    heritage: { earned: 0, total: 0 },
    engagement: { earned: 0, total: 0 },
  };

  fields.forEach(field => {
    pillars[field.pillar].total += field.points;
    if (field.complete) {
      pillars[field.pillar].earned += field.points;
    }
  });

  return pillars;
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
              +{field.points} pts
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
