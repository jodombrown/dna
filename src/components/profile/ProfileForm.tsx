
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText, isRateLimited } from '@/utils/securityValidation';
import { getGenericErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import BasicInfoFields from './form/BasicInfoFields';
import ContactFields from './form/ContactFields';
import { validateProfileForm } from './form/ValidationUtils';

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

  const handleFieldChange = (field: string, value: string) => {
    // Additional input sanitization on change
    const sanitizedValue = sanitizeText(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced rate limiting check
    const now = Date.now();
    if (isRateLimited(lastSubmit, 2000)) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before submitting again.",
        variant: "destructive",
      });
      logSecurityEvent('rate_limit_exceeded', user?.id, { action: 'profile_update' });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      logSecurityEvent('unauthorized_profile_update', undefined);
      return;
    }

    const validationErrors = validateProfileForm(formData, user.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
      // Enhanced sanitization of all text inputs
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
        logSecurityEvent('profile_update_failed', user.id, { error: error.message });
        throw new Error(getGenericErrorMessage(error));
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      logSecurityEvent('profile_updated_successfully', user.id);
      if (onSave) onSave();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: getGenericErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <BasicInfoFields
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
          
          <ContactFields
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

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
