
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const EmailCollectionForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Welcome to DNA!",
          description: "You're now part of the movement. We'll keep you updated on our progress.",
        });
        setEmail('');
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
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !email}
          className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
        >
          {isSubmitting ? 'Joining...' : 'Join DNA'}
        </Button>
      </form>
    </div>
  );
};

export default EmailCollectionForm;
