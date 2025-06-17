
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AdditionalInfoSectionProps {
  formData: {
    innovation_pathways: string;
    achievements: string;
    certifications: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="innovation_pathways">Innovation Pathways & Impact</Label>
          <Textarea
            id="innovation_pathways"
            value={formData.innovation_pathways}
            onChange={(e) => onInputChange('innovation_pathways', e.target.value)}
            placeholder="Describe your innovation journey and impact..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="achievements">Key Achievements</Label>
          <Textarea
            id="achievements"
            value={formData.achievements}
            onChange={(e) => onInputChange('achievements', e.target.value)}
            placeholder="Notable achievements, awards, recognitions..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="certifications">Certifications</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => onInputChange('certifications', e.target.value)}
            placeholder="Professional certifications..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
