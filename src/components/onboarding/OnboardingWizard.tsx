
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const INTEREST_OPTIONS = [
  'Technology', 'Healthcare', 'Agriculture', 'Education', 'Finance',
  'Manufacturing', 'Renewable Energy', 'Creative Industries', 'Real Estate',
  'Tourism & Hospitality', 'Transportation', 'Food & Beverage'
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
  'Australia', 'Netherlands', 'South Africa', 'Ghana', 'Nigeria',
  'Kenya', 'Ethiopia', 'Other'
];

const OnboardingWizard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    display_name: profile?.display_name || '',
    professional_role: '',
    current_country: '',
    interest_tags: [] as string[],
    profile_picture: null as File | null
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interest_tags: prev.interest_tags.includes(interest)
        ? prev.interest_tags.filter(tag => tag !== interest)
        : [...prev.interest_tags, interest]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_picture: file }));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let profile_picture_url = '';
      
      // Upload profile picture if provided
      if (formData.profile_picture) {
        const fileExt = formData.profile_picture.name.split('.').pop();
        const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, formData.profile_picture);
          
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(data.path);
          profile_picture_url = urlData.publicUrl;
        }
      }

      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.display_name,
          professional_role: formData.professional_role,
          current_country: formData.current_country,
          interest_tags: formData.interest_tags,
          profile_picture_url,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been set up successfully.",
      });

      navigate('/feed');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.full_name && formData.display_name;
    if (step === 2) return formData.professional_role && formData.current_country;
    if (step === 3) return formData.interest_tags.length > 0;
    return true;
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-dna-forest">
            Welcome to DNA
          </CardTitle>
          <p className="text-gray-600">Let's set up your profile to connect you with the right community</p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Step {step} of 3</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="How should others see your name?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Picture (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="profile_picture"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="profile_picture" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.profile_picture ? formData.profile_picture.name : 'Click to upload a photo'}
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Professional Background</h3>
              
              <div className="space-y-2">
                <Label htmlFor="professional_role">Professional Role/Title *</Label>
                <Input
                  id="professional_role"
                  value={formData.professional_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_role: e.target.value }))}
                  placeholder="e.g., Software Engineer, Doctor, Entrepreneur"
                />
              </div>

              <div className="space-y-2">
                <Label>Current Country of Residence *</Label>
                <Select 
                  value={formData.current_country} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, current_country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Areas of Interest</h3>
              <p className="text-sm text-gray-600">Select the sectors you're passionate about (choose at least one)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interest_tags.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center p-2 ${
                      formData.interest_tags.includes(interest) 
                        ? 'bg-dna-emerald hover:bg-dna-forest' 
                        : 'hover:bg-dna-mint/20'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>

              {formData.interest_tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interest_tags.map((tag) => (
                      <Badge key={tag} className="bg-dna-emerald">
                        {tag}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => handleInterestToggle(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
