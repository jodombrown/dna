
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfessionalInfoSectionProps {
  formData: {
    profession: string;
    company: string;
    years_experience: string;
    education: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Professional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => onInputChange('profession', e.target.value)}
              placeholder="Software Engineer, Doctor, etc."
            />
          </div>
          <div>
            <Label htmlFor="company">Company/Organization</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => onInputChange('company', e.target.value)}
              placeholder="Company name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            type="number"
            value={formData.years_experience}
            onChange={(e) => onInputChange('years_experience', e.target.value)}
            placeholder="5"
          />
        </div>

        <div>
          <Label htmlFor="education">Education</Label>
          <Textarea
            id="education"
            value={formData.education}
            onChange={(e) => onInputChange('education', e.target.value)}
            placeholder="University, degree, certifications..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalInfoSection;
