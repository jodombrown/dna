import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users } from 'lucide-react';
import ComprehensiveLocationInput from '@/components/ui/comprehensive-location-input';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert into waitlist_signups table
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          full_name: formData.full_name,
          email: formData.email,
          location: formData.location || null,
          role: 'waitlist_member',
          status: 'pending'
        });

      if (error) throw error;

      // Send notification email
      await supabase.functions.invoke('send-universal-email', {
        body: {
          formType: 'waitlist_signup',
          formData: formData,
          userEmail: formData.email
        }
      });

      toast({
        title: "Welcome to the Waitlist!",
        description: "You'll be the first to know when DNA launches. Check your email for confirmation.",
      });

      // Store that user has joined waitlist to avoid showing popup again
      localStorage.setItem('dna_waitlist_joined', 'true');
      
      onClose();
      setFormData({ full_name: '', email: '', location: '' });
    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 animate-[float_3s_ease-in-out_infinite] transform-gpu">
        <div className="absolute inset-0 bg-gradient-to-br from-dna-emerald/10 via-dna-copper/5 to-dna-gold/10 rounded-lg"></div>
        <DialogHeader className="text-center space-y-3 relative z-10">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-dna-emerald to-dna-copper rounded-full flex items-center justify-center animate-bounce shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-dna-forest">
            Join the DNA Waitlist
          </DialogTitle>
          <p className="text-gray-600 text-sm leading-relaxed">
            Be the first to connect with the global African diaspora community.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-dna-emerald" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-dna-emerald" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <ComprehensiveLocationInput
            id="location"
            label="Location"
            value={formData.location}
            onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            placeholder="City, State/Province, Country"
            required={false}
            icon={true}
          />

          <div className="bg-dna-emerald/5 p-4 rounded-lg border border-dna-emerald/20">
            <h4 className="font-semibold text-dna-forest mb-2">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Early access to the DNA platform</li>
              <li>• Updates on platform development</li>
              <li>• Exclusive community events</li>
              <li>• Shape the future of diaspora networking</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-forest hover:to-dna-gold text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Your information will only be used to notify you about DNA platform updates.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;