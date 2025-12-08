import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';

const SECTOR_OPTIONS = [
  'Fintech', 'Agtech', 'Healthcare', 'Education', 'Infrastructure', 
  'Energy', 'Climate', 'Manufacturing', 'Retail', 'Tech/Software',
  'Real Estate', 'Transportation', 'Media & Entertainment', 'Tourism', 'Mining',
  'Legal', 'Consulting', 'Non-Profit', 'Government', 'Arts & Culture'
] as const;

const SKILL_SUGGESTIONS = [
  'Leadership', 'Strategy', 'Product Management', 'Software Development',
  'Data Analysis', 'Marketing', 'Finance', 'Operations', 'Sales',
  'Project Management', 'Business Development', 'Research', 'Design',
  'Consulting', 'Public Speaking', 'Writing', 'Fundraising', 'Networking'
] as const;

interface ProfileEditProfessionalProps {
  profession: string;
  company: string;
  yearsExperience: number;
  skills: string[];
  professionalSectors: string[];
  onProfessionChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onYearsExperienceChange: (value: number) => void;
  onSkillsChange: (skills: string[]) => void;
  onSectorsChange: (sectors: string[]) => void;
}

const ProfileEditProfessional: React.FC<ProfileEditProfessionalProps> = ({
  profession,
  company,
  yearsExperience,
  skills,
  professionalSectors,
  onProfessionChange,
  onCompanyChange,
  onYearsExperienceChange,
  onSkillsChange,
  onSectorsChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Background</CardTitle>
        <CardDescription>Your expertise helps others find and connect with you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profession">Profession / Role</Label>
            <Input
              id="profession"
              placeholder="e.g., Software Engineer, Entrepreneur, Consultant"
              value={profession}
              onChange={(e) => onProfessionChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company">Company / Organization</Label>
            <Input
              id="company"
              placeholder="e.g., Tech Company Inc."
              value={company}
              onChange={(e) => onCompanyChange(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            type="number"
            min="0"
            max="50"
            value={yearsExperience}
            onChange={(e) => onYearsExperienceChange(parseInt(e.target.value) || 0)}
          />
        </div>

        <TagMultiSelect
          label="Skills"
          options={SKILL_SUGGESTIONS}
          selected={skills}
          onChange={onSkillsChange}
          placeholder="Select or add your skills..."
          colorClass="bg-primary/10 text-primary border-primary/20"
          allowCustom={true}
        />

        <TagMultiSelect
          label="Professional Sectors"
          options={SECTOR_OPTIONS}
          selected={professionalSectors}
          onChange={onSectorsChange}
          placeholder="Select sectors you work in..."
          colorClass="bg-secondary/50 text-secondary-foreground border-secondary"
          allowCustom={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileEditProfessional;
