
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: any;
  impactAreas: string[];
  engagementIntentions: string[];
  onInputChange: (field: string, value: string | boolean) => void;
  onImpactAreasChange: (areas: string[]) => void;
  onEngagementIntentionsChange: (intentions: string[]) => void;
}

const IMPACT_AREA_OPTIONS = [
  'Education', 'Health', 'Agriculture', 'Technology', 'Finance', 
  'Culture', 'Environment', 'Social Justice', 'Economic Development', 'Other'
];

const ENGAGEMENT_OPTIONS = ['Connect', 'Collaborate', 'Contribute'];

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  impactAreas,
  engagementIntentions,
  onInputChange,
  onImpactAreasChange,
  onEngagementIntentionsChange
}) => {
  const toggleImpactArea = (area: string) => {
    if (impactAreas.includes(area)) {
      onImpactAreasChange(impactAreas.filter(a => a !== area));
    } else {
      onImpactAreasChange([...impactAreas, area]);
    }
  };

  const toggleEngagementIntention = (intention: string) => {
    if (engagementIntentions.includes(intention)) {
      onEngagementIntentionsChange(engagementIntentions.filter(i => i !== intention));
    } else {
      onEngagementIntentionsChange([...engagementIntentions, intention]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="headline" className="text-sm font-medium text-gray-700">
              Professional Headline
            </Label>
            <Input
              id="headline"
              type="text"
              placeholder="e.g., Software Engineer | Diaspora Advocate"
              value={formData.headline}
              onChange={(e) => onInputChange('headline', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              A brief, compelling headline like LinkedIn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              Current City
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., New York"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Current Country
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., United States"
              value={formData.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
            About Me
          </Label>
          <Textarea
            id="bio"
            placeholder="Tell your story... What drives you? What's your diaspora journey?"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            className="mt-1 min-h-[120px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Share your professional background, interests, and what makes you unique
          </p>
        </div>

        <div>
          <Label htmlFor="my_dna_statement" className="text-sm font-medium text-gray-700">
            My DNA Statement
          </Label>
          <Textarea
            id="my_dna_statement"
            placeholder="What does your diaspora identity mean to you? How do you connect with your heritage?"
            value={formData.my_dna_statement}
            onChange={(e) => onInputChange('my_dna_statement', e.target.value)}
            className="mt-1 min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            A personal statement about your diaspora journey and cultural identity
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Impact Areas I Care About
          </Label>
          <div className="flex flex-wrap gap-2">
            {IMPACT_AREA_OPTIONS.map((area) => (
              <Badge
                key={area}
                variant={impactAreas.includes(area) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  impactAreas.includes(area)
                    ? 'bg-dna-crimson text-white'
                    : 'hover:bg-dna-crimson/10 hover:text-dna-crimson'
                }`}
                onClick={() => toggleImpactArea(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select the areas where you want to make an impact
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How I Want to Engage
          </Label>
          <div className="flex flex-wrap gap-2">
            {ENGAGEMENT_OPTIONS.map((intention) => (
              <Badge
                key={intention}
                variant={engagementIntentions.includes(intention) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  engagementIntentions.includes(intention)
                    ? 'bg-dna-forest text-white'
                    : 'hover:bg-dna-forest/10 hover:text-dna-forest'
                }`}
                onClick={() => toggleEngagementIntention(intention)}
              >
                {intention}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Choose how you want to engage with the diaspora community
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
