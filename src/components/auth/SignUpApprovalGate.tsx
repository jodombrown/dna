import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errorLogger';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ApprovalState = 'idle' | 'checking' | 'approved' | 'not_approved' | 'error';

interface SignUpApprovalGateProps {
  /** Switches the parent tab to the access request form. */
  onRequestAccess: () => void;
}

/**
 * Email-first signup. The address is checked against admin-approved beta
 * access requests before the account fields unlock.
 *
 * This is the gate a visitor meets, not a security boundary: the check runs
 * in the browser, so the auth endpoint itself still accepts a direct call.
 * Closing that needs a server-side create plus open signup turned off in
 * Supabase Auth.
 */
export const SignUpApprovalGate: React.FC<SignUpApprovalGateProps> = ({ onRequestAccess }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [approval, setApproval] = useState<ApprovalState>('idle');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkApproval = async () => {
    const candidate = email.trim().toLowerCase();
    if (!EMAIL_RE.test(candidate)) {
      setApproval('idle');
      return;
    }
    setApproval('checking');
    const { data, error } = await supabase.rpc('is_signup_approved', { p_email: candidate });
    if (error) {
      console.error('Signup approval check failed', { email: candidate, error });
      setApproval('error');
      return;
    }
    setApproval(data === true ? 'approved' : 'not_approved');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (approval !== 'approved') {
      await checkApproval();
      return;
    }
    if (!fullName.trim()) {
      toast({
        title: 'Full name required',
        description: 'Enter your full name.',
        variant: 'destructive',
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Use at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Make sure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp(email.trim().toLowerCase(), password, fullName.trim());
      if (error) {
        toast({
          title: 'Sign up failed',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Welcome to DNA',
        description: 'Your account is created. Next, your profile.',
      });
      navigate('/onboarding');
    } catch (err: unknown) {
      console.error('Signup failed', err);
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const unlocked = approval === 'approved';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setApproval('idle');
          }}
          onBlur={checkApproval}
          required
          disabled={isSubmitting}
          autoComplete="email"
        />

        {approval === 'checking' && (
          <p className="text-meta text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Checking your access
          </p>
        )}

        {approval === 'approved' && (
          <p className="text-meta text-dna-emerald flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Approved. Set your details below.
          </p>
        )}

        {approval === 'not_approved' && (
          <p className="text-meta text-muted-foreground">
            This email is not approved yet.{' '}
            <button
              type="button"
              onClick={onRequestAccess}
              className="underline underline-offset-2 text-foreground"
            >
              Request access
            </button>
          </p>
        )}

        {approval === 'error' && (
          <p className="text-meta text-destructive">
            Could not check that right now. Try again in a moment.
          </p>
        )}
      </div>

      {unlocked && (
        <>
          <div className="space-y-2">
            <Label htmlFor="signup-fullname">Full name</Label>
            <Input
              id="signup-fullname"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </>
      )}

      <Button
        type="submit"
        className="w-full bg-dna-forest hover:bg-dna-forest/90"
        disabled={isSubmitting || approval === 'checking'}
      >
        {isSubmitting ? 'Creating your account...' : unlocked ? 'Create account' : 'Continue'}
      </Button>
    </form>
  );
};

export default SignUpApprovalGate;
