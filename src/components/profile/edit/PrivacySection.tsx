import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProfileEditSectionProps } from './types';

export function PrivacySection({
  formData,
  onUpdate,
  disabled = false,
}: ProfileEditSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Control who can see your profile
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_public">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Make your profile visible to other DNA members
            </p>
          </div>
          <Switch
            id="is_public"
            checked={formData.is_public}
            onCheckedChange={(checked) => onUpdate('is_public', checked)}
            disabled={disabled}
          />
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {formData.is_public ? (
              <>
                <strong className="text-foreground">Your profile is public.</strong> Other DNA members can discover you through search and recommendations.
              </>
            ) : (
              <>
                <strong className="text-foreground">Your profile is private.</strong> Only you can see your full profile. Other members will see "This profile is private" when they visit.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PrivacySection;
