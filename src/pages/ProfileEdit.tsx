import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';

const ProfileEdit = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    bio: '',
    diaspora_story: '',
    location: '',
    profession: '',
    years_of_experience: 0,
    linkedin_url: '',
    website_url: '',
    github_url: '',
    twitter_handle: '',
    availability_hours_per_month: 0,
    location_preference: 'remote' as 'remote' | 'onsite' | 'hybrid',
    email_visible: false,
    availability_visible: true,
  });

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-edit', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Check authorization
  useEffect(() => {
    if (profile && profile.id !== user?.id) {
      toast({
        title: 'Unauthorized',
        description: 'You can only edit your own profile',
        variant: 'destructive',
      });
      navigate(`/profile/${username}`);
    }
  }, [profile, user, username, navigate, toast]);

  // Populate form
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        diaspora_story: profile.diaspora_story || '',
        location: profile.location || '',
        profession: profile.profession || '',
        years_of_experience: profile.years_of_experience || 0,
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
        github_url: profile.github_url || '',
        twitter_handle: profile.twitter_handle || '',
        availability_hours_per_month: profile.availability_hours_per_month || 0,
        location_preference: (profile.location_preference as 'remote' | 'onsite' | 'hybrid') || 'remote',
        email_visible: profile.email_visible || false,
        availability_visible: profile.availability_visible ?? true,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved',
      });
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      navigate(`/profile/${username}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <>
        <UnifiedHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/profile/${username}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label>Headline</Label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g., Product Designer | EdTech Advocate"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., London, UK"
                />
              </div>
            </CardContent>
          </Card>

          {/* Diaspora Story */}
          <Card>
            <CardHeader>
              <CardTitle>Diaspora Story</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.diaspora_story}
                onChange={(e) => setFormData({ ...formData, diaspora_story: e.target.value })}
                placeholder="Share your journey and connection to Africa..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.diaspora_story.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Professional */}
          <Card>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Profession</Label>
                <Input
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label>GitHub</Label>
                <Input
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <Label>Twitter Handle</Label>
                <Input
                  value={formData.twitter_handle}
                  onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                  placeholder="@yourusername"
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hours Available Per Month</Label>
                <Input
                  type="number"
                  value={formData.availability_hours_per_month}
                  onChange={(e) => setFormData({ ...formData, availability_hours_per_month: parseInt(e.target.value) || 0 })}
                  max={168}
                />
              </div>

              <div>
                <Label>Work Preference</Label>
                <Select
                  value={formData.location_preference}
                  onValueChange={(value: any) => setFormData({ ...formData, location_preference: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote only</SelectItem>
                    <SelectItem value="onsite">On-site only</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Email on Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your email address
                  </p>
                </div>
                <Switch
                  checked={formData.email_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, email_visible: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Availability</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your available hours per month
                  </p>
                </div>
                <Switch
                  checked={formData.availability_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, availability_visible: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${username}`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={!formData.full_name.trim() || updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;