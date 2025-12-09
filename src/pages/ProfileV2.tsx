/**
 * DNA Profile v2 - Diaspora Impact Dashboard
 * Main profile page at /dna/:username
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileV2 } from '@/hooks/useProfileV2';
import { Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

// Profile v2 Components
import ProfileV2Hero from '@/components/profile-v2/ProfileV2Hero';
import ProfileV2About from '@/components/profile-v2/ProfileV2About';
import ProfileV2Diaspora from '@/components/profile-v2/ProfileV2Diaspora';
import ProfileV2Skills from '@/components/profile-v2/ProfileV2Skills';
import ProfileV2Contributions from '@/components/profile-v2/ProfileV2Contributions';
import ProfileV2Interests from '@/components/profile-v2/ProfileV2Interests';
import ProfileV2Activity from '@/components/profile-v2/ProfileV2Activity';
import ProfileV2Completion from '@/components/profile-v2/ProfileV2Completion';
import ProfileV2Verification from '@/components/profile-v2/ProfileV2Verification';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

const ProfileV2: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: bundle, isLoading, error } = useProfileV2(username);

  // Update handlers
  const handleUpdateAbout = async (bio: string) => {
    if (!user) return;
    const { error } = await supabase.rpc('update_profile_about', {
      p_user_id: user.id,
      p_bio: bio,
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['profile-v2', username] });
    toast({ title: 'About updated', description: 'Your bio has been updated successfully.' });
  };

  const handleUpdateSkills = async (skills: string[]) => {
    if (!user) return;
    const { error } = await supabase.rpc('update_profile_skills', {
      p_user_id: user.id,
      p_skills: JSON.stringify(skills),
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['profile-v2', username] });
    toast({ title: 'Skills updated', description: 'Your skills have been updated successfully.' });
  };

  const handleUpdateContributions = async (contributions: string[]) => {
    if (!user) return;
    const { error } = await supabase.rpc('update_profile_contributions', {
      p_user_id: user.id,
      p_contribution_tags: JSON.stringify(contributions),
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['profile-v2', username] });
    toast({ title: 'Contributions updated', description: 'Your contribution areas have been updated.' });
  };

  const handleUpdateInterests = async (interests: string[]) => {
    if (!user) return;
    const { error } = await supabase.rpc('update_profile_interests', {
      p_user_id: user.id,
      p_interests: JSON.stringify(interests),
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['profile-v2', username] });
    toast({ title: 'Interests updated', description: 'Your interests have been updated successfully.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground">
          {username ? `@${username} does not exist or has been removed.` : 'No username provided.'}
        </p>
      </div>
    );
  }

  const { profile, tags, activity, permissions, visibility, completion, verification_meta } = bundle;

  // Check if this is a private profile (all main sections hidden for non-owner)
  const isPrivateProfile = !permissions.is_owner &&
    visibility.about === 'hidden' &&
    visibility.skills === 'hidden' &&
    visibility.interests === 'hidden' &&
    visibility.activity === 'hidden';

  // Private profile view for non-owners
  if (isPrivateProfile) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="h-40 sm:h-52 w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center -mt-16">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl mb-4">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
            <p className="text-muted-foreground text-sm mb-6">@{profile.username}</p>
            <Card className="max-w-md">
              <CardContent className="pt-6 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">This profile is private</h2>
                <p className="text-muted-foreground text-sm">
                  {profile.full_name} has chosen to keep their profile information private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <ProfileV2Hero
        profile={profile}
        permissions={permissions}
        onEdit={() => permissions.is_owner && navigate('/dna/profile/edit')}
        onConnect={() => console.log('Connect clicked')}
        onMessage={() => console.log('Message clicked')}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileV2About
              profile={profile}
              visibility={visibility}
              isOwner={permissions.is_owner}
              onUpdate={handleUpdateAbout}
            />

            <ProfileV2Diaspora
              profile={profile}
              isOwner={permissions.is_owner}
            />

            <ProfileV2Skills
              tags={tags}
              visibility={visibility}
              isOwner={permissions.is_owner}
              onUpdate={handleUpdateSkills}
            />

            <ProfileV2Contributions
              tags={tags}
              isOwner={permissions.is_owner}
              onUpdate={handleUpdateContributions}
            />

            <ProfileV2Interests
              tags={tags}
              visibility={visibility}
              isOwner={permissions.is_owner}
              onUpdate={handleUpdateInterests}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion (Owner Only) */}
            {permissions.is_owner && completion.score < 100 && (
              <ProfileV2Completion
                completion={completion}
                onActionClick={(action) => console.log('Action clicked:', action)}
              />
            )}

            {/* DNA Activity */}
            <ProfileV2Activity
              activity={activity}
              visibility={visibility}
              isOwner={permissions.is_owner}
            />

            {/* Verification (Owner Only) */}
            {permissions.is_owner && (
              <ProfileV2Verification verificationMeta={verification_meta} />
            )}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ProfileV2;
