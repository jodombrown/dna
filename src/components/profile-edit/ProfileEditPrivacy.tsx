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
        <CardDescription>Control who can see your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="is_public" className="flex items-center gap-2 text-base font-medium">
              {isPublic ? (
                <Eye className="h-4 w-4 text-emerald-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              Public Profile
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublic 
                ? "Your profile is visible to all DNA members and appears in search results." 
                : "Your profile is private. Only you can see it."}
            </p>
          </div>
          <Switch
            id="is_public"
            checked={isPublic}
            onCheckedChange={onIsPublicChange}
          />
        </div>

        {!isPublic && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> With a private profile, other members won't be able to find or connect with you. 
              Consider making your profile public to get the most out of DNA.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEditPrivacy;
