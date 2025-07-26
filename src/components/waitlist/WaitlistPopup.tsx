import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, X } from 'lucide-react';
import ComprehensiveLocationInput from '@/components/ui/comprehensive-location-input';
import { useIsMobile } from '@/hooks/use-mobile';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  scrollProgress?: number;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ isOpen, onClose, scrollProgress = 0 }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  // Calculate smooth opacity and transform based on scroll progress
  const isMobile_check = window.innerWidth < 768;
  const triggerPercentage = isMobile_check ? 100 : 80;
  const opacity = Math.min(1, Math.max(0, (scrollProgress - (triggerPercentage - 20)) / 20));
  const translateY = Math.max(0, (1 - opacity) * 20);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isMobile 
            ? "w-[92vw] max-w-[360px] h-[85vh] max-h-[600px] overflow-y-auto" 
            : "max-w-lg w-full"
        } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out`}
        style={{
          opacity: isOpen ? opacity : 0,
          transform: `translate(-50%, -50%) translateY(${isOpen ? translateY : 20}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dna-emerald/10 via-dna-copper/5 to-dna-gold/10 rounded-lg"></div>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="text-center space-y-3 relative z-10">
          <div className={`mx-auto ${isMobile ? 'w-12 h-12' : 'w-14 h-14'} bg-gradient-to-br from-dna-emerald to-dna-copper rounded-full flex items-center justify-center shadow-lg`}>
            <Users className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-white`} />
          </div>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-dna-forest`}>
            Join the DNA Waitlist
          </DialogTitle>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
            Be the first to connect with the global African diaspora community.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'mt-4' : 'mt-6'}`}>
          <div>
            <Label htmlFor="full_name" className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
              <Users className="h-4 w-4 text-dna-emerald" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full name"
              required
              className={isMobile ? 'text-sm' : ''}
            />
          </div>

          <div>
            <Label htmlFor="email" className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
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
              className={isMobile ? 'text-sm' : ''}
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

          <div className={`bg-dna-emerald/5 ${isMobile ? 'p-3' : 'p-4'} rounded-lg border border-dna-emerald/20`}>
            <h4 className={`font-semibold text-dna-forest ${isMobile ? 'text-sm mb-1.5' : 'mb-2'}`}>What you'll get:</h4>
            <ul className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 space-y-1`}>
              <li>• Early access to the DNA platform</li>
              <li>• Updates on platform development</li>
              <li>• Exclusive community events</li>
              <li>• Shape the future of diaspora networking</li>
            </ul>
          </div>

          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-3'} ${isMobile ? 'pt-3' : 'pt-4'}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className={`${isMobile ? 'w-full text-sm py-2' : 'flex-1'}`}
            >
              Maybe Later
            </Button>
            <Button 
              type="submit" 
              className={`${isMobile ? 'w-full text-sm py-2' : 'flex-1'} bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-forest hover:to-dna-gold text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>

        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 text-center ${isMobile ? 'mt-3' : 'mt-4'}`}>
          We respect your privacy. Your information will only be used to notify you about DNA platform updates.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;