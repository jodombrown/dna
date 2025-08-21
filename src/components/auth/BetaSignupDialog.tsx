import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BetaSignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaSignupDialog: React.FC<BetaSignupDialogProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send confirmation emails via Edge Function
      const payload = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
      };

      const { error } = await supabase.functions.invoke('send-universal-email', {
        body: {
          formType: 'waitlist_signup',
          formData: payload,
          userEmail: payload.email,
        },
      });

      if (error) throw error;

      // Reset and close
      setFormData({ fullName: '', email: '', location: '' });
      onClose();

      // Success toast
      toast({
        title: "You're on the list!",
        description: 'We\'ve emailed you a confirmation and will keep you updated.',
      });
    } catch (error) {
      console.error('Error submitting waitlist signup:', error);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setFormData({ fullName: '', email: '', location: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-xl p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl font-bold text-gray-900 text-left">
                Join the DNA Beta Waitlist
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 text-center">
              Be among the first to connect, collaborate, and contribute with Africa's global diaspora.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your first and last name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="border-gray-200 focus:border-dna-forest focus:ring-dna-forest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="border-gray-200 focus:border-dna-forest focus:ring-dna-forest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Start typing your city..."
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="border-gray-200 focus:border-dna-forest focus:ring-dna-forest pr-10"
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-dna-mint to-dna-copper text-white hover:from-dna-mint/90 hover:to-dna-copper/90"
              >
                {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
            <p>
              We respect your{' '}
              <a href="/privacy" className="text-dna-forest hover:underline">
                privacy
              </a>
              . Your information will only be used to notify you about DNA platform updates.
            </p>
            <p>
              By joining, you agree to our{' '}
              <a href="/terms" className="text-dna-forest hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaSignupDialog;