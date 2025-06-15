
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

type AuthFormProps = {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onPasswordReset: () => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode, onPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      let error;
      if (mode === 'signup') {
        console.log("Attempting signup for", email, fullName);
        const { error: signUpError } = await signUp(email, password, fullName);
        error = signUpError;
      } else {
        console.log("Attempting signin for", email);
        const { error: signInError } = await signIn(email, password);
        error = signInError;
      }

      if (error) {
        console.log("Auth error", error);
        if (error.code === "user_already_registered" || error.message?.match(/already registered|User already/i)) {
          setFormError("This email is already registered. Please sign in or use 'Forgot password?' if you forgot your password.");
        } else if (
          error.code === "invalid_credentials" ||
          error.message?.toLowerCase().includes("invalid login credentials")
        ) {
          setFormError("Invalid email or password. Double-check your credentials or reset your password.");
        } else {
          setFormError(error.message || "Registration or login failed");
        }
      } else {
        setFormError(null);
        navigate('/my-profile');
      }
    } catch (err: any) {
      setFormError(err.message || "Registration or login failed");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      },
    });
    if (error) {
      alert(error.message || "Google Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? "current-password" : "new-password"}
          />
          <button
            type="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((show) => !show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-dna-copper focus:outline-none"
            style={{ background: "none", border: "none" }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Password must be at least 6 characters.
        </div>
      </div>
      {formError && (
        <div className="bg-destructive/15 border border-destructive text-destructive rounded px-3 py-1 text-sm font-semibold my-2">
          {formError}
        </div>
      )}
      <Button disabled={loading} type="submit" className="w-full">
        {loading ? (
          <>
            <Spinner className="mr-2" size="sm" />
            {mode === 'signin' ? 'Signing In...' : 'Registering...'}
          </>
        ) : (
          mode === 'signin' ? 'Sign In' : 'Register'
        )}
      </Button>
      <div className="flex flex-col sm:flex-row justify-between mt-2 text-sm">
        <button type="button" className="underline" onClick={onToggleMode}>
          {mode === 'signin'
            ? "Don't have an account? Register"
            : "Already have an account? Sign in"}
        </button>
        {mode === 'signin' && (
          <button
            type="button"
            className="underline text-dna-copper mt-3 sm:mt-0 sm:ml-4"
            onClick={onPasswordReset}
          >
            Forgot password?
          </button>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-4">
        Trouble signing up or in?  
        <ul className="list-disc list-inside ml-1 mt-1 text-gray-400">
          <li>Double-check email and password.</li>
          <li>If resetting password, check your spam folder for the reset email.</li>
          <li>For fastest tests, disable "Confirm Email" in your Supabase authentication settings.</li>
        </ul>
      </div>
      <Button
        type="button"
        className="w-full bg-dna-emerald hover:bg-dna-forest mb-4 flex items-center justify-center gap-2"
        onClick={signInWithGoogle}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" className="inline mr-2">
          <g>
            <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8.1h11.2c-1.6 4.3-5.7 7.4-11.2 7.4-6.6 0-12-5.4-12-12s5.4-12 12-12c2.3 0 4.4 0.7 6.2 1.9l6.2-6.2C36.4 6.5 30.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-0.1-2.7-0.4-3.9z"/>
            <path fill="#34A853" d="M6.7 14.8l6.6 4.8C15.2 16.2 18.4 14 22 14c2 0 3.8 0.7 5.2 2.1l6.6-6.6C30.3 6.7 27.3 5.1 24 5.1 17.3 5.1 11.6 9.7 9.1 14.8z"/>
            <path fill="#FBBC05" d="M24 44c3.3 0 6.3-1.1 8.8-3l-6.6-5.4C24.6 35.9 24.3 36 24 36c-3.6 0-6.6-2.2-8-5.4l-6.6 5.1C11.7 41.3 17.3 44 24 44z"/>
            <path fill="#EA4335" d="M43.6 20.5H24v8.1h11.2c-0.8 2.1-2.4 3.9-4.2 5.1l6.6 5.4c3.9-3.6 6.2-8.9 6.2-14.6 0-1.3-0.1-2.7-0.4-3.9z"/>
          </g>
        </svg>
        Continue with Google
      </Button>
    </form>
  );
};

export default AuthForm;
