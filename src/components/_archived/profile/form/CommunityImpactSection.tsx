
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CommunityImpactSectionProps {
  formData: {
    community_involvement: string;
    giving_back_initiatives: string;
    home_country_projects: string;
    volunteer_experience: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const CommunityImpactSection: React.FC<CommunityImpactSectionProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Community Impact & Giving Back</CardTitle>
        <CardDescription>Your contributions to diaspora and home country communities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="community_involvement">Community Involvement</Label>
          <Textarea
            id="community_involvement"
            value={formData.community_involvement}
            onChange={(e) => onInputChange('community_involvement', e.target.value)}
            placeholder="Describe your involvement in diaspora or local communities..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="giving_back_initiatives">Giving Back Initiatives</Label>
          <Textarea
            id="giving_back_initiatives"
            value={formData.giving_back_initiatives}
            onChange={(e) => onInputChange('giving_back_initiatives', e.target.value)}
            placeholder="Projects or initiatives focused on giving back to your home country or diaspora community..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="home_country_projects">Home Country Projects</Label>
          <Textarea
            id="home_country_projects"
            value={formData.home_country_projects}
            onChange={(e) => onInputChange('home_country_projects', e.target.value)}
            placeholder="Specific projects or contributions to home country development..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="volunteer_experience">Volunteer Experience</Label>
          <Textarea
            id="volunteer_experience"
            value={formData.volunteer_experience}
            onChange={(e) => onInputChange('volunteer_experience', e.target.value)}
            placeholder="Volunteer work within diaspora or home country communities..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityImpactSection;
