import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, ArrowLeft, Save, Loader2, LogOut } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { ProfileDiscoverySection } from '@/components/profile/ProfileDiscoverySection';

// African countries list for dropdowns
const AFRICAN_COUNTRIES = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Ethiopia', 'Egypt', 'Tanzania', 
  'Uganda', 'Algeria', 'Morocco', 'Angola', 'Mozambique', 'Madagascar', 'Cameroon',
  'Côte d\'Ivoire', 'Niger', 'Burkina Faso', 'Mali', 'Malawi', 'Zambia', 'Somalia',
  'Senegal', 'Chad', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin', 'Tunisia', 'Burundi',
  'South Sudan', 'Togo', 'Sierra Leone', 'Libya', 'Liberia', 'Mauritania', 'Central African Republic',
  'Eritrea', 'Gambia', 'Botswana', 'Namibia', 'Gabon', 'Lesotho', 'Guinea-Bissau',
  'Equatorial Guinea', 'Mauritius', 'Eswatini', 'Djibouti', 'Comoros', 'Cape Verde', 'Sao Tome and Principe', 'Seychelles'
].sort();

const SECTOR_OPTIONS = [
  'Fintech', 'Agtech', 'Healthcare', 'Education', 'Infrastructure', 
  'Energy', 'Climate', 'Manufacturing', 'Retail', 'Tech/Software',
  'Real Estate', 'Transportation', 'Media & Entertainment', 'Tourism', 'Mining'
];

const INTENTION_OPTIONS = [
  { value: 'invest', label: 'Invest' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'build', label: 'Build/Start Business' },
  { value: 'learn', label: 'Learn' },
  { value: 'connect', label: 'Connect with Community' },
  { value: 'give_back', label: 'Give Back' }
];

const DIASPORA_STATUS_OPTIONS = [
  { value: '1st_gen', label: '1st Generation' },
  { value: '2nd_gen', label: '2nd Generation' },
  { value: 'continental_abroad', label: 'Continental African Abroad' },
  { value: 'other', label: 'Other' }
];

interface AfricaFocusArea {
  geography: string;
  sectors: string[];
}

const ProfileEdit = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);
  const [africaFocusAreas, setAfricaFocusAreas] = useState<AfricaFocusArea[]>([]);
  
  // Discovery tags state
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [regionalExpertise, setRegionalExpertise] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        country_of_origin: profile.country_of_origin || '',
        profession: profile.profession || '',
        company: profile.company || '',
        years_experience: profile.years_experience || 0,
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        website_url: profile.website_url || '',
        is_public: profile.is_public || false,
        skills: profile.skills || [],
        interests: profile.interests || [],
        diaspora_status: profile.diaspora_status || '',
        intentions: profile.intentions || [],
        africa_focus_areas: profile.africa_focus_areas || []
      });
      setSelectedIntentions(Array.isArray(profile.intentions) ? profile.intentions : []);
      
      // Ensure africa_focus_areas is properly typed
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
      
      // Initialize discovery tags
      setFocusAreas(Array.isArray(profile.focus_areas) ? profile.focus_areas : []);
      setRegionalExpertise(Array.isArray(profile.regional_expertise) ? profile.regional_expertise : []);
      setIndustries(Array.isArray(profile.industries) ? profile.industries : []);
    }
  }, [profile]);

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
      queryClient.invalidateQueries({ queryKey: ['current-user-profile', user?.id] });
      
      const completionPercentage = data.profile_completion_percentage || 0;
      toast({
        title: 'Profile updated!',
        description: `You're ${completionPercentage}% complete. ${completionPercentage >= 40 ? '✅ All features unlocked!' : `Complete ${40 - completionPercentage}% more to unlock all features.`}`,
      });
      
      navigate('/dna/me');
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
      skills: formData.skills,
      interests: formData.interests,
      intentions: selectedIntentions,
      africa_focus_areas: africaFocusAreas,
      focus_areas: focusAreas,
      regional_expertise: regionalExpertise,
      industries: industries,
      updated_at: new Date().toISOString(),
    };
    
    updateMutation.mutate(updates);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skill) });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter((i: string) => i !== interest) });
  };

  const toggleIntention = (value: string) => {
    setSelectedIntentions(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const addAfricaFocusArea = () => {
    setAfricaFocusAreas([...africaFocusAreas, { geography: '', sectors: [] }]);
  };

  const updateFocusArea = (index: number, field: 'geography' | 'sectors', value: any) => {
    const updated = [...africaFocusAreas];
    updated[index][field] = value;
    setAfricaFocusAreas(updated);
  };

  const removeFocusArea = (index: number) => {
    setAfricaFocusAreas(africaFocusAreas.filter((_, i) => i !== index));
  };

  const toggleSectorInFocusArea = (areaIndex: number, sector: string) => {
    const updated = [...africaFocusAreas];
    const currentSectors = updated[areaIndex].sectors;
    updated[areaIndex].sectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    setAfricaFocusAreas(updated);
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
            onClick={() => navigate('/dna/me')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile to unlock all DNA features and connect with the diaspora community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    placeholder="e.g., Software Engineer at Tech Company"
                    value={formData.headline || ''}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Current Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country_of_origin">Country of Origin *</Label>
                  <Select
                    value={formData.country_of_origin || ''}
                    onValueChange={(value) => setFormData({ ...formData, country_of_origin: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country of origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {AFRICAN_COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* African Diaspora Identity */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Your African Diaspora Identity</CardTitle>
              <p className="text-sm text-muted-foreground">Help us understand your connection to the diaspora</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="diaspora_status">Diaspora Status *</Label>
                <Select
                  value={formData.diaspora_status || ''}
                  onValueChange={(value) => setFormData({ ...formData, diaspora_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your diaspora status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIASPORA_STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* What Brings You to DNA */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>What Brings You to DNA?</CardTitle>
              <p className="text-sm text-muted-foreground">Select at least one intention (required for full access)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTENTION_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`intention-${option.value}`}
                      checked={selectedIntentions.includes(option.value)}
                      onCheckedChange={() => toggleIntention(option.value)}
                    />
                    <Label
                      htmlFor={`intention-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Your Africa Focus */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Your Africa Focus</CardTitle>
              <p className="text-sm text-muted-foreground">
                Specify the African geographies and sectors you're interested in
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {africaFocusAreas.map((area, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFocusArea(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div>
                    <Label>Geography</Label>
                    <Select
                      value={area.geography}
                      onValueChange={(value) => updateFocusArea(index, 'geography', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {AFRICAN_COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sectors</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {SECTOR_OPTIONS.map(sector => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sector-${index}-${sector}`}
                            checked={area.sectors.includes(sector)}
                            onCheckedChange={() => toggleSectorInFocusArea(index, sector)}
                          />
                          <Label
                            htmlFor={`sector-${index}-${sector}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {sector}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAfricaFocusArea}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Focus Area
              </Button>
            </CardContent>
          </Card>

          {/* Discovery & Matching Section */}
          <Card className="border-l-4 border-l-dna-emerald">
            <CardHeader>
              <CardTitle>Discovery & Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileDiscoverySection
                focusAreas={focusAreas}
                regionalExpertise={regionalExpertise}
                industries={industries}
                onFocusAreasChange={setFocusAreas}
                onRegionalExpertiseChange={setRegionalExpertise}
                onIndustriesChange={setIndustries}
              />
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    placeholder="Your current profession"
                    value={formData.profession || ''}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Current company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.years_experience || ''}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.skills || []).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Interests</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an interest"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addInterest}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.interests || []).map((interest: string) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="twitter_url">Twitter URL</Label>
                <Input
                  id="twitter_url"
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={formData.twitter_url || ''}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other community members
                  </p>
                </div>
                <Switch
                  checked={formData.is_public || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dna/me')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
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
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
