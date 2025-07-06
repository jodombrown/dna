import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is already authenticated and is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (!error && data) {
            navigate('/admin/dashboard');
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
        }
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', authData.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError || !adminData) {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-forest via-dna-forest/90 to-dna-emerald flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-copper rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-dna-forest">
                DNA Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Secure administrator access only
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Administrator Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@diasporanetwork.africa"
                    className="pl-10 h-12 border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-10 h-12 border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-emerald/90 hover:to-dna-copper/90 text-white font-semibold transition-all duration-200"
              >
                {loading ? 'Authenticating...' : 'Access Admin Portal'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Authorized personnel only. All access is monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;