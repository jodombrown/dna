import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Rocket } from 'lucide-react';

const BetaSignupComplete: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          title: "Invalid Link",
          description: "This beta signup link is invalid or has expired.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        // Verify token and get application details
        const { data, error } = await supabase
          .from('beta_applications')
          .select('*')
          .eq('magic_link_token', token)
          .eq('status', 'approved')
          .gt('magic_link_expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          toast({
            title: "Link Expired",
            description: "This beta signup link has expired or is invalid.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setApplication(data);
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          title: "Validation Error",
          description: "Unable to validate your beta signup link.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/app`;
      
      // Create the user account with all beta data
      const { error: signUpError } = await supabase.auth.signUp({
        email: application.email,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: application.name,
            company: application.company,
            role: application.role,
            experience: application.experience,
            motivation: application.motivation,
            is_beta_tester: 'true',
            beta_phase: application.beta_phase,
            beta_interest: application.beta_phase,
            signup_source: 'beta_program_approved'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          throw signUpError;
        }
        return;
      }

      // Mark the magic link as used
      await supabase
        .from('beta_applications')
        .update({ magic_link_token: null, magic_link_expires_at: null })
        .eq('id', application.id);

      toast({
        title: "Welcome to DNA Beta!",
        description: "Your beta account has been created successfully. Check your email to verify your account.",
      });
      
      // Navigate to app after a brief delay
      setTimeout(() => {
        navigate('/app');
      }, 1000);
      
    } catch (error: any) {
      console.error('Beta signup completion error:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dna-white flex items-center justify-center">
        <div className="text-center">
          <Rocket className="w-12 h-12 text-dna-emerald mx-auto mb-4 animate-pulse" />
          <p className="text-dna-forest">Validating your beta invitation...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-dna-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <Rocket className="w-12 h-12 text-dna-emerald mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dna-forest">Complete Your Beta Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome to DNA Beta, {application.name}! Please create your password to complete your account setup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={application.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="password">Create Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg p-4">
            <h4 className="font-semibold text-dna-emerald mb-2">Your Beta Phase:</h4>
            <p className="text-sm text-gray-700">{application.beta_phase}</p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Beta Account Setup'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BetaSignupComplete;