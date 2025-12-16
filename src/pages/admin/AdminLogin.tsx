import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// Admin RPC functions use 'as any' to bypass TypeScript since they're not in auto-generated types

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
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
        console.error('Error checking auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  // Validate email on blur
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) {
      setEmailValidation(null);
      setEmailError(null);
      return;
    }

    setIsValidatingEmail(true);
    setEmailError(null);

    try {
      const { data, error } = await (supabase as any).rpc('is_valid_admin_email', {
        check_email: email.toLowerCase().trim()
      });

      if (error) {
        console.error('Email validation error:', error);
        setEmailError('Unable to validate email. Please try again.');
        setEmailValidation(null);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        setEmailValidation({
          isValid: result.is_valid,
          roleLevel: result.role_level,
          isSuperAdmin: result.is_super_admin
        });

        if (!result.is_valid) {
          setEmailError('This email is not authorized for admin access. Only @diasporanetwork.africa emails or pre-approved accounts can access the admin panel.');
        }
      } else {
        setEmailValidation({ isValid: false, roleLevel: null, isSuperAdmin: false });
        setEmailError('This email is not authorized for admin access.');
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailError('Unable to validate email. Please try again.');
      setEmailValidation(null);
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // First validate the email if not already validated
    if (!emailValidation) {
      await handleEmailBlur();
      // Re-check after validation
      if (!emailValidation?.isValid) {
        return;
      }
    }

    if (!emailValidation?.isValid) {
      toast({
        title: 'Access Denied',
        description: 'This email is not authorized for admin access.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.session) {
        // Create admin session
        try {
          await (supabase as any).rpc('create_admin_session', {
            p_ip_address: null,
            p_user_agent: navigator.userAgent,
            p_device_info: {
              platform: navigator.platform,
              language: navigator.language,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height
            }
          });
        } catch (sessionError) {
          console.error('Error creating admin session:', sessionError);
          // Continue anyway - session logging is non-critical
        }

        toast({
          title: 'Welcome to Admin Portal',
          description: `Signed in as ${emailValidation.roleLevel?.replace('_', ' ')}`,
        });

        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6">
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
              <Lock className="w-5 h-5 text-emerald-500" />
              <span>Domain-restricted authentication</span>
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
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Back Link */}
          <div className="lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
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
            <h2 className="text-2xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="text-slate-500">
              Enter your credentials to access the admin portal
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@diasporanetwork.africa"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailValidation(null);
                        setEmailError(null);
                      }}
                      onBlur={handleEmailBlur}
                      required
                      disabled={isLoading}
                      className={`pr-10 ${
                        emailValidation?.isValid
                          ? 'border-emerald-500 focus-visible:ring-emerald-500'
                          : emailError
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : ''
                      }`}
                    />
                    {isValidatingEmail && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                    )}
                    {!isValidatingEmail && emailValidation?.isValid && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                    {!isValidatingEmail && emailError && (
                      <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {emailValidation?.isValid && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Authorized: {emailValidation.roleLevel?.replace('_', ' ')}
                      {emailValidation.isSuperAdmin && ' (Super Admin)'}
                    </p>
                  )}
                </div>

                {/* Email Error Alert */}
                {emailError && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {emailError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isLoading || !email || !password || !!emailError}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In to Admin Portal
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
                  All login attempts and admin actions are logged. Unauthorized access attempts will be reported.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Admin */}
          <p className="text-center text-sm text-slate-500">
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
