import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, Eye, EyeOff, Globe, Lock, Info, Share2, Copy, ExternalLink } from 'lucide-react';
import { PublicVisibilitySettings, DEFAULT_PUBLIC_VISIBILITY } from '@/types/profileV2';
import { ROUTES, getProfileShareUrl } from '@/config/routes';
import { getErrorMessage } from '@/lib/errorLogger';

export default function PrivacySettings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPublic, setIsPublic] = useState(false);
  const [allowProfileSharing, setAllowProfileSharing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicVisibility, setPublicVisibility] = useState<PublicVisibilitySettings>(DEFAULT_PUBLIC_VISIBILITY);

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public || false);
      setAllowProfileSharing(profile.allow_profile_sharing !== false);
      // Load per-field visibility settings from profile (cast to any to access JSONB field)
      const profileVisibility = (profile as any).public_visibility;
      if (profileVisibility) {
        setPublicVisibility({
          ...DEFAULT_PUBLIC_VISIBILITY,
          ...(typeof profileVisibility === 'object' ? profileVisibility : {}),
        } as PublicVisibilitySettings);
      }
    }
  }, [profile]);

  // Copy profile URL to clipboard
  const handleCopyProfileUrl = async () => {
    if (!profile?.username) return;
    try {
      await navigator.clipboard.writeText(getProfileShareUrl(profile.username));
      toast({
        title: 'Copied!',
        description: 'Profile URL copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  // Handle per-field visibility change
  const handleVisibilityFieldChange = async (field: keyof PublicVisibilitySettings, checked: boolean) => {
    const newVisibility = { ...publicVisibility, [field]: checked };
    setPublicVisibility(newVisibility);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          public_visibility: newVisibility,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });

      toast({
        title: 'Visibility updated',
        description: `${field.replace(/_/g, ' ')} is now ${checked ? 'visible' : 'hidden'} on your public profile`,
      });
    } catch (error: unknown) {
      // Revert on error
      setPublicVisibility({ ...publicVisibility, [field]: !checked });
      toast({
        title: 'Error updating visibility',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

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
    } catch (error: unknown) {
      setIsPublic(!checked); // Revert on error
      toast({
        title: 'Error updating privacy',
        description: getErrorMessage(error),
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
    } catch (error: unknown) {
      setAllowProfileSharing(!checked); // Revert on error
      toast({
        title: 'Error updating setting',
        description: getErrorMessage(error),
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

        {/* Public Profile URL */}
        {profile?.username && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Your Public Profile
              </CardTitle>
              <CardDescription>
                Share your profile with others using this link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="text-sm flex-1 truncate">
                  {getProfileShareUrl(profile.username)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProfileUrl}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <a
                    href={ROUTES.profile.view(profile.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Per-Field Visibility Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Public Profile Visibility
            </CardTitle>
            <CardDescription>
              Choose what visitors can see on your public profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Always Required Fields */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Always Visible (Required)</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Full name and username</p>
              </div>
            </div>

            <Separator />

            {/* Configurable Fields */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Choose what to show</h4>

              {/* Avatar */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_avatar" className="font-normal">Profile photo</Label>
                </div>
                <Switch
                  id="vis_avatar"
                  checked={publicVisibility.avatar}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('avatar', checked)}
                  disabled={saving}
                />
              </div>

              {/* Headline & Bio */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_headline" className="font-normal">Headline & bio</Label>
                </div>
                <Switch
                  id="vis_headline"
                  checked={publicVisibility.headline && publicVisibility.bio}
                  onCheckedChange={(checked) => {
                    handleVisibilityFieldChange('headline', checked);
                    handleVisibilityFieldChange('bio', checked);
                  }}
                  disabled={saving}
                />
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_location" className="font-normal">Location</Label>
                </div>
                <Switch
                  id="vis_location"
                  checked={publicVisibility.location}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('location', checked)}
                  disabled={saving}
                />
              </div>

              {/* Heritage */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_heritage" className="font-normal">Heritage / Origin countries</Label>
                </div>
                <Switch
                  id="vis_heritage"
                  checked={publicVisibility.heritage}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('heritage', checked)}
                  disabled={saving}
                />
              </div>

              {/* Industry & Company */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_industry" className="font-normal">Industry & company</Label>
                </div>
                <Switch
                  id="vis_industry"
                  checked={publicVisibility.industry && publicVisibility.company}
                  onCheckedChange={(checked) => {
                    handleVisibilityFieldChange('industry', checked);
                    handleVisibilityFieldChange('company', checked);
                  }}
                  disabled={saving}
                />
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_linkedin" className="font-normal">LinkedIn profile link</Label>
                </div>
                <Switch
                  id="vis_linkedin"
                  checked={publicVisibility.linkedin_url}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('linkedin_url', checked)}
                  disabled={saving}
                />
              </div>

              {/* Website */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_website" className="font-normal">Personal website</Label>
                </div>
                <Switch
                  id="vis_website"
                  checked={publicVisibility.website_url}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('website_url', checked)}
                  disabled={saving}
                />
              </div>

              {/* Connection Count */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_connections" className="font-normal">Connection count</Label>
                </div>
                <Switch
                  id="vis_connections"
                  checked={publicVisibility.connection_count}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('connection_count', checked)}
                  disabled={saving}
                />
              </div>

              {/* Event Count */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_events" className="font-normal">Events attended count</Label>
                </div>
                <Switch
                  id="vis_events"
                  checked={publicVisibility.event_count}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('event_count', checked)}
                  disabled={saving}
                />
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_member_since" className="font-normal">Member since date</Label>
                </div>
                <Switch
                  id="vis_member_since"
                  checked={publicVisibility.member_since}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('member_since', checked)}
                  disabled={saving}
                />
              </div>

              <Separator />

              {/* Opt-in Fields (hidden by default) */}
              <h4 className="font-medium text-sm text-amber-700 dark:text-amber-400">
                Contact Information (Hidden by Default)
              </h4>

              {/* Email */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_email" className="font-normal">Email address</Label>
                  <p className="text-xs text-muted-foreground">Only visible if you opt-in</p>
                </div>
                <Switch
                  id="vis_email"
                  checked={publicVisibility.email}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('email', checked)}
                  disabled={saving}
                />
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vis_phone" className="font-normal">Phone number</Label>
                  <p className="text-xs text-muted-foreground">Only visible if you opt-in</p>
                </div>
                <Switch
                  id="vis_phone"
                  checked={publicVisibility.phone}
                  onCheckedChange={(checked) => handleVisibilityFieldChange('phone', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
