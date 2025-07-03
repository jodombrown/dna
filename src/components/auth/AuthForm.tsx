import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onPasswordReset: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode, onPasswordReset }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          console.error('Sign up error:', error);
          toast({
            title: "Sign Up Failed",
            description: error.message || "Failed to create account. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Your account has been created successfully. You can now start using the platform.",
          });
          // After successful signup, user will need onboarding
          navigate('/onboarding');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          toast({
            title: "Sign In Failed",
            description: error.message || "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          // Redirect to feed - OnboardingGuard will handle onboarding check
          navigate('/feed');
        }
      }
    } catch (error: any) {
      console.error('Unexpected auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/feed`,
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast({
          title: "LinkedIn Sign In Failed",
          description: error.message || "Failed to sign in with LinkedIn. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected LinkedIn OAuth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred with LinkedIn sign in.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-dna-forest">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-dna-forest">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-dna-forest">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-dna-copper"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
        disabled={loading}
      >
        {loading ? 'Loading...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button 
        type="button"
        variant="outline"
        className="w-full border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white"
        onClick={handleLinkedInAuth}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Continue with LinkedIn
      </Button>
      
      <div className="text-center">
        {mode === 'signin' ? (
          <>
            <button 
              type="button" 
              className="text-sm text-dna-copper hover:underline"
              onClick={onPasswordReset}
            >
              Forgot password?
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button" 
                className="text-dna-emerald hover:underline" 
                onClick={onToggleMode}
              >
                Create one
              </button>
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              type="button" 
              className="text-dna-emerald hover:underline" 
              onClick={onToggleMode}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
