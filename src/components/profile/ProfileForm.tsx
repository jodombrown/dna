
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  sanitizeText, 
  isValidLinkedInUrl, 
  validateCharacterLimit, 
  validateProfessionalField 
} from '@/utils/validation';

interface ProfileFormProps {
  profile?: any;
  onSave?: () => void;
}

interface FormErrors {
  full_name?: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [lastSubmit, setLastSubmit] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    profession: profile?.profession || '',
    company: profile?.company || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (!validateCharacterLimit(formData.full_name, 100)) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }

    // Professional field validation
    if (formData.profession && !validateProfessionalField(formData.profession)) {
      newErrors.profession = 'Profession contains invalid characters or is too long (100 chars max)';
    }

    if (formData.company && !validateProfessionalField(formData.company)) {
      newErrors.company = 'Company name contains invalid characters or is too long (100 chars max)';
    }

    if (formData.location && !validateCharacterLimit(formData.location, 100)) {
      newErrors.location = 'Location must be less than 100 characters';
    }

    // Bio validation
    if (formData.bio && !validateCharacterLimit(formData.bio, 1000)) {
      newErrors.bio = 'Bio must be less than 1000 characters';
    }

    // LinkedIn URL validation
    if (formData.linkedin_url && !isValidLinkedInUrl(formData.linkedin_url)) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check (prevent rapid submissions)
    const now = Date.now();
    if (now - lastSubmit < 2000) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before submitting again.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastSubmit(now);

    try {
      // Sanitize all text inputs
      const sanitizedData = {
        full_name: sanitizeText(formData.full_name),
        profession: sanitizeText(formData.profession),
        company: sanitizeText(formData.company),
        location: sanitizeText(formData.location),
        bio: sanitizeText(formData.bio),
        linkedin_url: formData.linkedin_url.trim(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...sanitizedData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message || 'Failed to update profile');
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      if (onSave) onSave();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-dna-forest">Professional Profile</CardTitle>
        <CardDescription>
          Share your professional background with the DNA community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-dna-forest">
              Full Name <span className="text-dna-crimson">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Your full name"
              className={errors.full_name ? 'border-dna-crimson' : ''}
              maxLength={100}
              required
            />
            {errors.full_name && (
              <p className="text-sm text-dna-crimson">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession" className="text-dna-forest">Profession</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              placeholder="e.g. Software Engineer, Doctor, Entrepreneur"
              className={errors.profession ? 'border-dna-crimson' : ''}
              maxLength={100}
            />
            {errors.profession && (
              <p className="text-sm text-dna-crimson">{errors.profession}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-dna-forest">Company/Organization</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Current company or organization"
              className={errors.company ? 'border-dna-crimson' : ''}
              maxLength={100}
            />
            {errors.company && (
              <p className="text-sm text-dna-crimson">{errors.company}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-dna-forest">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="City, Country"
              className={errors.location ? 'border-dna-crimson' : ''}
              maxLength={100}
            />
            {errors.location && (
              <p className="text-sm text-dna-crimson">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-dna-forest">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your background, and your connection to Africa..."
              className={errors.bio ? 'border-dna-crimson' : ''}
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-dna-crimson">{errors.bio}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.bio.length}/1000 characters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="text-dna-forest">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={errors.linkedin_url ? 'border-dna-crimson' : ''}
            />
            {errors.linkedin_url && (
              <p className="text-sm text-dna-crimson">{errors.linkedin_url}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-gold text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
