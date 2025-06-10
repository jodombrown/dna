
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Professional Sectors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Professional Sectors</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSector}
                onChange={(e) => onSectorChange(e.target.value)}
                placeholder="Healthcare, Technology, Finance, Education..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSector())}
              />
              <Button type="button" onClick={onAddSector} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {professionalSectors.map((sector, index) => (
                <Badge key={index} variant="outline" className="text-dna-emerald border-dna-emerald">
                  {sector}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => onRemoveSector(sector)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Skills & Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => onSkillChange(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSkill())}
              />
              <Button type="button" onClick={onAddSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-dna-forest border-dna-forest">
                  {skill}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => onRemoveSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Interests</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newInterest}
                onChange={(e) => onInterestChange(e.target.value)}
                placeholder="Add an interest..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddInterest())}
              />
              <Button type="button" onClick={onAddInterest} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="text-dna-copper border-dna-copper">
                  {interest}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => onRemoveInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SkillsInterestsSection;
