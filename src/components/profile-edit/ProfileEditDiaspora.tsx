import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';
import { CONNECTION_TYPE_OPTIONS, DIASPORA_NETWORK_OPTIONS, ENGAGEMENT_INTENTION_OPTIONS } from '@/data/profileOptions';

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
        <CardTitle>My Connection to Africa</CardTitle>
        <CardDescription>Whether diaspora, continental African, or ally—tell us how you connect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="connection_type">How do you connect to Africa?</Label>
          <Select value={diasporaStatus} onValueChange={onDiasporaStatusChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select your connection type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {CONNECTION_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TagMultiSelect
          label="Networks & Communities"
          options={Array.from(DIASPORA_NETWORK_OPTIONS)}
          selected={diasporaNetworks}
          onChange={onNetworksChange}
          placeholder="Select networks you belong to..."
          colorClass="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="What Brings You to DNA?"
          options={Array.from(ENGAGEMENT_INTENTION_OPTIONS.map(o => o.label))}
          selected={engagementIntentions}
          onChange={onIntentionsChange}
          placeholder="Select your intentions..."
          colorClass="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Mentorship Areas"
          options={Array.from(MENTORSHIP_AREA_OPTIONS)}
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
