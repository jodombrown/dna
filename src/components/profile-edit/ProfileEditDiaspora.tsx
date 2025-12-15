import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';
import { 
  CONNECTION_TYPE_OPTIONS, 
  DIASPORA_NETWORK_OPTIONS, 
  ENGAGEMENT_INTENTION_OPTIONS,
  ETHNIC_HERITAGE_OPTIONS,
  RETURN_INTENTIONS_OPTIONS,
  AFRICAN_CAUSES_OPTIONS,
  VISIT_FREQUENCY_OPTIONS 
} from '@/data/profileOptions';

const MENTORSHIP_AREA_OPTIONS = [
  'Business strategy',
  'Career guidance',
  'Entrepreneurship',
  'Fundraising',
  'Investment',
  'Leadership',
  'Legal/Compliance',
  'Marketing',
  'Operations',
  'Personal development',
  'Product development',
  'Technical skills',
] as const;

interface ProfileEditDiasporaProps {
  diasporaStatus: string;
  diasporaNetworks: string[];
  engagementIntentions: string[];
  mentorshipAreas: string[];
  ethnicHeritage: string[];
  returnIntentions: string;
  africanCauses: string[];
  visitFrequency: string;
  onDiasporaStatusChange: (value: string) => void;
  onNetworksChange: (networks: string[]) => void;
  onIntentionsChange: (intentions: string[]) => void;
  onMentorshipAreasChange: (areas: string[]) => void;
  onEthnicHeritageChange: (heritage: string[]) => void;
  onReturnIntentionsChange: (value: string) => void;
  onAfricanCausesChange: (causes: string[]) => void;
  onVisitFrequencyChange: (value: string) => void;
}

const ProfileEditDiaspora: React.FC<ProfileEditDiasporaProps> = ({
  diasporaStatus,
  diasporaNetworks,
  engagementIntentions,
  mentorshipAreas,
  ethnicHeritage,
  returnIntentions,
  africanCauses,
  visitFrequency,
  onDiasporaStatusChange,
  onNetworksChange,
  onIntentionsChange,
  onMentorshipAreasChange,
  onEthnicHeritageChange,
  onReturnIntentionsChange,
  onAfricanCausesChange,
  onVisitFrequencyChange,
}) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>My Connection to Africa</CardTitle>
        <CardDescription>Whether diaspora, continental African, or ally—tell us how you connect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Type */}
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

        {/* Ethnic Heritage */}
        <TagMultiSelect
          label="Ethnic/Tribal Heritage"
          options={Array.from(ETHNIC_HERITAGE_OPTIONS)}
          selected={ethnicHeritage}
          onChange={onEthnicHeritageChange}
          placeholder="Select your heritage..."
          colorClass="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
          allowCustom={true}
        />

        {/* African Causes */}
        <TagMultiSelect
          label="African Causes You Care About"
          options={Array.from(AFRICAN_CAUSES_OPTIONS.map(o => o.label))}
          selected={africanCauses.map(c => {
            const option = AFRICAN_CAUSES_OPTIONS.find(o => o.value === c);
            return option ? option.label : c;
          })}
          onChange={(labels) => {
            // Convert labels back to values for storage
            const values = labels.map(label => {
              const option = AFRICAN_CAUSES_OPTIONS.find(o => o.label === label);
              return option ? option.value : label;
            });
            onAfricanCausesChange(values);
          }}
          placeholder="Select causes..."
          colorClass="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          allowCustom={true}
        />

        {/* Return Intentions */}
        <div>
          <Label htmlFor="return_intentions">Return Plans</Label>
          <Select value={returnIntentions} onValueChange={onReturnIntentionsChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Any plans to relocate to Africa?" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {RETURN_INTENTIONS_OPTIONS.map(option => (
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

        {/* Visit Frequency */}
        <div>
          <Label htmlFor="visit_frequency">How Often Do You Visit Africa?</Label>
          <Select value={visitFrequency} onValueChange={onVisitFrequencyChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select visit frequency" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {VISIT_FREQUENCY_OPTIONS.map(option => (
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

        {/* Diaspora Networks */}
        <TagMultiSelect
          label="Networks & Communities"
          options={Array.from(DIASPORA_NETWORK_OPTIONS)}
          selected={diasporaNetworks}
          onChange={onNetworksChange}
          placeholder="Select networks you belong to..."
          colorClass="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
          allowCustom={true}
        />

        {/* Engagement Intentions */}
        <TagMultiSelect
          label="What Brings You to DNA?"
          options={Array.from(ENGAGEMENT_INTENTION_OPTIONS.map(o => o.label))}
          selected={engagementIntentions}
          onChange={onIntentionsChange}
          placeholder="Select your intentions..."
          colorClass="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
          allowCustom={true}
        />

        {/* Mentorship Areas */}
        <TagMultiSelect
          label="Mentorship Areas"
          options={Array.from(MENTORSHIP_AREA_OPTIONS)}
          selected={mentorshipAreas}
          onChange={onMentorshipAreasChange}
          placeholder="Select mentorship areas..."
          colorClass="bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700"
          allowCustom={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileEditDiaspora;
