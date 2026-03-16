import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, Mail, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/lib/errorLogger';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Platform tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast({
        title: 'Confirmation email sent',
        description: 'Please check your new email address to confirm the change.',
      });
      setNewEmail('');
    } catch (error: unknown) {
      toast({
        title: 'Error updating email',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({ title: 'Current password required', description: 'Please enter your current password to verify your identity', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: 'Weak password', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure your passwords match', variant: 'destructive' });
      return;
    }

    setPasswordLoading(true);
    try {
      // First, reauthenticate the user with their current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Incorrect current password',
          description: 'Please verify your current password and try again.',
          variant: 'destructive',
        });
        setPasswordLoading(false);
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      toast({
        title: 'Error updating password',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Please type DELETE to confirm account deletion',
        variant: 'destructive',
      });
      return;
    }

    setDeleteLoading(true);
    try {
      // Soft delete: anonymize profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Deleted User',
          first_name: 'Deleted',
          last_name: 'User',
          headline: null,
          bio: null,
          avatar_url: null,
          banner_url: null,
          email: null,
          linkedin_url: null,
          twitter_url: null,
          website_url: null,
          is_public: false,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Sign out the user
      await signOut();

      toast({
        title: 'Account deleted',
        description: 'Your account has been deactivated and your data anonymized.',
      });

      navigate('/');
    } catch (error: unknown) {
      toast({
        title: 'Error deleting account',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your email, password, and account"
    >
      <div className="space-y-6">
        {/* Platform Tour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Platform Tour
            </CardTitle>
            <CardDescription>
              Take a guided tour of the DNA platform to explore key features and testing scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsTourOpen(true)} variant="outline">
              Take Platform Tour
            </Button>
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Address
            </CardTitle>
            <CardDescription>
              Update your email address. You'll need to verify the new address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <Label>Current Email</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="new-email">New Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                />
              </div>
              <Button type="submit" disabled={emailLoading || !newEmail}>
                {emailLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Email
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required to verify your identity
                </p>
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}>
                {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and anonymize your data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Deleting your account will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Anonymize your profile information</li>
                  <li>Remove your email and personal data</li>
                  <li>Set your profile to private</li>
                  <li>Prevent you from logging back in with this account</li>
                </ul>
              </AlertDescription>
            </Alert>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p>
                      This action will deactivate your account and anonymize your profile data.
                      You will not be able to recover your account.
                    </p>
                    <div>
                      <Label htmlFor="delete-confirm">
                        Type <strong>DELETE</strong> to confirm:
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                        className="mt-2"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || deleteLoading}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tour Drawer */}
      <AlphaTestGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenFeedback={() => {
          setIsTourOpen(false);
          setIsFeedbackOpen(true);
        }}
      />
      <FeedbackDrawer
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </SettingsLayout>
  );
}
