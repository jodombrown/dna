
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillSelect: (skill: string) => void;
}

const skillsOptions = [
  'Software Development',
  'Data Science',
  'Project Management',
  'Marketing',
  'Finance',
  'Design',
  'Sales',
  'Human Resources'
];

const SkillsSelector: React.FC<SkillsSelectorProps> = ({ selectedSkills, onSkillSelect }) => {
  return (
    <div>
      <Label>Skills</Label>
      <div className="flex flex-wrap gap-2">
        {skillsOptions.map(skill => (
          <Badge
            key={skill}
            variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedSkills.includes(skill) ? 'bg-dna-emerald text-white hover:bg-dna-forest' : ''}`}
            onClick={() => onSkillSelect(skill)}
          >
            {skill}
            {selectedSkills.includes(skill) && <X className="ml-1 w-3 h-3" />}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillsSelector;
