import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Rocket, LogIn, UserPlus } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { BetaWaitlist } from '@/components/auth/BetaWaitlist';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  
  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignInLoading(true);

    try {
      const { error } = await signIn(signInEmail, signInPassword);
      
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
      setIsSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignUpLoading(true);

    try {
      const { error } = await signUp(signUpEmail, signUpPassword, signUpFullName);
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast({
          title: 'LinkedIn sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
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

        {/* Authentication Card */}
        <Card className="border-dna-copper/30">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold text-dna-forest">
              Join the Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      disabled={isSignInLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      disabled={isSignInLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSignInLoading}
                  >
                    {isSignInLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleLinkedInSignIn}
                >
                  <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signUpFullName}
                      onChange={(e) => setSignUpFullName(e.target.value)}
                      required
                      disabled={isSignUpLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      disabled={isSignUpLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      disabled={isSignUpLoading}
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSignUpLoading}
                  >
                    {isSignUpLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleLinkedInSignIn}
                >
                  <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
