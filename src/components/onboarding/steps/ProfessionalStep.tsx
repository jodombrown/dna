
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ProfessionalStepProps {
  data: any;
  updateData: (data: any) => void;
}

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Agriculture', 'Energy', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Non-profit', 'Government', 'Other'
];

const COMMON_SKILLS = [
  'Leadership', 'Project Management', 'Data Analysis', 'Marketing',
  'Software Development', 'Finance', 'Strategy', 'Operations',
  'Business Development', 'Design', 'Research', 'Sales'
];

const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ data, updateData }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      updateData({ skills: [...data.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateData({ skills: data.skills.filter((skill: string) => skill !== skillToRemove) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Professional Background</h3>
        <p className="text-gray-600">Share your expertise and experience</p>
      </div>

      {/* Industry */}
      <div>
        <Label>Industry *</Label>
        <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Role */}
      <div>
        <Label htmlFor="current-role">Current Role *</Label>
        <Input
          id="current-role"
          value={data.current_role}
          onChange={(e) => updateData({ current_role: e.target.value })}
          placeholder="e.g., Software Engineer, Marketing Manager"
        />
      </div>

      {/* Years of Experience */}
      <div>
        <Label htmlFor="years-experience">Years of Experience</Label>
        <Input
          id="years-experience"
          type="number"
          min="0"
          max="50"
          value={data.years_experience}
          onChange={(e) => updateData({ years_experience: parseInt(e.target.value) || 0 })}
          placeholder="Years of professional experience"
        />
      </div>

      {/* Skills */}
      <div>
        <Label>Skills *</Label>
        <div className="space-y-3">
          {/* Quick Add Common Skills */}
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.filter(skill => !data.skills.includes(skill)).map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => addSkill(skill)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {skill}
              </Button>
            ))}
          </div>

          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a custom skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
            />
            <Button onClick={() => addSkill(newSkill)} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="bg-dna-mint text-dna-forest">
                {skill}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* LinkedIn URL */}
      <div>
        <Label htmlFor="linkedin-url">LinkedIn URL</Label>
        <Input
          id="linkedin-url"
          value={data.linkedin_url}
          onChange={(e) => updateData({ linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  );
};

export default ProfessionalStep;
