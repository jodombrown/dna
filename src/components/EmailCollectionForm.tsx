
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const EmailCollectionForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && 
           email.length <= 254 && 
           !email.includes('..') &&
           !/<script|javascript:|data:/i.test(email);
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]{1,50}$/;
    return nameRegex.test(name) && 
           !/<script|javascript:|data:/i.test(name) &&
           name.trim().length >= 1;
  };

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') return false;
      const validHosts = ['linkedin.com', 'www.linkedin.com'];
      if (!validHosts.includes(urlObj.hostname)) return false;
      const pathPattern = /^\/in\/[a-zA-Z0-9\-]{3,100}\/?$/;
      return pathPattern.test(urlObj.pathname);
    } catch {
      return false;
    }
  };

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"'&]/g, '')
      .replace(/\s+/g, ' ');
  };

  const isRateLimited = (): boolean => {
    const now = Date.now();
    return now - lastSubmissionTime < 3000;
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (isRateLimited()) {
      toast.error('Please wait a moment before submitting again.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in your first name, last name, and email.');
      return;
    }

    if (!validateName(formData.firstName)) {
      toast.error('First name must contain only letters, spaces, hyphens, and apostrophes (max 50 characters).');
      return;
    }

    if (!validateName(formData.lastName)) {
      toast.error('Last name must contain only letters, spaces, hyphens, and apostrophes (max 50 characters).');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (formData.linkedin && !validateLinkedInUrl(formData.linkedin)) {
      toast.error('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile).');
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(Date.now());

    try {
      console.log('Sending request to collect-email function');
      
      const response = await fetch('https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/collect-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y`
        },
        body: JSON.stringify({
          firstName: formData.firstName.substring(0, 50),
          lastName: formData.lastName.substring(0, 50),
          email: formData.email.substring(0, 254),
          linkedin: formData.linkedin.substring(0, 200)
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        toast.success('Welcome to DNA! Check your email for confirmation and next steps.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          linkedin: ''
        });
      } else {
        throw new Error(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && 
                     formData.lastName && 
                     formData.email &&
                     validateName(formData.firstName) &&
                     validateName(formData.lastName) &&
                     validateEmail(formData.email) &&
                     (!formData.linkedin || validateLinkedInUrl(formData.linkedin));

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
          />
        </div>
        
        <div>
          <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            maxLength={200}
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !isFormValid}
          className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
        >
          {isSubmitting ? 'Joining...' : 'Join DNA'}
        </Button>
      </form>
    </div>
  );
};

export default EmailCollectionForm;
