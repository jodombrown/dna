import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda',
  'Senegal', 'Cameroon', 'Ivory Coast', 'Morocco', 'Egypt', 'Algeria', 'Tunisia', 'Other'
];

const CAUSES = [
  'Education', 'Healthcare', 'Economic Development', 'Technology Innovation', 
  'Environmental Sustainability', 'Women Empowerment', 'Youth Development',
  'Agriculture', 'Infrastructure', 'Arts & Culture', 'Governance & Policy'
];

const LANGUAGES = [
  'English', 'French', 'Arabic', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 
  'Amharic', 'Oromo', 'Portuguese', 'Spanish', 'Other'
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    full_name: '',
    location: '',
    origin_country: '',
    bio: '',
    diaspora_tags: [] as string[],
    causes: [] as string[],
    languages: [] as string[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value && !formData[field as keyof typeof formData].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof formData] as string[], value]
      }));
    }
  };

  const handleArrayRemove = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof formData] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          ...formData
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been created successfully."
      });

      navigate('/app');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-dna-forest mb-2">
              Complete Your DNA Profile
            </CardTitle>
            <p className="text-gray-600">
              Help us personalize your experience and connect you with the right community
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a/an</Label>
                  <Select onValueChange={(value) => handleInputChange('role', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="community">Community Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin_country">Country of Origin</Label>
                  <Select onValueChange={(value) => handleInputChange('origin_country', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Causes You Care About</Label>
                <Select onValueChange={(value) => handleArrayAdd('causes', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add causes" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAUSES.map(cause => (
                      <SelectItem key={cause} value={cause}>{cause}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.causes.map(cause => (
                    <Badge key={cause} variant="secondary" className="bg-dna-mint text-dna-forest">
                      {cause}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => handleArrayRemove('causes', cause)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <Select onValueChange={(value) => handleArrayAdd('languages', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(language => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map(language => (
                    <Badge key={language} variant="secondary" className="bg-dna-emerald/20 text-dna-forest">
                      {language}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => handleArrayRemove('languages', language)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;