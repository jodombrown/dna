import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordComplete() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the password reset redirect
    const handleAuthStateChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in after clicking reset link
        console.log('User session found, ready for password reset');
      } else {
        // Check if this is a password reset flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
        } else {
          // No valid session or tokens, redirect to reset password page
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive"
          });
          navigate('/reset-password');
        }
      }
    };

    handleAuthStateChange();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Validate passwords
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
      } else {
        setStatus('success');
        toast({
          title: "Password updated successfully!",
          description: "You can now sign in with your new password.",
        });
        
        // Redirect to auth page after a short delay
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Failed to update password');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 to-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card shadow-xl rounded-2xl p-8 text-center space-y-6 border">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-dna-mint/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-dna-forest" />
            </div>
            <h1 className="text-2xl font-bold text-dna-forest">Password Updated!</h1>
            <p className="text-muted-foreground">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>
          
          <Button 
            asChild 
            className="w-full h-12 bg-dna-copper hover:bg-dna-copper/90"
          >
            <Link to="/auth">Continue to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card shadow-xl rounded-2xl p-8 space-y-6 border">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-dna-forest">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your DNA account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                disabled={status === 'loading'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 pr-10"
                disabled={status === 'loading'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={status === 'loading'} 
            className="w-full h-12 bg-dna-copper hover:bg-dna-copper/90"
          >
            {status === 'loading' ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Error updating password</p>
              <p className="mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Password requirements:</p>
          <ul className="space-y-1 pl-4">
            <li className={`flex items-center gap-2 ${password.length >= 6 ? 'text-dna-forest' : ''}`}>
              <span className="w-1 h-1 bg-current rounded-full" />
              At least 6 characters long
            </li>
            <li className={`flex items-center gap-2 ${password === confirmPassword && password ? 'text-dna-forest' : ''}`}>
              <span className="w-1 h-1 bg-current rounded-full" />
              Passwords must match
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}