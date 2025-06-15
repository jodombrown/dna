import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spinner } from "@/components/ui/spinner";

type AuthFormProps = {
  type: 'login' | 'register';
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState('');
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
      if (type === 'register') {
        const { error: signUpError } = await signUp(email, password);
        error = signUpError;
      } else {
        const { error: signInError } = await signIn(email, password);
        error = signInError;
      }

      if (error) {
        setFormError(error.message);
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
            {type === 'login' ? 'Signing In...' : 'Registering...'}
          </>
        ) : (
          type === 'login' ? 'Sign In' : 'Register'
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
