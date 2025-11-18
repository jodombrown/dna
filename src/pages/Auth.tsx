import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Rocket, LogIn } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { BetaWaitlist } from '@/components/auth/BetaWaitlist';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
        navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10 flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-md space-y-4">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-dna-copper transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Beta Launch Card */}
        <Card className="border-dna-emerald/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-dna-emerald to-dna-copper flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-dna-forest">
              Beta Launching Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Launch Date */}
            <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-xl p-4 border border-dna-emerald/20">
              <div className="flex items-center gap-3 justify-center">
                <Calendar className="w-6 h-6 text-dna-emerald" />
                <div>
                  <p className="text-sm text-muted-foreground">Official Beta Launch</p>
                  <p className="text-xl sm:text-2xl font-bold text-dna-forest">December 1, 2024</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-3">
              <p className="text-base text-foreground leading-relaxed">
                We're putting the final touches on the <span className="font-semibold text-dna-forest">Diaspora Network of Africa</span> platform.
              </p>
              <p className="text-sm text-muted-foreground">
                Join our waitlist to be among the first to connect, collaborate, and contribute to Africa's development when we launch.
              </p>
            </div>

            {/* Waitlist Component */}
            <div className="pt-2">
              <BetaWaitlist />
            </div>
          </CardContent>
        </Card>

        {/* Existing Users Sign In */}
        <Card className="border-dna-copper/30">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-dna-copper to-dna-emerald flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-dna-forest">
              Existing User Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
