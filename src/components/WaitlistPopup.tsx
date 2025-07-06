import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Uganda', 'Tanzania', 
  'Cameroon', 'Morocco', 'Algeria', 'Egypt', 'United States', 'United Kingdom', 
  'Canada', 'Germany', 'France', 'Australia', 'Other'
];

const causes = [
  'Education & Skills Development',
  'Healthcare & Wellness',
  'Economic Development',
  'Technology & Innovation',
  'Agriculture & Food Security',
  'Climate & Environment',
  'Arts & Culture',
  'Governance & Policy',
  'Gender Equality',
  'Youth Empowerment'
];

const WaitlistPopup = ({ isOpen, onClose }: WaitlistPopupProps) => {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    selectedCauses: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCauseToggle = (cause: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCauses: prev.selectedCauses.includes(cause)
        ? prev.selectedCauses.filter(c => c !== cause)
        : [...prev.selectedCauses, cause]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          location: formData.country,
          role: 'individual',
          causes: formData.selectedCauses,
          status: 'pending'
        });

      if (error) throw error;

      setStep('confirmation');
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ fullName: '', email: '', country: '', selectedCauses: [] });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {step === 'form' ? (
            <>
              <DialogTitle className="text-2xl font-bold text-dna-forest mb-2">
                Join 500+ Diaspora Changemakers
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Get early access to the DNA platform. Help us shape the future of Africa.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-dna-emerald mx-auto mb-4" />
              <DialogTitle className="text-2xl font-bold text-dna-forest mb-2">
                You're In!
              </DialogTitle>
              <p className="text-gray-600">
                We've sent a confirmation email. You'll be the first to know when we launch.
              </p>
            </div>
          )}
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cause Interests (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {causes.map((cause) => (
                  <div key={cause} className="flex items-center space-x-2">
                    <Checkbox
                      id={cause}
                      checked={formData.selectedCauses.includes(cause)}
                      onCheckedChange={() => handleCauseToggle(cause)}
                    />
                    <Label htmlFor={cause} className="text-sm font-normal">
                      {cause}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <Button
              onClick={handleClose}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Back to Homepage
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;