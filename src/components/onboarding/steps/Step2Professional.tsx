import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import IndustryAutocomplete from '@/components/onboarding/IndustryAutocomplete';
import SkillsAutocomplete from '@/components/onboarding/SkillsAutocomplete';

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Professional: React.FC<Step2Props> = ({ data, onChange, onNext, onBack }) => {
  const canProceed = data.profession && data.selected_skills?.length >= 3;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Your professional background</h2>
        <p className="text-muted-foreground mt-2">
          Help organizations find you based on your expertise
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Current Role/Profession *</Label>
          <Input
            value={data.profession || ''}
            onChange={(e) => onChange({ ...data, profession: e.target.value })}
            placeholder="e.g., Software Engineer, Healthcare Consultant"
          />
        </div>

        <div>
          <Label>Years of Experience</Label>
          <Input
            type="number"
            value={data.years_of_experience || ''}
            onChange={(e) => onChange({ ...data, years_of_experience: parseInt(e.target.value) || null })}
            placeholder="Total years of professional experience"
          />
        </div>

        <IndustryAutocomplete
          selectedIndustries={data.industry_sectors || []}
          onChange={(industries) => onChange({ ...data, industry_sectors: industries })}
        />

        <SkillsAutocomplete
          selectedSkillIds={data.selected_skills || []}
          onChange={(skillIds) => onChange({ ...data, selected_skills: skillIds })}
        />

        <div>
          <Label>LinkedIn Profile</Label>
          <Input
            value={data.linkedin_url || ''}
            onChange={(e) => onChange({ ...data, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <Label>Personal Website</Label>
          <Input
            value={data.website_url || ''}
            onChange={(e) => onChange({ ...data, website_url: e.target.value })}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">
          Continue to Causes
        </Button>
      </div>
    </div>
  );
};
