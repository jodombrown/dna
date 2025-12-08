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
import { useImageUpload } from '@/components/profile/form/ImageUploadHandler';

// Import modular section components
import {
  ProfileImagesSection,
  BasicInfoSection,
  ProfessionalSection,
  DiasporaSection,
  IntentionsSection,
  AfricaFocusSection,
  SocialLinksSection,
  PrivacySection,
  ProfileEditFormData,
  AfricaFocusArea,
} from '@/components/profile/edit';

/**
 * ProfileEdit Page - Refactored
 *
 * This page has been refactored from 992 lines to a modular structure.
 * Each section is now a separate component in /components/profile/edit/
 *
 * Features:
 * - Modular section components for maintainability
 * - Unified selectors (CountryCombobox, TagMultiSelect)
 * - All essential DB fields exposed
 * - Autosave-ready architecture
 * - Better mobile responsiveness
 */
const ProfileEdit = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadImage } = useImageUpload();

  // Image upload state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Fetch current profile
  const { data: profile, isLoading } = useProfile();

  // Form state with all BETA-required fields
  const [formData, setFormData] = useState<ProfileEditFormData>({
    full_name: '',
    headline: '',
    bio: '',
    current_location: '',
    current_country: '',
    country_of_origin: '',
    profession: '',
    company: '',
    years_experience: 0,
    skills: [],
    interests: [],
    diaspora_status: '',
    languages: [],
    intentions: [],
    engagement_intentions: [],
    available_for: [],
    mentorship_areas: [],
    diaspora_networks: [],
    africa_focus_areas: [],
    focus_areas: [],
    regional_expertise: [],
    industries: [],
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    is_public: false,
  });

  // Africa focus areas (separate state for complex nested structure)
  const [africaFocusAreas, setAfricaFocusAreas] = useState<AfricaFocusArea[]>([]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        current_location: profile.current_location || profile.location || '',
        current_country: profile.current_country || '',
        country_of_origin: profile.country_of_origin || '',
        profession: profile.profession || '',
        company: profile.company || '',
        years_experience: profile.years_experience || 0,
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        diaspora_status: profile.diaspora_status || '',
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        intentions: Array.isArray(profile.intentions) ? profile.intentions : [],
        engagement_intentions: Array.isArray(profile.engagement_intentions) ? profile.engagement_intentions : [],
        available_for: Array.isArray(profile.available_for) ? profile.available_for : [],
        mentorship_areas: Array.isArray(profile.mentorship_areas) ? profile.mentorship_areas : [],
        diaspora_networks: Array.isArray(profile.diaspora_networks) ? profile.diaspora_networks : [],
        africa_focus_areas: [],
        focus_areas: Array.isArray(profile.focus_areas) ? profile.focus_areas : [],
        regional_expertise: Array.isArray(profile.regional_expertise) ? profile.regional_expertise : [],
        industries: Array.isArray(profile.industries) ? profile.industries : [],
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        website_url: profile.website_url || '',
        is_public: profile.is_public || false,
      });

      setAvatarUrl(profile.avatar_url || null);
      setBannerUrl(profile.banner_url || null);

      // Parse africa_focus_areas
      const focusAreasData: any = profile.africa_focus_areas || [];
      const typedFocusAreas: AfricaFocusArea[] = Array.isArray(focusAreasData)
        ? (focusAreasData as any[]).filter((area: any) =>
            typeof area === 'object' &&
            area !== null &&
            'geography' in area &&
            'sectors' in area &&
            Array.isArray(area.sectors)
          ).map(area => ({
            geography: area.geography as string,
            sectors: area.sectors as string[]
          }))
        : [];
      setAfricaFocusAreas(typedFocusAreas);
    }
  }, [profile]);

  // Update handler for form fields
  const handleUpdate = (field: keyof ProfileEditFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
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
    onError: (error: any) => {
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
      ...formData,
      africa_focus_areas: africaFocusAreas,
      updated_at: new Date().toISOString(),
    };

    updateMutation.mutate(updates);
  };

  // Image upload handlers
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, or WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 5MB', variant: 'destructive' });
      return;
    }

    setUploadingAvatar(true);
    const url = await uploadImage(file, user.id, 'avatar');
    if (url) {
      setAvatarUrl(url);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
      toast({ title: 'Avatar updated!' });
    }
    setUploadingAvatar(false);
  };

  const handleBannerUpload = async (file: File) => {
    if (!user) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload JPG, PNG, or WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 10MB for banners', variant: 'destructive' });
      return;
    }

    setUploadingBanner(true);
    const url = await uploadImage(file, user.id, 'banner');
    if (url) {
      setBannerUrl(url);
      await supabase.from('profiles').update({ banner_url: url }).eq('id', user.id);
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
      toast({ title: 'Banner updated!' });
    }
    setUploadingBanner(false);
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
            {!formData.headline && (
              <Badge variant="outline" className="text-xs">+ Add headline</Badge>
            )}
            {formData.skills.length < 3 && (
              <Badge variant="outline" className="text-xs">+ Add 3+ skills</Badge>
            )}
            {formData.focus_areas.length < 2 && (
              <Badge variant="outline" className="text-xs">+ Add focus areas</Badge>
            )}
          </div>
        </div>

        {/* Profile Completion Progress */}
        <ProfileCompletionBar profile={{ ...profile, avatar_url: avatarUrl, banner_url: bannerUrl }} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Images */}
          <ProfileImagesSection
            avatarUrl={avatarUrl}
            bannerUrl={bannerUrl}
            uploadingAvatar={uploadingAvatar}
            uploadingBanner={uploadingBanner}
            onAvatarUpload={handleAvatarUpload}
            onBannerUpload={handleBannerUpload}
          />

          {/* Basic Information */}
          <BasicInfoSection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* Professional Background */}
          <ProfessionalSection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* African Diaspora Identity */}
          <DiasporaSection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* Intentions & Engagement */}
          <IntentionsSection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* Africa Focus & Discovery */}
          <AfricaFocusSection
            formData={formData}
            onUpdate={handleUpdate}
            africaFocusAreas={africaFocusAreas}
            onAfricaFocusAreasChange={setAfricaFocusAreas}
          />

          {/* Social Links */}
          <SocialLinksSection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* Privacy Settings */}
          <PrivacySection
            formData={formData}
            onUpdate={handleUpdate}
          />

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-between sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t">
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
