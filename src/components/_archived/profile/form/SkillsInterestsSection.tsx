
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ArrayFieldManager from './ArrayFieldManager';

interface SkillsInterestsSectionProps {
  skills: string[];
  interests: string[];
  professionalSectors: string[];
  newSkill: string;
  newInterest: string;
  newSector: string;
  onSkillChange: (value: string) => void;
  onInterestChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onAddSkill: () => void;
  onAddInterest: () => void;
  onAddSector: () => void;
  onRemoveSkill: (skill: string) => void;
  onRemoveInterest: (interest: string) => void;
  onRemoveSector: (sector: string) => void;
}

const SkillsInterestsSection: React.FC<SkillsInterestsSectionProps> = ({
  skills,
  interests,
  professionalSectors,
  newSkill,
  newInterest,
  newSector,
  onSkillChange,
  onInterestChange,
  onSectorChange,
  onAddSkill,
  onAddInterest,
  onAddSector,
  onRemoveSkill,
  onRemoveInterest,
  onRemoveSector,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Skills & Interests</CardTitle>
        <CardDescription>Your professional skills and personal interests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ArrayFieldManager
          label="Skills"
          items={skills}
          newItem={newSkill}
          placeholder="Technical writing, project management, data analysis..."
          badgeColor="text-dna-emerald border-dna-emerald"
          onNewItemChange={onSkillChange}
          onAddItem={onAddSkill}
          onRemoveItem={onRemoveSkill}
        />

        <ArrayFieldManager
          label="Interests"
          items={interests}
          newItem={newInterest}
          placeholder="Education, healthcare, sustainable development..."
          badgeColor="text-dna-copper border-dna-copper"
          onNewItemChange={onInterestChange}
          onAddItem={onAddInterest}
          onRemoveItem={onRemoveInterest}
        />

        <ArrayFieldManager
          label="Professional Sectors"
          items={professionalSectors}
          newItem={newSector}
          placeholder="Technology, finance, healthcare, education..."
          badgeColor="text-dna-forest border-dna-forest"
          onNewItemChange={onSectorChange}
          onAddItem={onAddSector}
          onRemoveItem={onRemoveSector}
        />
      </CardContent>
    </Card>
  );
};

export default SkillsInterestsSection;
