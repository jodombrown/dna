/**
 * Discovery Tags Constants for DNA Platform
 * These tags enable comprehensive member discovery and matching
 */

export const FOCUS_AREAS = [
  'Climate Change & Sustainability',
  'Education & Youth Development',
  'Healthcare & Wellness',
  'Economic Development & Trade',
  'Technology & Innovation',
  'Agriculture & Food Security',
  'Arts & Culture',
  'Policy & Governance',
  'Infrastructure Development',
  'Gender Equality & Women\'s Empowerment',
] as const;

export const REGIONAL_EXPERTISE = [
  'West Africa',
  'East Africa',
  'Southern Africa',
  'Central Africa',
  'North Africa',
  'Diaspora (North America)',
  'Diaspora (Europe)',
  'Diaspora (Middle East)',
  'Diaspora (Asia Pacific)',
  'Global/Pan-African',
] as const;

export const INDUSTRIES = [
  'Technology & Software',
  'Finance & Investment',
  'Healthcare & Biotech',
  'Renewable Energy',
  'Agriculture & Agritech',
  'Education & EdTech',
  'Real Estate & Construction',
  'Media & Entertainment',
  'Non-Profit & NGO',
  'Government & Public Sector',
  'Manufacturing',
  'Consulting & Professional Services',
  'E-commerce & Retail',
  'Transportation & Logistics',
] as const;

export type FocusArea = typeof FOCUS_AREAS[number];
export type RegionalExpertise = typeof REGIONAL_EXPERTISE[number];
export type Industry = typeof INDUSTRIES[number];
