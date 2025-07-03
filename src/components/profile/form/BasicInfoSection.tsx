
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormData } from './FormDataTypes';
import ArrayFieldManager from './ArrayFieldManager';

interface BasicInfoSectionProps {
  formData: FormData;
  impactAreas: string[];
  engagementIntentions: string[];
  onInputChange: (field: keyof FormData, value: string | boolean | number) => void;
  onImpactAreasChange: (areas: string[]) => void;
  onEngagementIntentionsChange: (intentions: string[]) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  impactAreas,
  engagementIntentions,
  onInputChange,
  onImpactAreasChange,
  onEngagementIntentionsChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Basic Information</CardTitle>
        <CardDescription>Tell us about yourself and your DNA statement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => onInputChange('headline', e.target.value)}
              placeholder="Software Engineer, Entrepreneur, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="Your city"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="my_dna_statement">My DNA Statement</Label>
          <Textarea
            id="my_dna_statement"
            value={formData.my_dna_statement}
            onChange={(e) => onInputChange('my_dna_statement', e.target.value)}
            placeholder="Your personal mission and connection to Africa..."
            rows={3}
          />
        </div>

        <ArrayFieldManager
          label="Impact Areas"
          items={impactAreas}
          newItem=""
          placeholder="Education, Healthcare, Technology, etc."
          badgeColor="text-dna-emerald border-dna-emerald"
          onNewItemChange={() => {}}
          onAddItem={() => {}}
          onRemoveItem={(area) => {
            const updatedAreas = impactAreas.filter(item => item !== area);
            onImpactAreasChange(updatedAreas);
          }}
        />

        <ArrayFieldManager
          label="Engagement Intentions"
          items={engagementIntentions}
          newItem=""
          placeholder="Mentoring, Investing, Volunteering, etc."
          badgeColor="text-dna-copper border-dna-copper"
          onNewItemChange={() => {}}
          onAddItem={() => {}}
          onRemoveItem={(intention) => {
            const updatedIntentions = engagementIntentions.filter(item => item !== intention);
            onEngagementIntentionsChange(updatedIntentions);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
