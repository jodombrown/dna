
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const EmailCollectionForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first name, last name, and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Welcome to DNA!",
          description: "You're now part of the movement. Check your email for next steps and updates on our progress.",
        });
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          linkedin: ''
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email;

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
