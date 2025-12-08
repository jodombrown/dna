import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, X, HandHeart, Loader2, Check } from 'lucide-react';
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

  const allContributions = [...(tags.contribution_tags || []), ...(tags.available_for || [])];
  const hasContributions = allContributions.length > 0;

  // Hide empty section for public viewers
  if (!hasContributions && !isOwner) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <HandHeart className="w-5 h-5 text-primary" />
          Ways I Can Help
        </CardTitle>
        {isOwner && !isEditing && onUpdate && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit contributions</span>
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
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleAddContribution} disabled={!newContribution.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {contributionsList.map((contribution, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 pr-1 bg-accent">
                  {contribution}
                  <button
                    onClick={() => handleRemoveContribution(contribution)}
                    className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {contributionsList.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No contributions added yet</p>
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
          <div className="flex flex-wrap gap-2">
            {hasContributions ? (
              allContributions.map((contribution, idx) => (
                <Badge key={idx} variant="secondary" className="bg-accent/50 text-xs sm:text-sm">
                  {String(contribution)}
                </Badge>
              ))
            ) : (
              isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors"
                >
                  <p className="text-muted-foreground italic text-sm">
                    🤝 Let others know how you can help in the community.
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

export default ProfileV2Contributions;
