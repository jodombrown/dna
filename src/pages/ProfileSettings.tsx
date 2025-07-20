import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ImageUpload from '@/components/profile/ImageUpload';
import { 
  Loader2, 
  Save, 
  X, 
  Plus, 
  User, 
  MapPin, 
  Briefcase, 
  Settings, 
  Heart,
  Eye,
  EyeOff,
  Globe,
  Building,
  Award,
  ArrowLeft
} from 'lucide-react';
import { 
  profileSchema, 
  ProfileFormData, 
  getAvailabilityOptions, 
  getIndustryOptions, 
  getCountryOptions,
  getVisibilityOptions 
} from '@/schemas/profileSchema';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();
  
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newImpactArea, setNewImpactArea] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      display_name: '',
      bio: '',
      headline: '',
      email: '',
      linkedin_url: '',
      website_url: '',
      location: '',
      current_country: '',
      country_of_origin: '',
      diaspora_origin: '',
      professional_role: '',
      company: '',
      industry: '',
      profession: '',
      years_experience: undefined,
      skills: [],
      interests: [],
      interest_tags: [],
      impact_areas: [],
      available_for: [],
      avatar_url: '',
      banner_url: '',
      profile_picture_url: '',
      is_public: true,
      account_visibility: 'public',
      email_notifications: true,
      newsletter_emails: true,
    }
  });

  // Load current profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        headline: profile.headline || '',
        email: profile.email || '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
        location: profile.location || '',
        current_country: profile.current_country || '',
        country_of_origin: profile.country_of_origin || '',
        diaspora_origin: profile.diaspora_origin || '',
        professional_role: profile.professional_role || '',
        company: profile.company || '',
        industry: profile.industry || '',
        profession: profile.profession || '',
        years_experience: profile.years_experience || undefined,
        skills: profile.skills || [],
        interests: profile.interests || [],
        interest_tags: profile.interest_tags || [],
        impact_areas: profile.impact_areas || [],
        available_for: profile.available_for || [],
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || '',
        profile_picture_url: profile.profile_picture_url || '',
        is_public: profile.is_public ?? true,
        account_visibility: profile.account_visibility || 'public',
        email_notifications: profile.email_notifications ?? true,
        newsletter_emails: profile.newsletter_emails ?? true,
      });
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      handleError(error as Error, { context: 'updateProfile' });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const addArrayItem = (field: 'skills' | 'interests' | 'impact_areas', value: string) => {
    if (!value.trim()) return;
    
    const currentValues = form.getValues(field) || [];
    if (currentValues.includes(value.trim())) return;
    
    form.setValue(field, [...currentValues, value.trim()]);
    
    if (field === 'skills') setNewSkill('');
    if (field === 'interests') setNewInterest('');
    if (field === 'impact_areas') setNewImpactArea('');
  };

  const removeArrayItem = (field: 'skills' | 'interests' | 'impact_areas', index: number) => {
    const currentValues = form.getValues(field) || [];
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const watchedValues = form.watch();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your public profile information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2"
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/profile/${user?.user_metadata?.full_name?.replace(' ', '-') || user?.id}`)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Public Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Profile Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {/* Banner */}
                  {watchedValues.banner_url && (
                    <div className="w-full h-24 bg-gradient-to-r from-dna-emerald to-dna-forest rounded-lg overflow-hidden">
                      <img 
                        src={watchedValues.banner_url} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Avatar */}
                  <div className="-mt-8 relative">
                    <Avatar className="w-16 h-16 mx-auto border-4 border-white">
                      <AvatarImage src={watchedValues.avatar_url || watchedValues.profile_picture_url} />
                      <AvatarFallback className="bg-dna-emerald text-white text-lg">
                        {watchedValues.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Headline */}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {watchedValues.display_name || watchedValues.full_name || 'Your Name'}
                    </h3>
                    {watchedValues.headline && (
                      <p className="text-sm text-gray-600">{watchedValues.headline}</p>
                    )}
                    {watchedValues.location && (
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {watchedValues.location}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  {watchedValues.bio && (
                    <p className="text-sm text-gray-700 text-left">{watchedValues.bio}</p>
                  )}

                  {/* Skills Preview */}
                  {watchedValues.skills && watchedValues.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {watchedValues.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {watchedValues.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{watchedValues.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {watchedValues.available_for && watchedValues.available_for.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available For</h4>
                      <div className="flex flex-wrap gap-1">
                        {watchedValues.available_for.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-dna-emerald/10 text-dna-emerald">
                            {getAvailabilityOptions().find(opt => opt.value === item)?.label || item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Banner Upload */}
                  <div>
                    <Label className="text-base font-medium">Banner Image</Label>
                    <p className="text-sm text-gray-500 mb-3">Upload a banner image for your profile</p>
                    <ImageUpload
                      type="banner"
                      currentImageUrl={watchedValues.banner_url}
                      onImageChange={(url) => form.setValue('banner_url', url)}
                      className="mb-4"
                    />
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <Label className="text-base font-medium">Profile Picture</Label>
                    <p className="text-sm text-gray-500 mb-3">Upload your profile picture</p>
                    <div className="flex items-center space-x-6">
                      <ImageUpload
                        type="avatar"
                        size="lg"
                        currentImageUrl={watchedValues.avatar_url || watchedValues.profile_picture_url}
                        onImageChange={(url) => {
                          form.setValue('avatar_url', url);
                          form.setValue('profile_picture_url', url);
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-gray-600">
                          Click on your profile picture to upload a new image.
                          Supported formats: JPEG, PNG, WebP, GIF (Max 5MB)
                        </p>
                        <div className="text-xs text-gray-500">
                          Current URL: {watchedValues.avatar_url || watchedValues.profile_picture_url || 'None'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        {...form.register('full_name')}
                        placeholder="Your full name"
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-red-600">{form.formState.errors.full_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        {...form.register('display_name')}
                        placeholder="How you want to appear"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      {...form.register('headline')}
                      placeholder="e.g., Software Engineer at Tech Company"
                      maxLength={120}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      {...form.register('bio')}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {watchedValues.bio?.length || 0}/500 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        {...form.register('email')}
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        {...form.register('linkedin_url')}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      {...form.register('website_url')}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Origin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Current Location</Label>
                      <Input
                        {...form.register('location')}
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="current_country">Current Country</Label>
                      <Controller
                        name="current_country"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select current country" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCountryOptions().map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country_of_origin">Country of Origin</Label>
                      <Controller
                        name="country_of_origin"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country of origin" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCountryOptions().map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="diaspora_origin">Diaspora Origin</Label>
                      <Input
                        {...form.register('diaspora_origin')}
                        placeholder="e.g., Nigerian Diaspora"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="professional_role">Professional Role</Label>
                      <Input
                        {...form.register('professional_role')}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        {...form.register('company')}
                        placeholder="Your current company"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Controller
                        name="industry"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {getIndustryOptions().map((industry) => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        {...form.register('profession')}
                        placeholder="Your profession"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      {...form.register('years_experience', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="50"
                      placeholder="Years of professional experience"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Interests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skills */}
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {watchedValues.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('skills', index)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('skills', newSkill))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('skills', newSkill)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {watchedValues.interests?.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-dna-copper/10 text-dna-copper">
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('interests', index)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('interests', newInterest))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('interests', newInterest)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Impact Areas */}
                  <div>
                    <Label>Impact Areas</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {watchedValues.impact_areas?.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-dna-forest/10 text-dna-forest">
                          {area}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('impact_areas', index)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newImpactArea}
                        onChange={(e) => setNewImpactArea(e.target.value)}
                        placeholder="Add an impact area"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('impact_areas', newImpactArea))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('impact_areas', newImpactArea)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label>I'm available for</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {getAvailabilityOptions().map((option) => (
                      <Controller
                        key={option.value}
                        name="available_for"
                        control={form.control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={option.value}
                              checked={field.value?.includes(option.value) || false}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, option.value]);
                                } else {
                                  field.onChange(currentValues.filter(v => v !== option.value));
                                }
                              }}
                            />
                            <Label htmlFor={option.value} className="text-sm font-normal">
                              {option.label}
                            </Label>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Privacy & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="account_visibility">Profile Visibility</Label>
                    <Controller
                      name="account_visibility"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            {getVisibilityOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <Controller
                      name="is_public"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="is_public">Public Profile</Label>
                            <p className="text-sm text-gray-600">Allow your profile to be visible in search results</p>
                          </div>
                          <Switch
                            id="is_public"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="email_notifications"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email_notifications">Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications about activities</p>
                          </div>
                          <Switch
                            id="email_notifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="newsletter_emails"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="newsletter_emails">Newsletter Emails</Label>
                            <p className="text-sm text-gray-600">Receive DNA network updates and newsletters</p>
                          </div>
                          <Switch
                            id="newsletter_emails"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-dna-emerald hover:bg-dna-forest text-white px-8"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileSettings;