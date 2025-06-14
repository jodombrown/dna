import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Add this hook for working with reCAPTCHA v2/v3
function useRecaptcha() {
  const execute = async (): Promise<string | null> => {
    // @ts-ignore
    if (!window.grecaptcha) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }
    // @ts-ignore
    return new Promise((resolve) => {
      // v2 invisible demo, assumes a <div id="recaptcha"></div> exists
      // For production, best to use v3 ("grecaptcha.execute") and your site key
      // Here we'll use v2 for demo: 
      // @ts-ignore
      window.grecaptcha.ready(() => {
        // Place your Site Key here for v3 or
        // render a widget for v2/invisible
        // This demo expects you use invisible v2 and have your site key available
        // For _production_ switch to v3!
        window.grecaptcha.render('recaptcha', {
          sitekey: '6LeyHWErAAAAALC88CkKx_VadAXbKZKemQeQBpDL', // PUBLIC SITE KEY!
          badge: 'inline',
          size: 'invisible',
          callback: resolve,
        });
        // Execute after rendering
        window.grecaptcha.execute();
      });
    });
  };

  return { execute };
}

const SimpleEmailForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin_url: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { execute } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in your name and email",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await execute();
      if (!recaptchaToken) {
        toast({
          title: "reCAPTCHA failed",
          description: "Unable to verify, please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          linkedin_url: formData.linkedin_url,
          message: formData.message,
          recaptchaToken // pass to backend
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success!",
          description: "Thank you! We've sent you a confirmation email.",
        });
        setFormData({ name: '', email: '', linkedin_url: '', message: '' });
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email submission error:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-dna-mint/20 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
              Ready to Join the Movement?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be the first to connect with Africa's diaspora professionals when we launch our revolutionary platform
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6" data-email-form>
            {/* Demo: reCAPTCHA placeholder required for v2 */}
            <div id="recaptcha" style={{display: 'none'}}></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  className="border-dna-mint/30 focus:border-dna-emerald focus:ring-dna-emerald"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="border-dna-mint/30 focus:border-dna-emerald focus:ring-dna-emerald"
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL (Optional)
              </label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={isSubmitting}
                className="border-dna-mint/30 focus:border-dna-emerald focus:ring-dna-emerald"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your background and how you'd like to contribute..."
                rows={4}
                disabled={isSubmitting}
                className="resize-none border-dna-mint/30 focus:border-dna-emerald focus:ring-dna-emerald"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-gradient-to-r from-dna-emerald to-dna-forest hover:from-dna-forest hover:to-dna-emerald text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Join DNA'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            We respect your privacy. Your information will only be used to notify you about our platform launch. 
            During the Prototyping and Building Phase, emails will come from our mother company{' '}
            <a 
              href="https://www.Roadmap.Africa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dna-emerald hover:text-dna-forest underline"
            >
              Roadmap.Africa
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimpleEmailForm;
