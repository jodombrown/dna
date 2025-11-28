import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, X, Check } from 'lucide-react';
import { ProfileV2Data, ProfileV2Visibility } from '@/types/profileV2';

interface ProfileV2AboutProps {
  profile: ProfileV2Data;
  visibility: ProfileV2Visibility;
  isOwner: boolean;
  onUpdate?: (bio: string) => Promise<void>;
}

const ProfileV2About: React.FC<ProfileV2AboutProps> = ({
  profile,
  visibility,
  isOwner,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bioValue, setBioValue] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (visibility.about === 'hidden' && !isOwner) {
    return null;
  }

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(bioValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBioValue(profile.bio || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">About</CardTitle>
        {isOwner && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              placeholder="Share your story, values, and what drives your impact..."
              rows={6}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-foreground whitespace-pre-wrap">
            {profile.bio || (
              isOwner ? (
                <p className="text-muted-foreground italic">
                  Add your story to help others understand your journey and impact.
                </p>
              ) : (
                <p className="text-muted-foreground italic">No bio yet</p>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2About;
