import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/lib/errorLogger';

interface AdminValidation {
  isValid: boolean;
  roleLevel: string | null;
  isSuperAdmin: boolean;
}

const AdminLogin = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailValidation, setEmailValidation] = useState<AdminValidation | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Check if already authenticated as admin
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Check if current user is admin
          const { data, error } = await (supabase as any).rpc('get_current_admin_status');

          if (!error && data && Array.isArray(data) && data.length > 0 && data[0].is_admin) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        // Error checking auth
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (signInError) {
        setEmailError('Incorrect email or password.');
        return;
      }

      const { data, error } = await (supabase as any).rpc('get_current_admin_status');

      if (error) {
        setEmailError('Unable to verify admin access. Please try again.');
        return;
      }

      const status = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!status?.is_admin) {
        await supabase.auth.signOut();
        setEmailError('This account is not authorized for admin access.');
        toast({
          title: 'Access denied',
          description: 'This account is not authorized for admin access.',
          variant: 'destructive',
        });
        return;
      }

      setEmailValidation({
        isValid: true,
        roleLevel: status.role_level ?? null,
        isSuperAdmin: Boolean(status.is_super_admin),
      });

      navigate('/admin/dashboard', { replace: true });
    } catch (error: unknown) {
      setEmailError(getErrorMessage(error) || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl" />
        </div>

        {/* Back Link */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to DNA Platform
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-lg bg-emerald-600 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              DNA Admin Portal
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Secure administrative access to manage users, content, and platform settings.
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-white/60">
              <Mail className="w-5 h-5 text-emerald-500" />
              <span>Credentialed admin authentication</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Lock className="w-5 h-5 text-emerald-500" />
              <span>Domain-restricted access</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <AlertTriangle className="w-5 h-5 text-emerald-500" />
              <span>All actions are logged for security</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-sm">
          Access restricted to authorized personnel only.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-neutral-50 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Back Link */}
          <div className="lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to DNA Platform
            </Link>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="lg:hidden w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Admin Sign In</h2>
            <p className="text-neutral-500">
              Sign in with your admin credentials
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-neutral-200 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@diasporanetwork.africa"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setEmailError(null);
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>

                {emailValidation?.isValid && (
                  <p className="text-meta text-dna-emerald flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Authorized: {emailValidation.roleLevel?.replace('_', ' ')}
                    {emailValidation.isSuperAdmin && ' (Super Admin)'}
                  </p>
                )}

                {/* Error Alert */}
                {emailError && (
                  <Alert variant="destructive" className="bg-destructive/10">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-body">
                      {emailError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p className="text-amber-700">
                  Admin access is limited to authorized @diasporanetwork.africa accounts. All login attempts are logged.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Admin */}
          <p className="text-center text-sm text-neutral-500">
            Need admin access?{' '}
            <a
              href="mailto:admin@diasporanetwork.africa"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Contact an administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
