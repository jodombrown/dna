import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MinimalProfileStep from '@/components/onboarding/MinimalProfileStep';

// Single step onboarding

const Onboarding = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: user?.user_metadata?.full_name?.split(' ')[0] || '',
    last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
    current_country: '',
    avatar_url: user?.user_metadata?.picture || '',
    professional_sectors: [] as string[],
    interests: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If profile already exists and basic info is complete, redirect to dashboard
  useEffect(() => {
    if (profile && profile.first_name && profile.avatar_url) {
      navigate('/dna/me');
    }
  }, [profile, navigate]);

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    return Boolean(
      formData.first_name &&
      formData.last_name &&
      formData.current_country &&
      formData.avatar_url &&
      formData.professional_sectors.length > 0 &&
      formData.interests.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Generate username from full name
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
      const baseUsername = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Create or update profile with minimal required data
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: baseUsername,
        current_country: formData.current_country,
        avatar_url: formData.avatar_url,
        professional_sectors: formData.professional_sectors,
        interests: formData.interests,
        is_public: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });

      if (error) throw error;

      // Refresh the profile to get the updated data
      await refreshProfile();

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been created successfully.",
      });

      // Redirect to dashboard
      navigate('/dna/me');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">
            Welcome to DNA Community
          </h1>
          <p className="text-muted-foreground">
            Complete your profile in just one step to get started
          </p>
        </div>

        {/* Main Content */}
        <MinimalProfileStep 
          data={formData} 
          updateData={updateFormData}
        />

        {/* Submit Button */}
        <div className="text-center mt-8">
          <Button
            onClick={handleSubmit}
            disabled={!canProceedToNext() || isSubmitting}
            className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 text-lg"
            size="lg"
          >
            {isSubmitting ? "Creating Your Profile..." : "Join DNA Community"}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            You can complete additional profile details later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;