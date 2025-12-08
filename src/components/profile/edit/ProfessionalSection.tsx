import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { ProfileEditSectionProps } from './types';

export function ProfessionalSection({
  formData,
  onUpdate,
  errors = {},
  disabled = false,
}: ProfileEditSectionProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      onUpdate('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    onUpdate('skills', formData.skills.filter((s: string) => s !== skill));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      onUpdate('interests', [...formData.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    onUpdate('interests', formData.interests.filter((i: string) => i !== interest));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              placeholder="e.g., Software Engineer"
              value={formData.profession || ''}
              onChange={(e) => onUpdate('profession', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g., Tech Company Inc."
              value={formData.company || ''}
              onChange={(e) => onUpdate('company', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="years_experience">Years of Experience</Label>
          <Input
            id="years_experience"
            type="number"
            min="0"
            value={formData.years_experience || 0}
            onChange={(e) => onUpdate('years_experience', parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-32"
          />
        </div>

        <div>
          <Label>Skills</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add skills to help others find and connect with you
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., Product Management)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              disabled={disabled}
            />
            <Button type="button" onClick={addSkill} size="sm" disabled={disabled}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary">
                {skill}
                <button
                  type="button"
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  onClick={() => removeSkill(skill)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          {errors.skills && (
            <p className="text-sm text-destructive mt-1">{errors.skills}</p>
          )}
        </div>

        <div>
          <Label>Interests</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add interests to discover like-minded community members
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest (e.g., Impact Investing)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              disabled={disabled}
            />
            <Button type="button" onClick={addInterest} size="sm" disabled={disabled}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests?.map((interest: string) => (
              <Badge key={interest} variant="secondary">
                {interest}
                <button
                  type="button"
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  onClick={() => removeInterest(interest)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          {errors.interests && (
            <p className="text-sm text-destructive mt-1">{errors.interests}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfessionalSection;
