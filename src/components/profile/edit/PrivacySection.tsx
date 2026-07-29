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
            <Label htmlFor="account_visibility">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Let people who are not signed in to DNA see your profile.
            </p>
          </div>
          <Switch
            id="account_visibility"
            checked={formData.account_visibility === 'public'}
            onCheckedChange={(checked) => onUpdate('account_visibility', checked ? 'public' : 'private')}
            disabled={disabled}
          />
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {formData.account_visibility === 'public' ? (
              <>
                <strong className="text-foreground">Your profile is public.</strong> Anyone on the web can find and view it. DNA Members can always find you.
              </>
            ) : (
              <>
                <strong className="text-foreground">Your profile is hidden from the public web.</strong> Only signed-in DNA Members can find and view you.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PrivacySection;
