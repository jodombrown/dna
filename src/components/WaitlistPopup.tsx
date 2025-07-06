import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Plus } from 'lucide-react';
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

const interests = [
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
    selectedInterests: [] as string[]
  });
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [customInterest, setCustomInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCountrySearch = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
    const filtered = countries.filter(country => 
      country.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interest)
        ? prev.selectedInterests.filter(i => i !== interest)
        : [...prev.selectedInterests, interest]
    }));
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !formData.selectedInterests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        selectedInterests: [...prev.selectedInterests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
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
          causes: formData.selectedInterests,
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
    setFormData({ fullName: '', email: '', country: '', selectedInterests: [] });
    setCustomInterest('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
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
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleCountrySearch(e.target.value)}
                placeholder="Type to search for your country..."
                required
              />
              {formData.country && filteredCountries.length > 0 && (
                <div className="max-h-32 overflow-y-auto border rounded-md bg-white">
                  {filteredCountries.slice(0, 5).map((country) => (
                    <div
                      key={country}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, country }));
                        setFilteredCountries([]);
                      }}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interest Areas (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={interest} className="text-sm font-normal">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-3">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Add your own interest..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCustomInterest}
                >
                  <Plus className="h-4 w-4" />
                </Button>
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