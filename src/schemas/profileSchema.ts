import { z } from 'zod';

// Comprehensive profile validation schema
export const profileSchema = z.object({
  // Basic Information
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  display_name: z.string().max(50, 'Display name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  headline: z.string().max(120, 'Headline too long').optional(),
  
  // Contact Information
  email: z.string().email('Invalid email').optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  
  // Location Information
  location: z.string().max(100, 'Location too long').optional(),
  current_country: z.string().max(100, 'Country too long').optional(),
  country_of_origin: z.string().max(100, 'Country too long').optional(),
  diaspora_origin: z.string().max(100, 'Diaspora origin too long').optional(),
  
  // Professional Information
  professional_role: z.string().max(100, 'Role too long').optional(),
  company: z.string().max(100, 'Company too long').optional(),
  industry: z.string().max(100, 'Industry too long').optional(),
  profession: z.string().max(100, 'Profession too long').optional(),
  years_experience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience too high').optional(),
  
  // Skills and Interests
  skills: z.array(z.string().max(50, 'Skill name too long')).max(20, 'Too many skills').optional(),
  interests: z.array(z.string().max(50, 'Interest name too long')).max(20, 'Too many interests').optional(),
  interest_tags: z.array(z.string().max(50, 'Tag too long')).max(20, 'Too many tags').optional(),
  impact_areas: z.array(z.string().max(50, 'Impact area too long')).max(10, 'Too many impact areas').optional(),
  
  // Availability
  available_for: z.array(z.string()).max(8, 'Too many availability options').optional(),
  
  // Media
  avatar_url: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  banner_url: z.string().url('Invalid banner URL').optional().or(z.literal('')),
  profile_picture_url: z.string().url('Invalid profile picture URL').optional().or(z.literal('')),
  
  // Privacy Settings
  is_public: z.boolean().optional(),
  account_visibility: z.string().optional(),
  email_notifications: z.boolean().optional(),
  newsletter_emails: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Helper function to get available options
export const getAvailabilityOptions = () => [
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'speaking', label: 'Speaking Engagements' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'hiring', label: 'Open to Job Opportunities' },
  { value: 'networking', label: 'Networking' },
];

export const getIndustryOptions = () => [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Non-profit',
  'Government',
  'Entertainment',
  'Agriculture',
  'Manufacturing',
  'Energy',
  'Transportation',
  'Retail',
  'Real Estate',
  'Legal',
  'Marketing',
  'Other'
];

export const getCountryOptions = () => [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Senegal',
  'Cameroon',
  'Ivory Coast',
  'Zimbabwe',
  'Zambia',
  'Botswana',
  'Morocco',
  'Egypt',
  'Tunisia',
  'Algeria',
  'Libya',
  'Sudan',
  'Other'
];

export const getVisibilityOptions = () => [
  { value: 'public', label: 'Public - Visible to everyone' },
  { value: 'network_only', label: 'Network Only - Visible to connections' },
  { value: 'private', label: 'Private - Not visible in search' },
];