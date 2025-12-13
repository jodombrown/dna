import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, Eye, EyeOff, Globe, Lock, Info, Share2 } from 'lucide-react';

export default function PrivacySettings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPublic, setIsPublic] = useState(false);
  const [allowProfileSharing, setAllowProfileSharing] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public || false);
      setAllowProfileSharing(profile.allow_profile_sharing !== false);
    }
  }, [profile]);

  const handleVisibilityChange = async (checked: boolean) => {
    setSaving(true);
    setIsPublic(checked);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_public: checked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });

      toast({
        title: checked ? 'Profile is now public' : 'Profile is now private',
        description: checked
          ? 'Other DNA members can now discover and view your profile.'
          : 'Your profile is now hidden from other members.',
      });
    } catch (error: any) {
      setIsPublic(!checked); // Revert on error
      toast({
        title: 'Error updating privacy',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSharingChange = async (checked: boolean) => {
    setSaving(true);
    setAllowProfileSharing(checked);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          allow_profile_sharing: checked,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });

      toast({
        title: checked ? 'Profile sharing enabled' : 'Profile sharing disabled',
        description: checked
          ? 'Other users can now share your profile with their network.'
          : 'Other users can no longer share your profile.',
      });
    } catch (error: any) {
      setAllowProfileSharing(!checked); // Revert on error
      toast({
        title: 'Error updating setting',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Privacy Settings" description="Control who can see your profile">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Privacy Settings"
      description="Control who can see your profile"
    >
      <div className="space-y-6">
        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              Profile Visibility
            </CardTitle>
            <CardDescription>
              Choose whether your profile is visible to other DNA members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_public" className="text-base font-medium">
                  Public Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile can be discovered and viewed by other members
                </p>
              </div>
              <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={handleVisibilityChange}
                disabled={saving}
              />
            </div>

            {/* Status indicator */}
            <div className={`p-4 rounded-lg ${isPublic ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' : 'bg-muted border'}`}>
              <div className="flex items-start gap-3">
                {isPublic ? (
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${isPublic ? 'text-green-800 dark:text-green-200' : 'text-foreground'}`}>
                    {isPublic ? 'Your profile is public' : 'Your profile is private'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isPublic
                      ? 'Other DNA members can find you through search and discovery, and view your full profile.'
                      : 'Only you can see your profile. Others will see "This profile is private" when they visit.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Sharing by Others */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Profile Sharing
            </CardTitle>
            <CardDescription>
              Control whether other users can share your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow_sharing" className="text-base font-medium">
                  Allow Others to Share My Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, other users can share your profile via social media, copy link, or download PDF
                </p>
              </div>
              <Switch
                id="allow_sharing"
                checked={allowProfileSharing}
                onCheckedChange={handleSharingChange}
                disabled={saving}
              />
            </div>

            {/* Status indicator */}
            <div className={`p-4 rounded-lg ${allowProfileSharing ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' : 'bg-muted border'}`}>
              <div className="flex items-start gap-3">
                {allowProfileSharing ? (
                  <Share2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${allowProfileSharing ? 'text-green-800 dark:text-green-200' : 'text-foreground'}`}>
                    {allowProfileSharing ? 'Profile sharing is enabled' : 'Profile sharing is disabled'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {allowProfileSharing
                      ? 'Other DNA members can share your profile with their connections via social media, WhatsApp, LinkedIn, or download your profile as a PDF.'
                      : 'The share button is hidden when others view your profile. Only you can share your own profile.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Visible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What Others Can See
            </CardTitle>
            <CardDescription>
              Understanding what information is shared when your profile is public
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                  Visible on Public Profile
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Name and profile photo</li>
                  <li>• Headline and bio</li>
                  <li>• Current country and country of origin</li>
                  <li>• Skills and interests</li>
                  <li>• Focus areas and expertise</li>
                  <li>• Social links (LinkedIn, Twitter, Website)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 text-amber-700 dark:text-amber-400">
                  Always Private
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• Notification preferences</li>
                  <li>• Account settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future: Per-field visibility (V1) */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Coming soon:</strong> Per-field visibility controls will let you choose exactly which parts of your profile to show publicly.
          </AlertDescription>
        </Alert>
      </div>
    </SettingsLayout>
  );
}
