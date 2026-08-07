import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Beta access request. Writes to `beta_waitlist`, which the Admin > Waitlist
 * tracker already reads, so requests are visible the moment they land.
 */
export const BetaAccessForm: React.FC = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
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
        message: message.trim() || null,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505' || error.code === '23503' || error.code === '23514' || error.message.includes('duplicate')) {
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
          We have your request. Signup is open now, so you can also create your account from the
          Sign up tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <CalendarClock className="w-4 h-4 mt-1 shrink-0 text-dna-copper" />
          <h2 className="text-h3">Signup is open</h2>
        </div>
        <p className="text-body text-muted-foreground">
          You can create your account right now from the Sign up tab. Prefer to hear from us first?
          Leave your details and we will reach out.
        </p>
      </div>


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
    </div>
  );
};

export default BetaAccessForm;
