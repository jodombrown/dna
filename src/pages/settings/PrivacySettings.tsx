import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Users } from 'lucide-react';
import SettingsLayout from './SettingsLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_public')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsPublic(data?.is_public ?? true);
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacySettings();
  }, [user?.id]);

  const handleTogglePublic = async (checked: boolean) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: checked })
        .eq('id', user.id);

      if (error) throw error;

      setIsPublic(checked);
      toast({
        title: 'Privacy settings updated',
        description: checked 
          ? 'Your profile is now visible to everyone.' 
          : 'Your profile is now private.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update privacy settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
          <p className="text-muted-foreground mt-1">Control who can see your profile and information</p>
        </div>

        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Visibility
            </CardTitle>
            <CardDescription>
              Choose who can see your profile on DNA Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-4">
                {isPublic ? (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Label htmlFor="public-toggle" className="font-medium">
                    {isPublic ? 'Public Profile' : 'Private Profile'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? 'Anyone can view your profile and find you in search'
                      : 'Only you can see your full profile'
                    }
                  </p>
                </div>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={handleTogglePublic}
                disabled={isSaving}
              />
            </div>

            {/* Explanation Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`p-4 rounded-lg border ${isPublic ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">When Public</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Appear in member discovery</li>
                  <li>• Visible to all DNA members</li>
                  <li>• Others can send connection requests</li>
                  <li>• Your skills & interests are searchable</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-lg border ${!isPublic ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">When Private</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hidden from member discovery</li>
                  <li>• Others see "Private Profile"</li>
                  <li>• Existing connections maintained</li>
                  <li>• You can still browse & connect</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future: Per-field visibility */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Section Visibility</CardTitle>
            <CardDescription>
              Fine-grained control over individual profile sections coming in a future update.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </SettingsLayout>
  );
}
