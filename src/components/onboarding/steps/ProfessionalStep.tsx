import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ProfessionalStepProps {
  data: any;
  updateData: (data: any) => void;
}

const COMMON_SKILLS = [
  'Leadership', 'Project Management', 'Data Analysis', 'Marketing',
  'Software Development', 'Finance', 'Strategy', 'Operations',
  'Business Development', 'Design', 'Research', 'Sales'
];

const SECTORS = [
  'Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture',
  'Energy', 'Infrastructure', 'Arts & Culture', 'Media', 'Government',
  'Non-profit', 'Research', 'Environment', 'Tourism', 'Manufacturing'
];

const CONTRIBUTION_TYPES = ['Mentor', 'Collaborate', 'Fund', 'Build'];

const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ data, updateData }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (skill: string) => {
    if (skill && !data.skills?.includes(skill)) {
      updateData({ skills: [...(data.skills || []), skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateData({ 
      skills: data.skills?.filter((skill: string) => skill !== skillToRemove) || []
    });
  };

  const addSector = (sector: string) => {
    if (sector && !data.sectors?.includes(sector)) {
      updateData({ sectors: [...(data.sectors || []), sector] });
    }
  };

  const removeSector = (sectorToRemove: string) => {
    updateData({ 
      sectors: data.sectors?.filter((sector: string) => sector !== sectorToRemove) || []
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Your Skills & Contribution Style</h3>
        <p className="text-gray-600">Tell us about your expertise and how you want to contribute</p>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <Label>Your Skills *</Label>
        
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
            placeholder="Add a skill..."
            className="flex-1"
          />
          <Button 
            type="button"
            onClick={() => addSkill(newSkill)}
            disabled={!newSkill.trim()}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_SKILLS.filter(skill => !data.skills?.includes(skill)).map((skill) => (
            <Button
              key={skill}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSkill(skill)}
              className="text-xs hover:bg-dna-mint hover:text-dna-forest"
            >
              + {skill}
            </Button>
          ))}
        </div>

        {data.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="bg-dna-emerald text-white">
                {skill}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 h-auto p-0 text-white hover:text-red-200"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Sectors of Interest */}
      <div className="space-y-3">
        <Label>Sectors of Interest *</Label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SECTORS.map((sector) => (
            <Button
              key={sector}
              type="button"
              variant={data.sectors?.includes(sector) ? "default" : "outline"}
              size="sm"
              onClick={() => 
                data.sectors?.includes(sector) ? removeSector(sector) : addSector(sector)
              }
              className={data.sectors?.includes(sector) 
                ? "bg-dna-emerald text-white" 
                : "hover:bg-dna-mint hover:text-dna-forest"
              }
            >
              {sector}
            </Button>
          ))}
        </div>
      </div>

      {/* Contribution Style */}
      <div className="space-y-3">
        <Label>How do you want to contribute? *</Label>
        <div className="grid grid-cols-2 gap-3">
          {CONTRIBUTION_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant={data.contribution_style === type ? "default" : "outline"}
              onClick={() => updateData({ contribution_style: type })}
              className={data.contribution_style === type 
                ? "bg-dna-copper text-white" 
                : "hover:bg-dna-mint hover:text-dna-forest"
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStep;