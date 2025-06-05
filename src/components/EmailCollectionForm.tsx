
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/utils/securityValidation';

const EmailCollectionForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState<number>(0);
  const { toast } = useToast();

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const isRateLimited = (lastSubmit: number, cooldownMs: number): boolean => {
    return Date.now() - lastSubmit < cooldownMs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    if (isRateLimited(lastSubmit, 3000)) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before submitting again.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!email.trim() || !fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (linkedinUrl && !validateLinkedInUrl(linkedinUrl)) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastSubmit(now);

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: email.trim().toLowerCase(),
        full_name: sanitizeText(fullName),
        linkedin_url: linkedinUrl.trim(),
      };

      const { error } = await supabase.functions.invoke('collect-email', {
        body: sanitizedData,
      });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "You've been added to our early access list. We'll be in touch soon!",
      });

      // Clear form
      setEmail('');
      setFullName('');
      setLinkedinUrl('');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-dna-forest/10">
        <h2 className="text-2xl font-bold text-dna-forest mb-6 text-center">
          Join the Early Access List
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="url"
              placeholder="LinkedIn profile (optional)"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              maxLength={200}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-gold text-white font-semibold py-3"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Get Early Access'}
          </Button>
        </form>
        
        <p className="text-sm text-gray-600 mt-4 text-center">
          Be among the first to experience the future of African diaspora networking.
        </p>
      </div>
    </div>
  );
};

export default EmailCollectionForm;
