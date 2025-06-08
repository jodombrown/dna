
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SimpleEmailForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.trim()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first name, last name, and email.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Since this is a prototype, we'll simulate the email submission
      // In a real implementation, this would send to a backend service
      console.log('Form submission:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store in localStorage as a fallback for demo purposes
      const submissions = JSON.parse(localStorage.getItem('dna-submissions') || '[]');
      submissions.push({
        ...formData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      localStorage.setItem('dna-submissions', JSON.stringify(submissions));
      
      toast({
        title: "Thank you!",
        description: "You've been added to our early access list. We'll be in touch soon!",
      });
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        linkedin: ''
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && 
                     formData.lastName && 
                     formData.email &&
                     validateEmail(formData.email);

  return (
    <div data-email-form className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
      <Badge className="mb-4 bg-dna-emerald text-white">
        Join the Movement
      </Badge>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Be First to Connect
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        Get early access and updates on our platform development.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name *
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              maxLength={50}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name *
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              maxLength={50}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            maxLength={254}
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">
            LinkedIn Profile (Optional)
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            maxLength={200}
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !isFormValid}
          className="w-full bg-dna-emerald hover:bg-dna-forest text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Joining...' : 'Join DNA'}
        </Button>
      </form>
    </div>
  );
};

export default SimpleEmailForm;
