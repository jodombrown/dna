import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, Plus } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    origin_country: '',
    diaspora_tags: [] as string[],
    causes: [] as string[],
    languages: [] as string[],
    avatar_url: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newCause, setNewCause] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Load current profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['currentProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        origin_country: profile.origin_country || '',
        diaspora_tags: profile.diaspora_tags || [],
        causes: profile.causes || [],
        languages: profile.languages || [],
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleAddTag = (type: 'diaspora_tags' | 'causes' | 'languages', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    
    if (type === 'diaspora_tags') setNewTag('');
    if (type === 'causes') setNewCause('');
    if (type === 'languages') setNewLanguage('');
  };

  const handleRemoveTag = (type: 'diaspora_tags' | 'causes' | 'languages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your public profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest text-xl">
                    {formData.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar_url">Profile Picture URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label htmlFor="origin_country">Country of Origin</Label>
                <Input
                  id="origin_country"
                  value={formData.origin_country}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin_country: e.target.value }))}
                  placeholder="Your country of origin"
                />
              </div>
            </CardContent>
          </Card>

          {/* Identity & Causes */}
          <Card>
            <CardHeader>
              <CardTitle>Identity & Causes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Diaspora Tags */}
              <div>
                <Label>Diaspora Tags</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.diaspora_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-dna-mint text-dna-forest">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag('diaspora_tags', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add diaspora tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('diaspora_tags', newTag))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag('diaspora_tags', newTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Causes */}
              <div>
                <Label>Causes You Care About</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.causes.map((cause, index) => (
                    <Badge key={index} variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                      {cause}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag('causes', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCause}
                    onChange={(e) => setNewCause(e.target.value)}
                    placeholder="Add cause"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('causes', newCause))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag('causes', newCause)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="bg-dna-copper/10 text-dna-copper">
                      {language}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag('languages', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('languages', newLanguage))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag('languages', newLanguage)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
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

      <Footer />
    </div>
  );
};

export default ProfileSettings;