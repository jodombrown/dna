
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from "@/components/ui/spinner";

type AuthFormProps = {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onPasswordReset: () => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode, onPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
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
        const { error: signUpError } = await signUp(email, password, fullName);
        error = signUpError;
      } else {
        const { error: signInError } = await signIn(email, password);
        error = signInError;
      }

      if (error) {
        setFormError(error.message || "Registration or login failed");
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
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
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
      <div className="flex justify-between mt-2 text-sm">
        <button type="button" className="underline" onClick={onToggleMode}>
          {mode === 'signin'
            ? "Don't have an account? Register"
            : "Already have an account? Sign in"}
        </button>
        {mode === 'signin' && (
          <button
            type="button"
            className="underline text-dna-copper ml-4"
            onClick={onPasswordReset}
          >
            Forgot password?
          </button>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
