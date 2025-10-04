import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'Agriculture', 'Energy', 'Manufacturing', 'Consulting',
  'Media', 'Arts & Culture', 'Government', 'Non-Profit'
];

export const Step2Professional: React.FC<Step2Props> = ({ data, onChange, onNext, onBack }) => {
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const toggleSkill = (skillId: string) => {
    const current = data.selected_skills || [];
    onChange({
      ...data,
      selected_skills: current.includes(skillId)
        ? current.filter((id: string) => id !== skillId)
        : [...current, skillId]
    });
  };

  const toggleIndustry = (industry: string) => {
    const current = data.industry_sectors || [];
    onChange({
      ...data,
      industry_sectors: current.includes(industry)
        ? current.filter((i: string) => i !== industry)
        : [...current, industry]
    });
  };

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

        <div>
          <Label>Industry Sectors</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {industries.map((industry) => (
              <Badge
                key={industry}
                variant={data.industry_sectors?.includes(industry) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleIndustry(industry)}
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Your Skills * (select at least 3)</Label>
          <div className="flex flex-wrap gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded">
            {skills.map((skill: any) => (
              <Badge
                key={skill.id}
                variant={data.selected_skills?.includes(skill.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.name}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.selected_skills?.length || 0} skills selected
          </div>
        </div>

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
