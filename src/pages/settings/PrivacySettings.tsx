import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Users, Mail, Handshake, Calendar, Search } from 'lucide-react';
import SettingsLayout from './SettingsLayout';
import { Skeleton } from '@/components/ui/skeleton';

interface ConsentSettings {
  is_public: boolean;
  consent_marketing_emails: boolean;
  consent_partner_intros: boolean;
  consent_event_invites: boolean;
  consent_public_search: boolean;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ConsentSettings>({
    is_public: true,
    consent_marketing_emails: true,
    consent_partner_intros: true,
    consent_event_invites: true,
    consent_public_search: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_public, consent_marketing_emails, consent_partner_intros, consent_event_invites, consent_public_search')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setSettings({
          is_public: data?.is_public ?? true,
          consent_marketing_emails: (data as any)?.consent_marketing_emails ?? true,
          consent_partner_intros: (data as any)?.consent_partner_intros ?? true,
          consent_event_invites: (data as any)?.consent_event_invites ?? true,
          consent_public_search: (data as any)?.consent_public_search ?? true,
        });
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const handleToggle = async (field: keyof ConsentSettings, checked: boolean) => {
    if (!user?.id) return;

    setSavingField(field);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: checked })
        .eq('id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [field]: checked }));
      toast({
        title: 'Settings updated',
        description: 'Your privacy preferences have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSavingField(null);
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
          <Skeleton className="h-64 w-full" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Privacy & Consent</h2>
          <p className="text-muted-foreground mt-1">Control your visibility and communication preferences</p>
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
                {settings.is_public ? (
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
                    {settings.is_public ? 'Public Profile' : 'Private Profile'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.is_public 
                      ? 'Anyone can view your profile and find you in search'
                      : 'Only you can see your full profile'
                    }
                  </p>
                </div>
              </div>
              <Switch
                id="public-toggle"
                checked={settings.is_public}
                onCheckedChange={(checked) => handleToggle('is_public', checked)}
                disabled={savingField === 'is_public'}
              />
            </div>

            {/* Explanation Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`p-4 rounded-lg border ${settings.is_public ? 'border-primary bg-primary/5' : 'border-border'}`}>
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
              
              <div className={`p-4 rounded-lg border ${!settings.is_public ? 'border-primary bg-primary/5' : 'border-border'}`}>
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

        {/* Consent & Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Consent & Communication
            </CardTitle>
            <CardDescription>
              Control how DNA communicates with you and shares your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Marketing Emails */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="marketing-toggle" className="font-medium">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive news, updates, and promotional content from DNA
                  </p>
                </div>
              </div>
              <Switch
                id="marketing-toggle"
                checked={settings.consent_marketing_emails}
                onCheckedChange={(checked) => handleToggle('consent_marketing_emails', checked)}
                disabled={savingField === 'consent_marketing_emails'}
              />
            </div>

            {/* Partner Introductions */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="partner-toggle" className="font-medium">
                    Partner Introductions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow DNA to introduce you to ecosystem partners (investors, programs, etc.)
                  </p>
                </div>
              </div>
              <Switch
                id="partner-toggle"
                checked={settings.consent_partner_intros}
                onCheckedChange={(checked) => handleToggle('consent_partner_intros', checked)}
                disabled={savingField === 'consent_partner_intros'}
              />
            </div>

            {/* Event Invitations */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="events-toggle" className="font-medium">
                    Event Invitations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive invitations to DNA events and community gatherings
                  </p>
                </div>
              </div>
              <Switch
                id="events-toggle"
                checked={settings.consent_event_invites}
                onCheckedChange={(checked) => handleToggle('consent_event_invites', checked)}
                disabled={savingField === 'consent_event_invites'}
              />
            </div>

            {/* Public Search */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="search-toggle" className="font-medium">
                    Public Search Visibility
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your profile to appear in search engine results
                  </p>
                </div>
              </div>
              <Switch
                id="search-toggle"
                checked={settings.consent_public_search}
                onCheckedChange={(checked) => handleToggle('consent_public_search', checked)}
                disabled={savingField === 'consent_public_search'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Rights Notice */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Your Data Rights:</strong> You can request to export or delete your data at any time. 
              DNA respects your privacy and complies with GDPR/CCPA regulations. 
              For data requests, contact <a href="mailto:privacy@diasporanetwork.africa" className="text-primary hover:underline">privacy@diasporanetwork.africa</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
