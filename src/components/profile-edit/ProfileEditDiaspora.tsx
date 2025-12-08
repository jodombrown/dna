import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';

const DIASPORA_STATUS_OPTIONS = [
  { value: '1st_gen', label: '1st Generation (Born in Africa, living abroad)' },
  { value: '2nd_gen', label: '2nd Generation (Born abroad, African parents)' },
  { value: '3rd_gen_plus', label: '3rd+ Generation' },
  { value: 'continental_abroad', label: 'Continental African Abroad (temporary)' },
  { value: 'returnee', label: 'Returnee (Moved back to Africa)' },
  { value: 'friend_of_africa', label: 'Friend of Africa (Non-African ally)' },
  { value: 'other', label: 'Other' }
];

const DIASPORA_NETWORK_OPTIONS = [
  'African Union Diaspora Network', 'Africans in Tech', 'African Professionals Network',
  'Afropolitan', 'One Africa Forum', 'African Leadership Network', 'Diaspora Investment Club',
  'African Women in Tech', 'Pan-African Chamber of Commerce', 'Africa Business Club',
  'Homecoming Revolution', 'African Entrepreneurs Collective'
] as const;

const ENGAGEMENT_INTENTION_OPTIONS = [
  'Invest in Africa', 'Mentor emerging leaders', 'Build/Start a business',
  'Learn and grow', 'Connect with community', 'Give back (volunteering)',
  'Advise organizations', 'Share knowledge/skills', 'Explore opportunities',
  'Support startups', 'Cultural exchange', 'Research collaboration'
] as const;

const MENTORSHIP_AREA_OPTIONS = [
  'Career guidance', 'Entrepreneurship', 'Technical skills', 'Leadership',
  'Fundraising', 'Business strategy', 'Marketing', 'Product development',
  'Investment', 'Legal/Compliance', 'Operations', 'Personal development'
] as const;

interface ProfileEditDiasporaProps {
  diasporaStatus: string;
  diasporaNetworks: string[];
  engagementIntentions: string[];
  mentorshipAreas: string[];
  onDiasporaStatusChange: (value: string) => void;
  onNetworksChange: (networks: string[]) => void;
  onIntentionsChange: (intentions: string[]) => void;
  onMentorshipAreasChange: (areas: string[]) => void;
}

const ProfileEditDiaspora: React.FC<ProfileEditDiasporaProps> = ({
  diasporaStatus,
  diasporaNetworks,
  engagementIntentions,
  mentorshipAreas,
  onDiasporaStatusChange,
  onNetworksChange,
  onIntentionsChange,
  onMentorshipAreasChange,
}) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>Your African Diaspora Identity</CardTitle>
        <CardDescription>Help us understand your connection to the diaspora and how you want to engage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="diaspora_status">Diaspora Status</Label>
          <Select value={diasporaStatus} onValueChange={onDiasporaStatusChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select your diaspora status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {DIASPORA_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TagMultiSelect
          label="Diaspora Networks & Organizations"
          options={DIASPORA_NETWORK_OPTIONS}
          selected={diasporaNetworks}
          onChange={onNetworksChange}
          placeholder="Select networks you belong to..."
          colorClass="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="What Brings You to DNA? (Engagement Intentions)"
          options={ENGAGEMENT_INTENTION_OPTIONS}
          selected={engagementIntentions}
          onChange={onIntentionsChange}
          placeholder="Select your intentions..."
          colorClass="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Mentorship Areas (How you can help or want help)"
          options={MENTORSHIP_AREA_OPTIONS}
          selected={mentorshipAreas}
          onChange={onMentorshipAreasChange}
          placeholder="Select mentorship areas..."
          colorClass="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
          allowCustom={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileEditDiaspora;
