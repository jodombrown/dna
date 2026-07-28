import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface ProfileEditPrivacyProps {
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
}

const ProfileEditPrivacy: React.FC<ProfileEditPrivacyProps> = ({
  isPublic,
  onIsPublicChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Control who outside DNA can see your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="account_visibility" className="flex items-center gap-2 text-body font-medium">
              {isPublic ? (
                <Eye className="h-4 w-4 text-emerald-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              Public Profile
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublic
                ? "Your profile is public. Anyone on the web can find and view it."
                : "Your profile is hidden from the public web. DNA Members can still find you."}
            </p>
          </div>
          <Switch
            id="account_visibility"
            checked={isPublic}
            onCheckedChange={onIsPublicChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditPrivacy;
