import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, LogOut } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import ProfileCompletionBar from '@/components/profile/ProfileCompletionBar';

// Import modular profile edit components
import {
  ProfileEditImages,
  ProfileEditBasicInfo,
  ProfileEditProfessional,
  ProfileEditDiaspora,
  ProfileEditInterests,
  ProfileEditLanguages,
  ProfileEditSocialLinks,
  ProfileEditPrivacy,
} from '@/components/profile-edit';

const ProfileEdit = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch current profile using unified hook
  const { data: profile, isLoading } = useProfile();

  // Image state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // Basic info state
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [currentCountry, setCurrentCountry] = useState('');

  // Professional state
  const [profession, setProfession] = useState('');
  const [company, setCompany] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [professionalSectors, setProfessionalSectors] = useState<string[]>([]);

  // Diaspora state
  const [diasporaStatus, setDiasporaStatus] = useState('');
  const [diasporaNetworks, setDiasporaNetworks] = useState<string[]>([]);
  const [engagementIntentions, setEngagementIntentions] = useState<string[]>([]);
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);

  // Interests & Discovery state
  const [interests, setInterests] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [regionalExpertise, setRegionalExpertise] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  // Languages state
  const [languages, setLanguages] = useState<string[]>([]);

  // Social links state
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Privacy state
  const [isPublic, setIsPublic] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      // Images
      setAvatarUrl(profile.avatar_url || null);
      setBannerUrl(profile.banner_url || null);

      // Basic info
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setCountryOfOrigin(profile.country_of_origin || '');
      setCurrentCountry(profile.current_country || '');

      // Professional
      setProfession(profile.profession || '');
      setCompany(profile.company || '');
      setYearsExperience(profile.years_experience || 0);
      setSkills(Array.isArray(profile.skills) ? profile.skills : []);
      setProfessionalSectors(Array.isArray(profile.professional_sectors) ? profile.professional_sectors : []);

      // Diaspora
      setDiasporaStatus(profile.diaspora_status || '');
      setDiasporaNetworks(Array.isArray(profile.diaspora_networks) ? profile.diaspora_networks : []);
      setEngagementIntentions(Array.isArray(profile.engagement_intentions) ? profile.engagement_intentions : []);
      setMentorshipAreas(Array.isArray(profile.mentorship_areas) ? profile.mentorship_areas : []);

      // Interests & Discovery
      setInterests(Array.isArray(profile.interests) ? profile.interests : []);
      setFocusAreas(Array.isArray(profile.focus_areas) ? profile.focus_areas : []);
      setRegionalExpertise(Array.isArray(profile.regional_expertise) ? profile.regional_expertise : []);
      setIndustries(Array.isArray(profile.industries) ? profile.industries : []);

      // Languages
      setLanguages(Array.isArray(profile.languages) ? profile.languages : []);

      // Social links
      setLinkedinUrl(profile.linkedin_url || '');
      setTwitterUrl(profile.twitter_url || '');
      setWebsiteUrl(profile.website_url || '');

      // Privacy
      setIsPublic(profile.is_public || false);
    }
  }, [profile]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
      
      const completionPercentage = data.profile_completion_percentage || 0;
      toast({
        title: 'Profile updated!',
        description: `You're ${completionPercentage}% complete. ${completionPercentage >= 40 ? '✅ All features unlocked!' : `Complete ${40 - completionPercentage}% more to unlock all features.`}`,
      });
      
      navigate('/dna/feed');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      // Basic info
      full_name: fullName,
      headline,
      bio,
      location,
      country_of_origin: countryOfOrigin,
      current_country: currentCountry,

      // Professional
      profession,
      company,
      years_experience: yearsExperience,
      skills,
      professional_sectors: professionalSectors,

      // Diaspora
      diaspora_status: diasporaStatus,
      diaspora_networks: diasporaNetworks,
      engagement_intentions: engagementIntentions,
      mentorship_areas: mentorshipAreas,

      // Interests & Discovery
      interests,
      focus_areas: focusAreas,
      regional_expertise: regionalExpertise,
      industries,

      // Languages
      languages,

      // Social links
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl,
      website_url: websiteUrl,

      // Privacy
      is_public: isPublic,

      // Meta
      updated_at: new Date().toISOString(),
    };
    
    updateMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dna/feed')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile to unlock all DNA features and connect with the diaspora community
          </p>
          
          {/* Quick nudges for incomplete fields */}
          <div className="mt-4 flex flex-wrap gap-2">
            {!avatarUrl && (
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                + Add photo
              </Badge>
            )}
            {!bannerUrl && (
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                + Add banner
              </Badge>
            )}
            {!headline && (
              <Badge variant="outline" className="text-xs">+ Add headline</Badge>
            )}
            {skills.length < 3 && (
              <Badge variant="outline" className="text-xs">+ Add 3+ skills</Badge>
            )}
            {focusAreas.length < 2 && (
              <Badge variant="outline" className="text-xs">+ Add focus areas</Badge>
            )}
          </div>
        </div>

        {/* Profile Completion Progress */}
        <ProfileCompletionBar profile={{ ...profile, avatar_url: avatarUrl, banner_url: bannerUrl }} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Images */}
          <ProfileEditImages
            userId={user.id}
            avatarUrl={avatarUrl}
            bannerUrl={bannerUrl}
            onAvatarChange={setAvatarUrl}
            onBannerChange={setBannerUrl}
          />

          {/* Basic Information */}
          <ProfileEditBasicInfo
            fullName={fullName}
            headline={headline}
            bio={bio}
            location={location}
            countryOfOrigin={countryOfOrigin}
            currentCountry={currentCountry}
            onFullNameChange={setFullName}
            onHeadlineChange={setHeadline}
            onBioChange={setBio}
            onLocationChange={setLocation}
            onCountryOfOriginChange={setCountryOfOrigin}
            onCurrentCountryChange={setCurrentCountry}
          />

          {/* Professional Background */}
          <ProfileEditProfessional
            profession={profession}
            company={company}
            yearsExperience={yearsExperience}
            skills={skills}
            professionalSectors={professionalSectors}
            onProfessionChange={setProfession}
            onCompanyChange={setCompany}
            onYearsExperienceChange={setYearsExperience}
            onSkillsChange={setSkills}
            onSectorsChange={setProfessionalSectors}
          />

          {/* African Diaspora Identity */}
          <ProfileEditDiaspora
            diasporaStatus={diasporaStatus}
            diasporaNetworks={diasporaNetworks}
            engagementIntentions={engagementIntentions}
            mentorshipAreas={mentorshipAreas}
            onDiasporaStatusChange={setDiasporaStatus}
            onNetworksChange={setDiasporaNetworks}
            onIntentionsChange={setEngagementIntentions}
            onMentorshipAreasChange={setMentorshipAreas}
          />

          {/* Interests & Focus Areas */}
          <ProfileEditInterests
            interests={interests}
            focusAreas={focusAreas}
            regionalExpertise={regionalExpertise}
            industries={industries}
            onInterestsChange={setInterests}
            onFocusAreasChange={setFocusAreas}
            onRegionalExpertiseChange={setRegionalExpertise}
            onIndustriesChange={setIndustries}
          />

          {/* Languages */}
          <ProfileEditLanguages
            languages={languages}
            onLanguagesChange={setLanguages}
          />

          {/* Social Links */}
          <ProfileEditSocialLinks
            linkedinUrl={linkedinUrl}
            twitterUrl={twitterUrl}
            websiteUrl={websiteUrl}
            onLinkedinChange={setLinkedinUrl}
            onTwitterChange={setTwitterUrl}
            onWebsiteChange={setWebsiteUrl}
          />

          {/* Privacy Settings */}
          <ProfileEditPrivacy
            isPublic={isPublic}
            onIsPublicChange={setIsPublic}
          />

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-between pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dna/feed')}
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
