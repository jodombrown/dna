import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  scrollProgress?: number;
}

const WaitlistPopup: React.FC<WaitlistPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.location) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to join the waitlist.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      toast({
        title: "Welcome to DNA!",
        description: "You're in! We'll reach out with updates as the beta launches.",
      });

      // Store that user has joined waitlist to avoid showing popup again
      localStorage.setItem('dna_waitlist_joined', 'true');
      
      onClose();
      setFormData({ fullName: '', email: '', location: '' });
    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative ${
        isMobile 
          ? "w-[92vw] max-w-[360px] mx-2" 
          : "max-w-lg w-full mx-4"
        } bg-white rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-scale-in`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-100 hover:bg-dna-emerald/10 transition-colors duration-200 group"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-500 group-hover:text-dna-emerald transition-colors duration-200" />
        </button>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dna-emerald/10 via-dna-copper/5 to-dna-gold/10 rounded-lg"></div>
        
        {/* Content */}
        <div className="relative z-10 pr-8">
          <div className="text-center space-y-3 mb-6">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-dna-forest`}>
              Join the DNA Beta Waitlist
            </h2>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
              Be among the first to connect, collaborate, and contribute with Africa's global diaspora.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
            <div>
              <Label htmlFor="fullName" className={`${isMobile ? 'text-sm' : ''}`}>
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your first and last name"
                required
                className={isMobile ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label htmlFor="email" className={`${isMobile ? 'text-sm' : ''}`}>
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className={isMobile ? 'text-sm' : ''}
              />
            </div>

            <div>
              <Label htmlFor="location" className={`${isMobile ? 'text-sm' : ''}`}>
                Location (City, Country)
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Los Angeles, USA"
                required
                className={isMobile ? 'text-sm' : ''}
              />
            </div>

            <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-3'} ${isMobile ? 'pt-3' : 'pt-4'}`}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className={`${isMobile ? 'w-full text-sm py-2' : 'flex-1'}`}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={`${isMobile ? 'w-full text-sm py-2' : 'flex-1'} bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-forest hover:to-dna-gold text-white`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
              </Button>
            </div>
          </form>

          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 text-center ${isMobile ? 'mt-3' : 'mt-4'}`}>
            We respect your privacy. Your information will only be used to notify you about DNA platform updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitlistPopup;