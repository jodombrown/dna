import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, ChevronDown, ChevronUp, Search, MapPin, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/LocationSelector';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
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

const WaitlistPopup = ({ isOpen, onClose, trigger }: WaitlistPopupProps) => {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: { country: '', state: '', city: '' },
    selectedInterests: [] as string[]
  });
  const [customInterest, setCustomInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(true);
  const { toast } = useToast();

  const handleLocationChange = (location: { country: string; state: string; city: string }) => {
    setFormData(prev => ({ ...prev, location }));
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

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.location.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create location string
      const locationString = [formData.location.city, formData.location.state, formData.location.country]
        .filter(Boolean)
        .join(', ');

      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          location: locationString,
          role: 'individual',
          causes: formData.selectedInterests,
          status: 'pending'
        });

      if (error) throw error;

      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-universal-email', {
          body: {
            formType: 'waitlist',
            formData: {
              fullName: formData.fullName,
              email: formData.email,
              location: locationString,
              role: 'individual',
              causes: formData.selectedInterests
            },
            userEmail: formData.email
          }
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          // Don't throw here - we still want to show success even if email fails
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't block the success flow if email fails
      }

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
    setFormData({ fullName: '', email: '', location: { country: '', state: '', city: '' }, selectedInterests: [] });
    setCustomInterest('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" className="w-[90%] sm:w-[400px] overflow-y-auto">
        {step === 'form' ? (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold text-dna-forest">
                Join 500+ Diaspora Changemakers
              </SheetTitle>
              <p className="text-gray-600 text-sm">
                Get early access to the DNA platform. Help us shape the future of Africa.
              </p>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
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
              </div>

              {/* Location Selection */}
              <LocationSelector
                value={formData.location}
                onChange={handleLocationChange}
                required={true}
              />

              {/* Interests Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setInterestsOpen(!interestsOpen)}
                  className="flex items-center justify-between w-full text-sm font-medium mb-3 text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <span>Interest Areas (Optional)</span>
                  {interestsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {/* Selected Interests Tags */}
                {formData.selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.selectedInterests.map((interest) => (
                      <Badge 
                        key={interest} 
                        variant="secondary" 
                        className="bg-dna-emerald/10 text-dna-forest border-dna-emerald/20 flex items-center gap-1"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:bg-dna-emerald/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {interestsOpen && (
                  <div className="space-y-3">
                    {/* Interest Options */}
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-1 gap-2">
                        {interests.map((interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={interest}
                              checked={formData.selectedInterests.includes(interest)}
                              onCheckedChange={() => handleInterestToggle(interest)}
                            />
                            <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Custom Interest Input */}
                    <div className="flex gap-2">
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
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="h-16 w-16 text-dna-emerald mx-auto" />
            <div className="space-y-2">
              <SheetTitle className="text-2xl font-bold text-dna-forest">
                You're In!
              </SheetTitle>
              <p className="text-gray-600">
                We've sent a confirmation email. You'll be the first to know when we launch.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Back to Homepage
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WaitlistPopup;