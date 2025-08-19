import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isAdminEmail, LAUNCH_MESSAGES } from '@/utils/prelaunchGate';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      // Check if user is admin and redirect appropriately
      if (isAdminEmail(user.email || '')) {
        navigate('/admin');
      } else {
        toast({
          title: 'Access Denied',
          description: 'Admin access required.',
          variant: 'destructive'
        });
        navigate('/');
      }
    }
  }, [user, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your admin email address.',
        variant: 'destructive'
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate admin email
    if (!isAdminEmail(normalizedEmail)) {
      toast({
        title: 'Access Denied',
        description: 'Only @diasporanetwork.africa emails are allowed for admin access.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      toast({
        title: 'Magic link sent',
        description: 'Check your email to access the Admin Console.'
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login failed',
        description: error?.message || 'Could not send magic link. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-dna-copper" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="absolute top-4 left-4" title="Back to Home">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl shadow-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-dna-forest">
              Admin Login
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              {LAUNCH_MESSAGES.ADMIN_LOGIN_SUBTITLE}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@diasporanetwork.africa"
                    className="pl-10 bg-white border-gray-200"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-dna-copper hover:bg-dna-copper/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  'Send Magic Link'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                A magic link will be sent to your email for secure admin access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;