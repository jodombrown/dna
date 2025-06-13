
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LinkedInStyleProfileHeader from './LinkedInStyleProfileHeader';
import LinkedInAboutSection from './LinkedInAboutSection';
import LinkedInExperienceSection from './LinkedInExperienceSection';
import LinkedInProjectsSection from './LinkedInProjectsSection';
import CulturalImpactSection from './CulturalImpactSection';
import MentorshipPreferences from './MentorshipPreferences';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfileDisplayProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
}

const EnhancedProfileDisplay: React.FC<EnhancedProfileDisplayProps> = ({ 
  profile, 
  isOwnProfile, 
  onEdit, 
  onConnect 
}) => {
  const [projects, setProjects] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchProjectsAndInitiatives();
      if (!isOwnProfile) {
        checkFollowingStatus();
      }
    }
  }, [profile?.id, isOwnProfile]);

  const fetchProjectsAndInitiatives = async () => {
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Fetch initiatives
      const { data: initiativesData } = await supabase
        .from('initiatives')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
      setInitiatives(initiativesData || []);
    } catch (error) {
      console.error('Error fetching projects and initiatives:', error);
    }
  };

  const checkFollowingStatus = async () => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data } = await supabase
        .from('user_connections')
        .select('id')
        .eq('follower_id', currentUser.user.id)
        .eq('following_id', profile.id)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Not following or error
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_connections')
          .delete()
          .eq('follower_id', currentUser.user.id)
          .eq('following_id', profile.id);

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You're no longer following ${profile.full_name}`,
        });
      } else {
        // Follow
        await supabase
          .from('user_connections')
          .insert({
            follower_id: currentUser.user.id,
            following_id: profile.id
          });

        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You're now following ${profile.full_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages - this would be handled by parent component
    if (onConnect) {
      onConnect();
    }
  };

  return (
    <div className="space-y-6">
      {/* LinkedIn-style Profile Header */}
      <LinkedInStyleProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onFollow={handleFollow}
        onMessage={handleMessage}
        isFollowing={isFollowing}
      />

      {/* About Section */}
      <LinkedInAboutSection 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />

      {/* Experience Section */}
      <LinkedInExperienceSection 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />

      {/* Projects & Initiatives Section */}
      <LinkedInProjectsSection 
        profile={profile}
        projects={projects}
        initiatives={initiatives}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onAddProject={() => {
          // This would open a project creation modal
          toast({
            title: "Feature Coming Soon",
            description: "Project creation will be available soon!",
          });
        }}
      />

      {/* Cultural Impact Section */}
      <CulturalImpactSection profile={profile} />

      {/* Mentorship Section */}
      <MentorshipPreferences 
        profile={profile} 
        isOwnProfile={isOwnProfile}
        onConnect={onConnect}
        onMessage={handleMessage}
      />
    </div>
  );
};

export default EnhancedProfileDisplay;
