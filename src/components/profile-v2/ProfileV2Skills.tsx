import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, X, Loader2, Check, Wrench } from 'lucide-react';
import { ProfileV2Tags, ProfileV2Visibility } from '@/types/profileV2';
import { Input } from '@/components/ui/input';

interface ProfileV2SkillsProps {
  tags: ProfileV2Tags;
  visibility: ProfileV2Visibility;
  isOwner: boolean;
  onUpdate?: (skills: string[]) => Promise<void>;
}

const ProfileV2Skills: React.FC<ProfileV2SkillsProps> = ({
  tags,
  visibility,
  isOwner,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>(tags.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hide if visibility is set to hidden and viewer is not owner
  if (visibility.skills === 'hidden' && !isOwner) {
    return null;
  }

  const hasSkills = (tags.skills || []).length > 0;

  // Hide empty section for public viewers
  if (!hasSkills && !isOwner) {
    return null;
  }

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(skillsList);
      setIsEditing(false);
    } catch (error) {
      // Failed to update skills
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSkillsList(tags.skills || []);
    setNewSkill('');
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Skills & Expertise
        </CardTitle>
        {isOwner && !isEditing && onUpdate && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit skills</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill..."
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {skillsList.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No skills added yet</p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Primary sectors — large Forest chips */}
            {(tags.industries || tags.professional_sectors || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(tags.industries || tags.professional_sectors || []).slice(0, 1).map((sector, idx) => (
                  <Badge key={`primary-${idx}`} className="bg-dna-forest text-white rounded-full px-3 py-1 text-sm">
                    {sector}
                  </Badge>
                ))}
                {(tags.industries || tags.professional_sectors || []).slice(1).map((sector, idx) => (
                  <Badge key={`secondary-${idx}`} variant="outline" className="border-dna-forest text-dna-forest rounded-full text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            )}

            {/* Focus areas — Forest outline */}
            {(tags.focus_areas || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.focus_areas?.map((area, idx) => (
                  <Badge key={idx} variant="outline" className="border-dna-forest text-dna-forest rounded-full text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}

            {/* Skills — small muted chips */}
            {hasSkills ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.skills?.map((skill, idx) => (
                  <Badge key={idx} className="bg-muted text-foreground rounded-full text-xs font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors"
                >
                  <p className="text-muted-foreground italic text-sm">
                    💪 Add skills to showcase your expertise and get better matches.
                  </p>
                </button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Skills;
