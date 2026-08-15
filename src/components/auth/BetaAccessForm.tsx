import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CONTINENT_COUNTRIES } from '@/data/continentCountries';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Beta access request. Signup is closed: this is the only way in until the
 * beta opens. Writes to `beta_waitlist`, which Admin > Waitlist already
 * reads, so requests are visible the moment they land.
 */
export const BetaAccessForm: React.FC = () => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const countries = useMemo(
    () => Array.from(new Set(Object.values(CONTINENT_COUNTRIES).flat())).sort((a, b) => a.localeCompare(b)),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const first = firstName.trim();
    const last = lastName.trim();

    if (!first || first.length > 80 || !last || last.length > 80) {
      toast({
        title: 'Name needed',
        description: 'Enter your first and last name, up to 80 characters each.',
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

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('beta_waitlist').insert({
        email: email.trim().toLowerCase(),
        full_name: `${first} ${last}`,
        country,
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
        <h2 className="text-h3">You are on the beta list</h2>
        <p className="text-body text-muted-foreground">
          We have your request. You will get an email with your access as soon as the beta opens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-1 shrink-0 text-dna-copper" />
          <h2 className="text-h3">Signup is closed for the beta</h2>
        </div>
        <p className="text-body text-muted-foreground">
          We are building DNA with a first group of beta Members. Request access below and we will
          email you when your account is ready. Already a Member? Use the Sign in tab.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="beta-first-name">First name</Label>
            <Input
              id="beta-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              maxLength={80}
              autoComplete="given-name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beta-last-name">Last name</Label>
            <Input
              id="beta-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              maxLength={80}
              autoComplete="family-name"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="beta-email">Email</Label>
          <Input
            id="beta-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="beta-country">Country</Label>
          <Select value={country} onValueChange={setCountry} disabled={isSubmitting}>
            <SelectTrigger id="beta-country">
              <SelectValue placeholder="Where are you based?" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Request beta access'}
        </Button>
      </form>
    </div>
  );
};

export default BetaAccessForm;
