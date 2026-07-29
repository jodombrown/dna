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
import { ThresholdConsentDialog } from '@/components/profile/ThresholdConsentDialog';

/** Summary of the consent set. Values live inside the CHECK constraint set:
 *  'name', 'avatar', 'headline', 'role', 'place'. Enumerate the actual fields
 *  rather than bucketing them, so the sentence is never false. */
const THRESHOLD_LABELS: Array<[string, string]> = [
  ['name', 'name'],
  ['avatar', 'photo'],
  ['headline', 'headline'],
  ['role', 'role'],
  ['place', 'place'],
];

function thresholdSummary(fields: string[] | null | undefined): string {
  const set = new Set(fields ?? []);
  const labels = THRESHOLD_LABELS.filter(([key]) => set.has(key)).map(([, label]) => label);
  if (labels.length === 0) return 'just your handle';
  if (labels.length === 1) return `your handle plus ${labels[0]}`;
  return `your handle plus ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isPublic, setIsPublic] = useState(false);
  const [allowProfileSharing, setAllowProfileSharing] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [thresholdReadOnly, setThresholdReadOnly] = useState(false);
  const [savedThresholdFields, setSavedThresholdFields] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.account_visibility === 'public');
      setAllowProfileSharing(profile.allow_profile_sharing !== false);
      const fields = (profile as { threshold_fields?: string[] | null }).threshold_fields ?? [];
      setSavedThresholdFields(fields);
      // threshold_fields is recorded by ThresholdConsentDialog, not here.
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




  // account_visibility is written straight away either way. Going private then
  // asks the threshold question, which writes threshold_fields on its own.
  const handleVisibilityChange = async (checked: boolean) => {
    setSaving(true);
    setIsPublic(checked);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_visibility: checked ? 'public' : 'private',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });

      toast({
        title: checked ? 'Profile is now public' : 'Profile is now private',
        description: checked
          ? 'Your profile is now visible on the public web.'
          : 'Your profile is now hidden from the public web. DNA Members can still find you.',
      });

      if (!checked) {
        setThresholdReadOnly(false);
        setThresholdDialogOpen(true);
      }
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
              Control who outside DNA can see your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="account_visibility" className="text-body font-medium">
                  Public Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  Let people who are not signed in to DNA see your profile.
                </p>
              </div>
              <Switch
                id="account_visibility"
                checked={isPublic}
                onCheckedChange={handleVisibilityChange}
                disabled={saving}
              />
            </div>

            {!isPublic && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Visitors see: {thresholdSummary(savedThresholdFields)}</span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => {
                    setThresholdReadOnly(false);
                    setThresholdDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setThresholdReadOnly(true);
                    setThresholdDialogOpen(true);
                  }}
                >
                  Preview as visitor
                </Button>
              </div>
            )}

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
                    {isPublic ? 'Your profile is public' : 'Your profile is hidden from the public web'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isPublic
                      ? 'Anyone on the web can find and view it. DNA Members can always find you.'
                      : 'Only signed-in DNA Members can find and view you.'}
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
      </div>


      <ThresholdConsentDialog
        open={thresholdDialogOpen}
        onOpenChange={setThresholdDialogOpen}
        readOnly={thresholdReadOnly}
        profile={
          profile
            ? {
                id: profile.id,
                username: profile.username,
                full_name: profile.full_name,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                headline: profile.headline,
                role: (profile as { role?: string | null }).role ?? null,
                current_country: profile.current_country,
                threshold_fields: savedThresholdFields,
              }
            : null
        }
        onSaved={(fields) => {
          setSavedThresholdFields(fields);
          queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
        }}
      />
    </SettingsLayout>
  );
}

