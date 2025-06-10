
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeText, validateCharacterLimit } from '@/utils/validation';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onPasswordReset?: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode, onPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [lastSubmit, setLastSubmit] = useState<number>(0);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Full name validation for signup
    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (!validateCharacterLimit(fullName, 100)) {
        newErrors.fullName = 'Full name must be less than 100 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmit < 3000) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before trying again.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLastSubmit(now);

    try {
      let result;
      if (mode === 'signup') {
        const sanitizedFullName = sanitizeText(fullName);
        result = await signUp(email.trim().toLowerCase(), password, sanitizedFullName);
      } else {
        result = await signIn(email.trim().toLowerCase(), password);
      }

      if (result.error) {
        console.error('Authentication error:', result.error);
        
        // Provide user-friendly error messages
        let errorMessage = result.error.message;
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (errorMessage.includes('Signup not allowed')) {
          errorMessage = 'Account registration is currently restricted. Please contact support.';
        }

        toast({
          title: mode === 'signup' ? "Registration Failed" : "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (mode === 'signup') {
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account before signing in.",
        });
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in to DNA.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected authentication error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
    }
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-dna-forest">
          {mode === 'signin' ? 'Welcome Back' : 'Join DNA'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'signin' 
            ? 'Sign in to your account to continue' 
            : 'Create your account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-dna-forest">
                Full Name <span className="text-dna-crimson">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-dna-crimson' : ''}
                maxLength={100}
                required
              />
              {errors.fullName && (
                <p className="text-sm text-dna-crimson">{errors.fullName}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dna-forest">
              Email <span className="text-dna-crimson">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-dna-crimson' : ''}
              required
            />
            {errors.email && (
              <p className="text-sm text-dna-crimson">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-dna-forest">
              Password <span className="text-dna-crimson">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-dna-crimson' : ''}
              minLength={6}
              required
            />
            {errors.password && (
              <p className="text-sm text-dna-crimson">{errors.password}</p>
            )}
            {mode === 'signup' && (
              <p className="text-xs text-gray-600">Password must be at least 6 characters long</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-gold text-white"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-dna-emerald hover:text-dna-forest hover:underline"
              disabled={loading}
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
          
          {mode === 'signin' && onPasswordReset && (
            <div className="text-center">
              <button
                type="button"
                onClick={onPasswordReset}
                className="text-sm text-dna-emerald hover:text-dna-forest hover:underline"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
