import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, X, Heart } from 'lucide-react';
import { ProfileV2Tags } from '@/types/profileV2';
import { Input } from '@/components/ui/input';

interface ProfileV2ContributionsProps {
  tags: ProfileV2Tags;
  isOwner: boolean;
  onUpdate?: (contributions: string[]) => Promise<void>;
}

const ProfileV2Contributions: React.FC<ProfileV2ContributionsProps> = ({
  tags,
  isOwner,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [contributionsList, setContributionsList] = useState<string[]>(
    tags.contribution_tags?.map(String) || []
  );
  const [newContribution, setNewContribution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddContribution = () => {
    const trimmed = newContribution.trim();
    if (trimmed && !contributionsList.includes(trimmed)) {
      setContributionsList([...contributionsList, trimmed]);
      setNewContribution('');
    }
  };

  const handleRemoveContribution = (contribution: string) => {
    setContributionsList(contributionsList.filter(c => c !== contribution));
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(contributionsList);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update contributions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContributionsList(tags.contribution_tags?.map(String) || []);
    setNewContribution('');
    setIsEditing(false);
  };

  const hasContributions = (tags.contribution_tags || []).length > 0 || (tags.available_for || []).length > 0;

  if (!hasContributions && !isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">Ways I Can Help</CardTitle>
        </div>
        {isOwner && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddContribution();
                  }
                }}
                placeholder="e.g., Mentoring, Making introductions..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddContribution} disabled={!newContribution.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {contributionsList.map((contribution, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 bg-accent">
                  {contribution}
                  <button
                    onClick={() => handleRemoveContribution(contribution)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...(tags.contribution_tags || []), ...(tags.available_for || [])].length > 0 ? (
              [...(tags.contribution_tags || []), ...(tags.available_for || [])].map((contribution, idx) => (
                <Badge key={idx} variant="secondary" className="bg-accent/50">
                  {String(contribution)}
                </Badge>
              ))
            ) : (
              isOwner && (
                <p className="text-muted-foreground italic text-sm">
                  Let others know how you can help in the community.
                </p>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Contributions;
