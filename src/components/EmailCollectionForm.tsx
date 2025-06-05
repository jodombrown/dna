
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailCollectionForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('collect-email', {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      console.log('Email submission successful:', data);
    } catch (err: any) {
      console.error('Error submitting email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-dna-emerald/20">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-dna-emerald mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dna-forest mb-2">
            Thank You!
          </h3>
          <p className="text-gray-600">
            We've received your information and will keep you updated on our progress. 
            Get ready to be part of something amazing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-dna-emerald/20">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-dna-copper mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dna-forest mb-2">
            Stay Informed
          </h3>
          <p className="text-gray-600 text-sm">
            Join our community and be the first to know about our progress. 
            We're launching our prototype in June 2025!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-dna-forest">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="border-gray-300 focus:border-dna-copper focus:ring-dna-copper"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-dna-forest">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="border-gray-300 focus:border-dna-copper focus:ring-dna-copper"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email" className="text-dna-forest">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="border-gray-300 focus:border-dna-copper focus:ring-dna-copper"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-gold text-white py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join the Movement'
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy and will only send updates about DNA platform development.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailCollectionForm;
