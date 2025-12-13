// Pure utility for profile completion calculation - no React imports
// This prevents circular dependency issues

export interface ProfileFieldCheck {
  field: string;
  label: string;
  complete: boolean;
  points: number;
  priority: number;
  pillar: string;
}

// 5-pillar system totaling exactly 100 points
export function getProfileFieldChecks(profile: any): ProfileFieldCheck[] {
  if (!profile) return [];

  return [
    // Pillar 1: Identity (25 pts)
    {
      field: 'avatar_url',
      label: 'Profile photo',
      complete: !!profile.avatar_url,
      points: 10,
      priority: 1,
      pillar: 'Identity',
    },
    {
      field: 'full_name',
      label: 'Full name',
      complete: !!profile.full_name && profile.full_name.length >= 2,
      points: 5,
      priority: 1,
      pillar: 'Identity',
    },
    {
      field: 'headline',
      label: 'Professional headline',
      complete: !!profile.headline && profile.headline.length >= 5,
      points: 10,
      priority: 2,
      pillar: 'Identity',
    },

    // Pillar 2: Professional (20 pts)
    {
      field: 'profession',
      label: 'Professional role',
      complete: !!profile.profession,
      points: 5,
      priority: 2,
      pillar: 'Professional',
    },
    {
      field: 'bio',
      label: 'Bio (50+ characters)',
      complete: !!profile.bio && profile.bio.length >= 50,
      points: 10,
      priority: 3,
      pillar: 'Professional',
    },
    {
      field: 'linkedin_url',
      label: 'LinkedIn profile',
      complete: !!profile.linkedin_url,
      points: 5,
      priority: 4,
      pillar: 'Professional',
    },

    // Pillar 3: Discovery (30 pts)
    {
      field: 'skills',
      label: 'Skills (3+)',
      complete: Array.isArray(profile.skills) && profile.skills.length >= 3,
      points: 10,
      priority: 2,
      pillar: 'Discovery',
    },
    {
      field: 'focus_areas',
      label: 'Focus areas (2+)',
      complete: Array.isArray(profile.focus_areas) && profile.focus_areas.length >= 2,
      points: 10,
      priority: 2,
      pillar: 'Discovery',
    },
    {
      field: 'interests',
      label: 'Interests (3+)',
      complete: Array.isArray(profile.interests) && profile.interests.length >= 3,
      points: 10,
      priority: 3,
      pillar: 'Discovery',
    },

    // Pillar 4: Diaspora Context (15 pts)
    {
      field: 'country_of_origin',
      label: 'Country of origin',
      complete: !!profile.country_of_origin,
      points: 5,
      priority: 1,
      pillar: 'Diaspora Context',
    },
    {
      field: 'current_country',
      label: 'Current country',
      complete: !!profile.current_country,
      points: 5,
      priority: 1,
      pillar: 'Diaspora Context',
    },
    {
      field: 'languages',
      label: 'Languages (1+)',
      complete: Array.isArray(profile.languages) && profile.languages.length >= 1,
      points: 5,
      priority: 3,
      pillar: 'Diaspora Context',
    },

    // Pillar 5: Engagement (10 pts)
    {
      field: 'banner_url',
      label: 'Profile banner',
      complete: !!profile.banner_url,
      points: 5,
      priority: 5,
      pillar: 'Engagement',
    },
    {
      field: 'industries',
      label: 'Industries (1+)',
      complete: Array.isArray(profile.industries) && profile.industries.length >= 1,
      points: 5,
      priority: 4,
      pillar: 'Engagement',
    },
  ];
}

// Calculate total completion points (max 100)
export function calculateProfileCompletionPts(profile: any): number {
  if (!profile) return 0;
  const fields = getProfileFieldChecks(profile);
  return Math.min(100, fields.filter(f => f.complete).reduce((sum, f) => sum + f.points, 0));
}

// Get missing fields sorted by priority (ascending) then points (descending)
export function getMissingFields(profile: any): ProfileFieldCheck[] {
  const fields = getProfileFieldChecks(profile);
  return fields
    .filter(f => !f.complete)
    .sort((a, b) => a.priority - b.priority || b.points - a.points);
}

// Get completed fields
export function getCompletedFields(profile: any): ProfileFieldCheck[] {
  return getProfileFieldChecks(profile).filter(f => f.complete);
}

// Get completion breakdown by pillar
export function getCompletionByPillar(profile: any): Record<string, { earned: number; total: number }> {
  const fields = getProfileFieldChecks(profile);
  const pillars: Record<string, { earned: number; total: number }> = {};

  fields.forEach(f => {
    if (!pillars[f.pillar]) {
      pillars[f.pillar] = { earned: 0, total: 0 };
    }
    pillars[f.pillar].total += f.points;
    if (f.complete) {
      pillars[f.pillar].earned += f.points;
    }
  });

  return pillars;
}

// Legacy alias for backward compatibility
export const calculateProfileCompletion = calculateProfileCompletionPts;
