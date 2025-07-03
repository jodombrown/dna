
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, logSecurityEvent, SecurityEventSeverity } from '@/utils/securityEnhancements';
import { getGenericErrorMessage } from '@/utils/errorHandling';
import { validateProfileUpdateSecurity } from '@/utils/securityMiddleware';
import { useSecurityRateLimit } from '@/hooks/useSecurityRateLimit';
import BasicInfoFields from './form/BasicInfoFields';
import ContactFields from './form/ContactFields';
import { validateProfileForm } from './form/ValidationUtils';
import { getFieldMaxLength, shouldRemoveUrls } from './ProfileFormHelpers';

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
  country_of_origin?: string;
  current_country?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Rate limiting for profile updates (3 updates per 5 minutes)
  const { isLimited, timeRemaining, checkLimit, recordAttempt } = useSecurityRateLimit(
    'profile_update',
    { maxAttempts: 3, windowMs: 5 * 60 * 1000, penaltyMultiplier: 1.5 }
  );
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    profession: profile?.profession || '',
    company: profile?.company || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
    country_of_origin: profile?.country_of_origin || '',
    current_country: profile?.current_country || '',
    years_in_diaspora: profile?.years_in_diaspora || '',
  });

  const handleFieldChange = (field: string, value: string) => {
    // Additional input sanitization on change
    const sanitizedValue = sanitizeInput(value, { 
      maxLength: getFieldMaxLength(field),
      allowHtml: false,
      removeUrls: shouldRemoveUrls(field)
    });
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (checkLimit()) {
      toast({
        title: "Too Many Updates",
        description: `Please wait ${timeRemaining} seconds before updating again.`,
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
      await logSecurityEvent({
        type: 'unauthorized_profile_update',
        severity: SecurityEventSeverity.HIGH
      });
      return;
    }

    // Enhanced security validation
    const securityValidation = await validateProfileUpdateSecurity(formData, user.id);
    if (!securityValidation.isValid) {
      setErrors({ full_name: securityValidation.errors[0] });
      toast({
        title: "Security Validation Failed",
        description: securityValidation.errors[0] || "Please review your profile data.",
        variant: "destructive",
      });
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

    recordAttempt();
    setLoading(true);

    try {
      // Use the sanitized data from security validation
      const sanitizedData = {
        full_name: securityValidation.sanitizedData?.full_name || formData.full_name,
        profession: securityValidation.sanitizedData?.profession || formData.profession,
        company: securityValidation.sanitizedData?.company || formData.company,
        location: securityValidation.sanitizedData?.location || formData.location,
        bio: securityValidation.sanitizedData?.bio || formData.bio,
        linkedin_url: formData.linkedin_url.trim(),
        country_of_origin: securityValidation.sanitizedData?.country_of_origin || formData.country_of_origin,
        current_country: securityValidation.sanitizedData?.current_country || formData.current_country,
        years_in_diaspora: formData.years_in_diaspora ? parseInt(formData.years_in_diaspora) : null,
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
        await logSecurityEvent({
          type: 'profile_update_failed',
          severity: SecurityEventSeverity.MEDIUM,
          userId: user.id,
          details: { error: error.message }
        });
        throw new Error(getGenericErrorMessage(error));
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      await logSecurityEvent({
        type: 'profile_updated_successfully',
        severity: SecurityEventSeverity.LOW,
        userId: user.id
      });
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
        <CardTitle className="text-dna-forest">Diaspora Professional Profile</CardTitle>
        <CardDescription>
          Connect with diaspora professionals who share your heritage and professional goals
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
            disabled={loading || isLimited}
          >
            {loading ? 'Saving...' : isLimited ? `Wait ${timeRemaining}s` : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
