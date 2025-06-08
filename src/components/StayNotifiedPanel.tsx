
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, Users, Globe, Lightbulb } from 'lucide-react';

interface StayNotifiedPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const StayNotifiedPanel: React.FC<StayNotifiedPanelProps> = ({ isOpen, onClose }) => {
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
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          linkedin_url: formData.linkedin_url,
          message: formData.message
        }
      });

      if (error) throw error;

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <SheetTitle className="text-2xl font-bold text-dna-forest flex items-center gap-2">
            <Bell className="h-6 w-6 text-dna-emerald" />
            Stay Notified
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="bg-dna-sage/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dna-forest mb-4">What to Expect When You Join</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-dna-emerald mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-dna-forest">Early Access</h4>
                  <p className="text-sm text-gray-600">Be among the first to access our platform when we launch and connect with diaspora professionals worldwide.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-dna-emerald mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-dna-forest">Development Updates</h4>
                  <p className="text-sm text-gray-600">Regular updates on our platform development progress and upcoming features.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-dna-emerald mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-dna-forest">Exclusive Opportunities</h4>
                  <p className="text-sm text-gray-600">Access to exclusive events, collaboration opportunities, and networking sessions.</p>
                </div>
              </div>
            </div>
          </div>

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

          <p className="text-center text-sm text-gray-500">
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
      </SheetContent>
    </Sheet>
  );
};

export default StayNotifiedPanel;
