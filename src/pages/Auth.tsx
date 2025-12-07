import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Globe, Users, Handshake, Eye, EyeOff } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { BetaWaitlist } from '@/components/auth/BetaWaitlist';

const Auth = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { registrationEnabled } = useFeatureFlags();
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
  
  // Password visibility toggles
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('signin');

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
        navigate('/dna/feed');
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
          redirectTo: `${window.location.origin}/dna/feed`
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

  // Features for desktop hero
  const features = [
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with diaspora members across continents'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join spaces and events that matter to you'
    },
    {
      icon: Handshake,
      title: 'Collaborate',
      description: 'Build partnerships for Africa\'s development'
    }
  ];

  // Shared Auth Tabs JSX
  const authTabsContent = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">{registrationEnabled ? 'Sign Up' : 'Join Waitlist'}</TabsTrigger>
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
            <div className="relative">
              <Input
                id="signin-password"
                type={showSignInPassword ? "text" : "password"}
                placeholder="••••••••"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                disabled={isSignInLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showSignInPassword ? "Hide password" : "Show password"}
              >
                {showSignInPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-dna-forest hover:bg-dna-forest/90"
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
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
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
        {registrationEnabled ? (
          <>
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
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    disabled={isSignUpLoading}
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-dna-forest hover:bg-dna-forest/90"
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
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
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
          </>
        ) : (
          <BetaWaitlist />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10 flex items-center justify-center px-3 py-6 lg:hidden">
        <div className="w-full max-w-md space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-dna-copper transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-dna-emerald to-dna-copper flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Join DNA
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Connect with the global African diaspora
              </p>
            </CardHeader>
            <CardContent>
              {authTabsContent}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Hero/Branding */}
        <div className="w-1/2 bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
          </div>
          
          {/* Logo & Back Link */}
          <div className="relative z-10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Main Content */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Diaspora Network<br />of Africa
              </h1>
              <p className="text-xl text-white/80 max-w-md">
                Join the movement connecting Africa's global diaspora to build, invest, and contribute to the continent's future.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-white/60 text-sm">
            © 2024 Diaspora Network of Africa. All rights reserved.
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-1/2 bg-background flex items-center justify-center p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome</h2>
              <p className="text-muted-foreground">
                Sign in to your account or create a new one
              </p>
            </div>

            {/* Auth Card */}
            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-6">
                {authTabsContent}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Trusted by diaspora members in 50+ countries</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;