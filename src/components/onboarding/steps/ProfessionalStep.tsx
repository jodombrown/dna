import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';
import { AlertCircle } from 'lucide-react';

const SECTOR_OPTIONS = [
  'Technology & Innovation',
  'Healthcare & Medical',
  'Finance & Banking',
  'Education & Research',
  'Agriculture & Food Systems',
  'Energy & Sustainability',
  'Arts & Creative Industries',
  'Legal & Policy',
  'Manufacturing & Industry',
  'Real Estate & Construction',
  'Transportation & Logistics',
  'Media & Communications',
  'Non-Profit & Social Impact',
  'Tourism & Hospitality',
  'Retail & E-Commerce'
];

const SKILL_OPTIONS = [
  'Software Development',
  'Data Science & Analytics',
  'Product Management',
  'Business Strategy',
  'Marketing & Branding',
  'Sales & Business Development',
  'Financial Analysis',
  'Project Management',
  'UX/UI Design',
  'Content Creation',
  'Public Speaking',
  'Research & Analysis',
  'Leadership & Management',
  'Fundraising',
  'Community Building'
];

interface ProfessionalStepProps {
  data: {
    profession: string;
    professional_role: string;
    professional_sectors: string[];
    skills: string[];
    years_experience: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-dna-forest">Your Professional Identity</h2>
        <p className="text-muted-foreground">
          Help us understand your expertise and how you can contribute to the network.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Profession/Role */}
          <div className="space-y-2">
            <Label htmlFor="profession">Primary Profession or Role *</Label>
            <Input
              id="profession"
              value={data.profession}
              onChange={(e) => onUpdate('profession', e.target.value)}
              placeholder="e.g., Software Engineer, Entrepreneur, Consultant"
              className={errors.profession ? 'border-destructive' : ''}
            />
            {errors.profession && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.profession}
              </p>
            )}
          </div>

          {/* Sectors */}
          <div className="space-y-2">
            <TagMultiSelect
              label="Professional Sectors *"
              options={SECTOR_OPTIONS}
              selected={data.professional_sectors}
              onChange={(value) => onUpdate('professional_sectors', value)}
              placeholder="Select or type your sectors (at least 1)"
              colorClass="bg-dna-copper/10 text-dna-copper border-dna-copper/20"
            />
            <p className="text-xs text-muted-foreground">
              Select from the list or type your own sectors where you have experience
            </p>
            {errors.professional_sectors && (
              <p className="text-sm text-destructive">{errors.professional_sectors}</p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <TagMultiSelect
              label="Core Skills *"
              options={SKILL_OPTIONS}
              selected={data.skills}
              onChange={(value) => onUpdate('skills', value)}
              placeholder="Select or type your skills (at least 1)"
              colorClass="bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20"
            />
            <p className="text-xs text-muted-foreground">
              Select from the list or type your own skills you're strongest in or most passionate about
            </p>
            {errors.skills && (
              <p className="text-sm text-destructive">{errors.skills}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of Experience *</Label>
            <Select
              value={data.years_experience}
              onValueChange={(value) => onUpdate('years_experience', value)}
            >
              <SelectTrigger className={errors.years_experience ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="11-15">11-15 years</SelectItem>
                <SelectItem value="16+">16+ years</SelectItem>
              </SelectContent>
            </Select>
            {errors.years_experience && (
              <p className="text-sm text-destructive">{errors.years_experience}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalStep;
