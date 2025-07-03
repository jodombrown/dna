import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Eye, EyeOff } from 'lucide-react';

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
            description: "Please check your email to verify your account.",
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
