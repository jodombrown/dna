/**
 * Profile Options Constants for DNA Platform
 * Centralized options for all profile-related selectors
 */

// =============================================================================
// SECTORS & INDUSTRIES
// =============================================================================

export const SECTOR_OPTIONS = [
  'Fintech',
  'Agtech',
  'Healthcare',
  'Education',
  'Infrastructure',
  'Energy',
  'Climate',
  'Manufacturing',
  'Retail',
  'Tech/Software',
  'Real Estate',
  'Transportation',
  'Media & Entertainment',
  'Tourism',
  'Mining',
] as const;

export type Sector = typeof SECTOR_OPTIONS[number];

// =============================================================================
// INTENTIONS (What brings you to DNA?)
// =============================================================================

export const INTENTION_OPTIONS = [
  { value: 'invest', label: 'Invest' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'build', label: 'Build/Start Business' },
  { value: 'learn', label: 'Learn' },
  { value: 'connect', label: 'Connect with Community' },
  { value: 'give_back', label: 'Give Back' },
] as const;

export const INTENTION_VALUES = INTENTION_OPTIONS.map(o => o.value);
export type IntentionValue = typeof INTENTION_OPTIONS[number]['value'];

// =============================================================================
// CONNECTION TO AFRICA (Inclusive Member Types)
// =============================================================================

export const CONNECTION_TYPE_OPTIONS = [
  { value: '1st_gen_diaspora', label: '1st Generation Diaspora', description: 'Born in Africa, living abroad' },
  { value: '2nd_gen_diaspora', label: '2nd Generation Diaspora', description: 'Born abroad, African parent(s)' },
  { value: '3rd_gen_diaspora', label: '3rd+ Generation Diaspora', description: 'Multi-generational diaspora' },
  { value: 'continental_african', label: 'Continental African', description: 'Living in Africa' },
  { value: 'returnee', label: 'Returnee', description: 'Returned to live in Africa' },
  { value: 'ally', label: 'Ally / Friend of Africa', description: 'Supporting African development' },
  { value: 'mixed_heritage', label: 'Mixed Heritage', description: 'Partial African ancestry' },
] as const;

export const CONNECTION_TYPE_VALUES = CONNECTION_TYPE_OPTIONS.map(o => o.value);
export type ConnectionTypeValue = typeof CONNECTION_TYPE_OPTIONS[number]['value'];

// Legacy alias for backward compatibility
export const DIASPORA_STATUS_OPTIONS = CONNECTION_TYPE_OPTIONS;
export const DIASPORA_STATUS_VALUES = CONNECTION_TYPE_VALUES;
export type DiasporaStatusValue = ConnectionTypeValue;

// =============================================================================
// ENGAGEMENT INTENTIONS (For Connect/Collaborate pillars)
// =============================================================================

export const ENGAGEMENT_INTENTION_OPTIONS = [
  { value: 'mentoring', label: 'Mentoring Others' },
  { value: 'being_mentored', label: 'Being Mentored' },
  { value: 'collaborating', label: 'Collaborating on Projects' },
  { value: 'investing', label: 'Investing' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'job_seeking', label: 'Seeking Opportunities' },
  { value: 'networking', label: 'Networking' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'advising', label: 'Advising/Consulting' },
  { value: 'speaking', label: 'Speaking at Events' },
  { value: 'learning', label: 'Learning & Development' },
] as const;

export const ENGAGEMENT_INTENTION_VALUES = ENGAGEMENT_INTENTION_OPTIONS.map(o => o.value);
export type EngagementIntentionValue = typeof ENGAGEMENT_INTENTION_OPTIONS[number]['value'];

// =============================================================================
// AVAILABLE FOR (What are you open to?)
// =============================================================================

export const AVAILABLE_FOR_OPTIONS = [
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'collaborations', label: 'Collaborations' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'advising', label: 'Advisory Roles' },
  { value: 'board_positions', label: 'Board Positions' },
  { value: 'speaking', label: 'Speaking Engagements' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'investments', label: 'Investment Opportunities' },
  { value: 'job_opportunities', label: 'Job Opportunities' },
  { value: 'partnerships', label: 'Business Partnerships' },
] as const;

export const AVAILABLE_FOR_VALUES = AVAILABLE_FOR_OPTIONS.map(o => o.value);
export type AvailableForValue = typeof AVAILABLE_FOR_OPTIONS[number]['value'];

// =============================================================================
// MENTORSHIP AREAS
// =============================================================================

export const MENTORSHIP_AREA_OPTIONS = [
  'Career Development',
  'Leadership & Management',
  'Entrepreneurship',
  'Fundraising & Investment',
  'Product Development',
  'Marketing & Growth',
  'Technical Skills',
  'Business Strategy',
  'Financial Planning',
  'Work-Life Balance',
  'Navigating Corporate Culture',
  'Building Networks',
  'Personal Branding',
  'Industry Expertise',
] as const;

export type MentorshipArea = typeof MENTORSHIP_AREA_OPTIONS[number];

// =============================================================================
// PROFESSIONAL SKILLS (Common skills for discovery)
// =============================================================================

export const COMMON_SKILLS = [
  'Product Management',
  'Software Engineering',
  'Data Science',
  'Machine Learning',
  'UX/UI Design',
  'Marketing',
  'Sales',
  'Business Development',
  'Finance & Accounting',
  'Operations',
  'Human Resources',
  'Legal',
  'Strategy & Consulting',
  'Project Management',
  'Research',
  'Writing & Content',
  'Public Speaking',
  'Fundraising',
  'Community Building',
  'Policy & Government Relations',
] as const;

export type CommonSkill = typeof COMMON_SKILLS[number];

// =============================================================================
// INTERESTS (Common interests for discovery)
// =============================================================================

export const COMMON_INTERESTS = [
  'African Tech Ecosystem',
  'Impact Investing',
  'Sustainable Development',
  'Climate & Environment',
  'Fintech & Digital Finance',
  'Healthcare Innovation',
  'EdTech',
  'Agritech',
  'Creative Industries',
  'Diaspora Engagement',
  'Policy & Governance',
  'Women in Business',
  'Youth Empowerment',
  'Infrastructure Development',
  'Cultural Preservation',
] as const;

export type CommonInterest = typeof COMMON_INTERESTS[number];

// =============================================================================
// DIASPORA NETWORKS
// =============================================================================

export const DIASPORA_NETWORK_OPTIONS = [
  'Tech Community',
  'Investment Networks',
  'Professional Associations',
  'Cultural Organizations',
  'Alumni Networks',
  'Faith-Based Communities',
  'Women\'s Networks',
  'Youth Networks',
  'Entrepreneurship Hubs',
  'Academic/Research Networks',
] as const;

export type DiasporaNetwork = typeof DIASPORA_NETWORK_OPTIONS[number];

// =============================================================================
// USER TYPES
// =============================================================================

export const USER_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'founder', label: 'Founder/Entrepreneur' },
  { value: 'investor', label: 'Investor' },
  { value: 'professional', label: 'Professional' },
  { value: 'student', label: 'Student' },
  { value: 'organizer', label: 'Community Organizer' },
  { value: 'creative', label: 'Creative/Artist' },
  { value: 'other', label: 'Other' },
] as const;

export const USER_TYPE_VALUES = USER_TYPE_OPTIONS.map(o => o.value);
export type UserTypeValue = typeof USER_TYPE_OPTIONS[number]['value'];
