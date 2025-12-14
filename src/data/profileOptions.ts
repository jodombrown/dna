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
// AFRICAN LANGUAGES (For "My Connection to Africa" section)
// =============================================================================

export const AFRICAN_LANGUAGES = [
  // Widely spoken
  'Swahili', 'Arabic', 'Hausa', 'Yoruba', 'Igbo', 'Amharic', 'Oromo', 'Zulu',
  'Shona', 'Xhosa', 'Afrikaans', 'Sotho', 'Tswana', 'Lingala', 'Wolof',
  'Fulani', 'Akan', 'Twi', 'Tigrinya', 'Somali', 'Kinyarwanda', 'Kirundi',
  'Luganda', 'Chichewa', 'Ndebele', 'Kikuyu', 'Luo', 'Malagasy', 'Berber',
  'Tamazight', 'Fon', 'Ewe', 'Bambara', 'Mandinka', 'Serer', 'Tiv', 'Edo',
  'Efik', 'Ibibio', 'Kanuri', 'Nupe', 'Tumbuka', 'Bemba', 'Nyanja', 'Lozi',
  'Tsonga', 'Venda', 'Swazi', 'Setswana', 'Sesotho', 'Sepedi', 'isiZulu',
  'isiXhosa', 'isiNdebele', 'Siswati', 'Tshivenda', 'Xitsonga', 'Krio',
  'Pidgin English', 'Gikuyu', 'Dholuo', 'Kalenjin', 'Luhya', 'Meru', 'Maasai',
] as const;

export type AfricanLanguage = typeof AFRICAN_LANGUAGES[number];

// Helper function to check if a language is African
export const isAfricanLanguage = (language: string): boolean => {
  const normalizedLang = language.toLowerCase().trim();
  return AFRICAN_LANGUAGES.some(
    africanLang => africanLang.toLowerCase() === normalizedLang
  );
};

// =============================================================================
// ETHNIC/TRIBAL HERITAGE
// =============================================================================

export const ETHNIC_HERITAGE_OPTIONS = [
  // West Africa
  'Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Akan', 'Ashanti', 'Ewe', 'Fon', 'Wolof',
  'Mandinka', 'Serer', 'Bambara', 'Soninke', 'Mossi', 'Tuareg', 'Kanuri',
  // East Africa
  'Amhara', 'Oromo', 'Tigray', 'Somali', 'Kikuyu', 'Luo', 'Maasai', 'Kalenjin',
  'Luhya', 'Kamba', 'Baganda', 'Tutsi', 'Hutu', 'Swahili',
  // Southern Africa
  'Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Ndebele', 'Shona', 'Venda', 'Tsonga',
  'Swazi', 'Pedi', 'Herero', 'Himba', 'San', 'Khoikhoi',
  // North Africa
  'Berber', 'Amazigh', 'Tuareg', 'Nubian', 'Coptic', 'Arab',
  // Central Africa
  'Kongo', 'Luba', 'Mongo', 'Fang', 'Beti', 'Bamileke', 'Pygmy',
  // Other
  'Mixed Heritage', 'Unknown/Researching',
] as const;

export type EthnicHeritage = typeof ETHNIC_HERITAGE_OPTIONS[number];

// =============================================================================
// RETURN INTENTIONS
// =============================================================================

export const RETURN_INTENTIONS_OPTIONS = [
  { value: 'planning_return', label: 'Planning to Return', description: 'Actively planning to relocate to Africa' },
  { value: 'exploring', label: 'Exploring Options', description: 'Considering it, researching possibilities' },
  { value: 'regular_visits', label: 'Regular Visits', description: 'Prefer to visit regularly but live abroad' },
  { value: 'no_plans', label: 'No Current Plans', description: 'Content living abroad for now' },
  { value: 'already_returned', label: 'Already Returned', description: 'Have relocated back to Africa' },
  { value: 'never_left', label: 'Never Left', description: 'Continental African, never left' },
] as const;

export const RETURN_INTENTIONS_VALUES = RETURN_INTENTIONS_OPTIONS.map(o => o.value);
export type ReturnIntentionsValue = typeof RETURN_INTENTIONS_OPTIONS[number]['value'];

// =============================================================================
// AFRICAN CAUSES
// =============================================================================

export const AFRICAN_CAUSES_OPTIONS = [
  { value: 'education', label: 'Education & Literacy' },
  { value: 'healthcare', label: 'Healthcare & Public Health' },
  { value: 'tech_ecosystem', label: 'Tech Ecosystem & Innovation' },
  { value: 'climate', label: 'Climate & Environment' },
  { value: 'youth_empowerment', label: 'Youth Empowerment' },
  { value: 'womens_rights', label: "Women's Rights & Gender Equality" },
  { value: 'economic_development', label: 'Economic Development' },
  { value: 'agriculture', label: 'Agriculture & Food Security' },
  { value: 'infrastructure', label: 'Infrastructure & Housing' },
  { value: 'governance', label: 'Governance & Democracy' },
  { value: 'arts_culture', label: 'Arts, Culture & Heritage' },
  { value: 'diaspora_engagement', label: 'Diaspora Engagement' },
  { value: 'entrepreneurship', label: 'Entrepreneurship & SMEs' },
  { value: 'financial_inclusion', label: 'Financial Inclusion' },
] as const;

export const AFRICAN_CAUSES_VALUES = AFRICAN_CAUSES_OPTIONS.map(o => o.value);
export type AfricanCausesValue = typeof AFRICAN_CAUSES_OPTIONS[number]['value'];

// =============================================================================
// AFRICA VISIT FREQUENCY
// =============================================================================

export const VISIT_FREQUENCY_OPTIONS = [
  { value: 'live_there', label: 'I Live in Africa', description: 'Currently residing in Africa' },
  { value: 'multiple_yearly', label: 'Multiple Times a Year', description: 'Frequent traveler' },
  { value: 'yearly', label: 'About Once a Year', description: 'Annual visits' },
  { value: 'every_few_years', label: 'Every Few Years', description: 'Occasional visits' },
  { value: 'rarely', label: 'Rarely', description: 'Infrequent visits' },
  { value: 'never_visited', label: 'Not Yet', description: "Haven't visited yet but want to" },
  { value: 'planning_first', label: 'Planning First Trip', description: 'First visit coming up' },
] as const;

export const VISIT_FREQUENCY_VALUES = VISIT_FREQUENCY_OPTIONS.map(o => o.value);
export type VisitFrequencyValue = typeof VISIT_FREQUENCY_OPTIONS[number]['value'];

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
