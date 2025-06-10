
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactLinksSectionProps {
  formData: {
    linkedin_url: string;
    website_url: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const ContactLinksSection: React.FC<ContactLinksSectionProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Contact & Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={(e) => onInputChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div>
          <Label htmlFor="website_url">Website/Portfolio</Label>
          <Input
            id="website_url"
            value={formData.website_url}
            onChange={(e) => onInputChange('website_url', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactLinksSection;
