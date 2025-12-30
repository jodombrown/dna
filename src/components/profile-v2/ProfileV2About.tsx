import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, X, Check, Loader2, FileText } from 'lucide-react';
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

  // Hide if visibility is set to hidden and viewer is not owner
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
      // Failed to update bio
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBioValue(profile.bio || '');
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          About
        </CardTitle>
        {isOwner && !isEditing && onUpdate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit bio</span>
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
              rows={5}
              className="resize-none text-sm sm:text-base"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {bioValue.length}/500
              </span>
              <div className="flex gap-2">
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
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">
            {profile.bio || (
              isOwner ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors"
                >
                  <p className="text-muted-foreground italic text-sm">
                    ✨ Add your story to help others understand your journey and impact.
                  </p>
                </button>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  This member hasn't added a bio yet.
                </p>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2About;
