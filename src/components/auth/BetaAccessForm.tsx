import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CountryCombobox from '@/components/ui/CountryCombobox';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Beta access request. Writes to `beta_waitlist`, which the Admin > Waitlist
 * tracker reads, so requests are visible the moment they land.
 */
export const BetaAccessForm: React.FC = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length > 160) {
      toast({
        title: 'Name needed',
        description: 'Enter your name, up to 160 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      toast({
        title: 'Check your email',
        description: 'Enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    if (!country) {
      toast({
        title: 'Country needed',
        description: 'Select the country you are based in.',
        variant: 'destructive',
      });
      return;
    }
    if (linkedinUrl.trim() && linkedinUrl.trim().length > 300) {
      toast({
        title: 'LinkedIn URL too long',
        description: 'Keep it under 300 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (message.length > 2000) {
      toast({
        title: 'Message too long',
        description: 'Keep it under 2000 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('beta_waitlist').insert({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        country,
        linkedin_url: linkedinUrl.trim() || null,
        message: message.trim() || null,
        status: 'pending',
      });

      if (error) {
        if (
          error.code === '23505' ||
          error.code === '23503' ||
          error.code === '23514' ||
          error.message.includes('duplicate')
        ) {
          setIsDone(true);
          toast({
            title: 'You are already on the list',
            description: 'We have your request. Watch your inbox.',
          });
          return;
        }
        throw error;
      }

      setIsDone(true);
      toast({
        title: 'Request received',
        description: 'You are on the beta access list.',
      });
    } catch (err: unknown) {
      console.error('Beta access request failed', err);
      toast({
        title: 'Could not send that',
        description: 'Something went wrong. Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="text-center space-y-3 py-6">
        <CheckCircle2 className="w-10 h-10 mx-auto text-dna-emerald" />
        <h2 className="text-h3">You are on the list</h2>
        <p className="text-body text-muted-foreground">
          We review every request during beta. If access is granted you will get an email with a
          sign-in link that sets up your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="beta-name">Full name</Label>
        <Input
          id="beta-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          maxLength={160}
          required
          disabled={isSubmitting}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beta-email">Email</Label>
        <Input
          id="beta-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beta-country">Country</Label>
        <CountryCombobox
          value={country}
          onChange={(_code, name) => setCountry(name)}
          placeholder="Where you are based"
          disabled={isSubmitting}
          aria-label="Country you are based in"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beta-linkedin">LinkedIn URL</Label>
        <Input
          id="beta-linkedin"
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/you"
          maxLength={300}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beta-why">Why you want in</Label>
        <Textarea
          id="beta-why"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you are hoping to do on DNA. Optional."
          maxLength={2000}
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Request beta access'}
      </Button>
    </form>
  );
};

export default BetaAccessForm;
