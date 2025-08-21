import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BetaApplicationFormProps {
  initialEmail?: string;
  onSuccess?: () => void;
}

const BetaApplicationForm: React.FC<BetaApplicationFormProps> = ({ 
  initialEmail = '', 
  onSuccess 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Check for pre-filled data from waitlist
  const getPrefilledData = () => {
    try {
      const waitlistData = localStorage.getItem('dna_waitlist_data');
      if (waitlistData) {
        const data = JSON.parse(waitlistData);
        // Check if data is recent (within last hour)
        if (Date.now() - data.timestamp < 3600000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error parsing waitlist data:', error);
    }
    return null;
  };

  const prefilledData = getPrefilledData();
  
  const [formData, setFormData] = useState({
    email: initialEmail || prefilledData?.email || '',
    full_name: prefilledData?.fullName || '',
    motivation: '',
    impact_area: '',
    location: prefilledData?.location || '',
    linkedin_url: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.email || !formData.full_name || !formData.motivation || !formData.linkedin_url) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields including LinkedIn profile.",
          variant: "destructive"
        });
        return;
      }

      // Submit application
      const { error } = await supabase
        .from('beta_applications')
        .insert({
          email: formData.email.trim(),
          full_name: formData.full_name.trim(),
          motivation: formData.motivation.trim(),
          impact_area: formData.impact_area.trim() || null,
          location: formData.location.trim() || null,
          linkedin_url: formData.linkedin_url.trim() || null
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Application Already Exists",
            description: "You have already submitted a beta application with this email.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      // Fire confirmation emails (non-blocking)
      try {
        await supabase.functions.invoke('send-universal-email', {
          body: {
            formType: 'beta-application',
            formData: formData,
            userEmail: formData.email
          }
        });
      } catch (e) {
        console.warn('Email dispatch failed:', e);
      }


      setSubmitted(true);
      
      // Clear the waitlist data since it's been used
      localStorage.removeItem('dna_waitlist_data');
      
      onSuccess?.();
      
      toast({
        title: "Application Submitted!",
        description: "Your beta application has been submitted for review. We'll email you with updates.",
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-dna-forest mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-4">
            Thank you for your interest in joining the DNA beta. Our team will review your application and get back to you soon.
          </p>
          {prefilledData && (
            <p className="text-sm text-dna-emerald font-medium mb-2">
              ✓ Your waitlist information was automatically filled in to make the process easier.
            </p>
          )}
          <p className="text-sm text-gray-500">
            We'll send updates to <strong>{formData.email}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-dna-forest text-center">
          Apply for DNA Beta Access
        </CardTitle>
        <p className="text-center text-gray-600">
          Help us shape the future of the African diaspora network
        </p>
        {prefilledData && (
          <p className="text-center text-sm text-dna-emerald font-medium">
            ✓ Your waitlist information has been automatically filled in
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                required
                disabled={!!initialEmail}
              />
            </div>
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="impact_area" className="text-sm font-medium">
                Primary Impact Area
              </Label>
              <Input
                id="impact_area"
                value={formData.impact_area}
                onChange={(e) => handleInputChange('impact_area', e.target.value)}
                placeholder="e.g., Education, Healthcare, Tech"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin_url" className="text-sm font-medium">
              LinkedIn Profile *
            </Label>
            <Input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              required
            />
          </div>

          <div>
            <Label htmlFor="motivation" className="text-sm font-medium">
              Why do you want to join the DNA beta? *
            </Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => handleInputChange('motivation', e.target.value)}
              placeholder="Tell us about your connection to the African diaspora and how you'd like to contribute to the network..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Share your goals, interests, or how you'd like to contribute to the African diaspora community.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-copper/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Beta Application'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By submitting this application, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default BetaApplicationForm;