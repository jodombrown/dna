import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';

const INTEREST_OPTIONS = [
  'Technology', 'Entrepreneurship', 'Investment', 'Healthcare', 'Education',
  'Agriculture', 'Energy', 'Climate', 'Arts & Culture', 'Media',
  'Finance', 'Real Estate', 'Infrastructure', 'Sports', 'Fashion',
  'Music', 'Film', 'Literature', 'Politics', 'Social Impact'
] as const;

const FOCUS_AREA_OPTIONS = [
  'Economic Development', 'Youth Empowerment', 'Women in Leadership',
  'Tech Innovation', 'Climate Action', 'Healthcare Access', 'Education Reform',
  'Financial Inclusion', 'Agriculture Modernization', 'Infrastructure Development',
  'Cultural Preservation', 'Diaspora Engagement', 'Trade & Commerce',
  'Governance & Policy', 'Social Enterprise', 'Sustainable Development'
] as const;

const REGIONAL_EXPERTISE_OPTIONS = [
  'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa',
  'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Ethiopia', 'Egypt',
  'Morocco', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Côte d\'Ivoire'
] as const;

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Agriculture',
  'Energy', 'Manufacturing', 'Retail', 'Real Estate', 'Transportation',
  'Media', 'Consulting', 'Legal', 'Non-Profit', 'Government'
] as const;

interface ProfileEditInterestsProps {
  interests: string[];
  focusAreas: string[];
  regionalExpertise: string[];
  industries: string[];
  onInterestsChange: (interests: string[]) => void;
  onFocusAreasChange: (areas: string[]) => void;
  onRegionalExpertiseChange: (regions: string[]) => void;
  onIndustriesChange: (industries: string[]) => void;
}

const ProfileEditInterests: React.FC<ProfileEditInterestsProps> = ({
  interests,
  focusAreas,
  regionalExpertise,
  industries,
  onInterestsChange,
  onFocusAreasChange,
  onRegionalExpertiseChange,
  onIndustriesChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interests & Focus Areas</CardTitle>
        <CardDescription>What you're passionate about — this powers discovery and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TagMultiSelect
          label="Personal Interests"
          options={INTEREST_OPTIONS}
          selected={interests}
          onChange={onInterestsChange}
          placeholder="Select your interests..."
          colorClass="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Impact Focus Areas"
          options={FOCUS_AREA_OPTIONS}
          selected={focusAreas}
          onChange={onFocusAreasChange}
          placeholder="Select focus areas..."
          colorClass="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Regional Expertise"
          options={REGIONAL_EXPERTISE_OPTIONS}
          selected={regionalExpertise}
          onChange={onRegionalExpertiseChange}
          placeholder="Select regions you know well..."
          colorClass="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Industries"
          options={INDUSTRY_OPTIONS}
          selected={industries}
          onChange={onIndustriesChange}
          placeholder="Select industries..."
          colorClass="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
          allowCustom={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileEditInterests;
