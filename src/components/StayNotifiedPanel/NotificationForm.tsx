
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationFormProps {
  onClose: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin_url: '',
    message: ''
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
      const { data, error } = await supabase.functions.invoke('send-universal-email', {
        body: {
          formType: 'contact',
          formData: {
            name: formData.name,
            email: formData.email,
            message: formData.message || 'I would like to stay notified about the DNA platform launch.',
            linkedin_url: formData.linkedin_url
          },
          userEmail: formData.email
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        toast.success('Thank you! We\'ve sent you a confirmation email.');
        setFormData({ name: '', email: '', linkedin_url: '', message: '' });
        onClose();
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="stay-notified-name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <Input
          id="stay-notified-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your full name"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="stay-notified-email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <Input
          id="stay-notified-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email address"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="stay-notified-linkedin" className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn URL (Optional)
        </label>
        <Input
          id="stay-notified-linkedin"
          type="url"
          value={formData.linkedin_url}
          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="stay-notified-message" className="block text-sm font-medium text-gray-700 mb-2">
          Message (Optional)
        </label>
        <Textarea
          id="stay-notified-message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us about your background and how you'd like to contribute to Africa's development..."
          rows={4}
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-dna-emerald hover:bg-dna-forest text-white py-3 text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Stay Notified'}
      </Button>
    </form>
  );
};

export default NotificationForm;
