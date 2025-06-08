
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SimpleEmailForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Thank you! We\'ve sent you a confirmation email.');
        setFormData({ name: '', email: '', linkedin: '' });
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Email submission error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-dna-emerald to-dna-forest" data-email-form>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Join the Movement?
            </h2>
            <p className="text-lg text-gray-600">
              Be the first to connect with Africa's diaspora professionals when we launch
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile (Optional)
              </label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={isSubmitting}
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white py-4 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Join the DNA Platform'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            We respect your privacy. Your information will only be used to notify you about our platform launch. 
            The email you receive during our Prototype Phase is from our mother company Roadmap.Africa.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimpleEmailForm;
