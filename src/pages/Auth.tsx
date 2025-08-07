
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        toast({
          title: "Missing Information",
          description: "Please enter your full name.",
          variant: "destructive"
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Please make sure your passwords match.",
          variant: "destructive"
        });
        return false;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;
      
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.fullName);
      }

      if (result.error) {
        const errorMessage = result.error.message || "Something went wrong. Please try again.";
        
        // Handle specific connection errors
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
            errorMessage.includes('connection') || result.error.name === 'NetworkError') {
          toast({
            title: "Connection Error",
            description: "Unable to connect to our servers. Please check your internet connection and try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: isLogin ? "Login Failed" : "Signup Failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } else if (!isLogin) {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error('Auth form error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to process your request. Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin_oidc') => {
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'linkedin_oidc') setIsLinkedInLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(`${provider} signin error:`, error);
      
      // Handle network/connection errors specifically
      if (error.message?.includes('network') || error.message?.includes('fetch') || 
          error.message?.includes('connection') || error.name === 'NetworkError') {
        toast({
          title: "Connection Error",
          description: "Unable to connect to authentication service. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "OAuth Sign-in Failed",
          description: error.message || `Failed to sign in with ${provider === 'google' ? 'Google' : 'LinkedIn'}`,
          variant: "destructive",
        });
      }
    } finally {
      if (provider === 'google') setIsGoogleLoading(false);
      if (provider === 'linkedin_oidc') setIsLinkedInLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex lg:flex-row flex-col">
      {/* Left Side - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dna-forest to-dna-emerald p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-16 h-16 bg-dna-copper rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Connect. Collaborate. Contribute.</h1>
            <p className="text-lg text-dna-mint mb-6">
              Join the global African diaspora network where innovation meets impact and dreams become reality.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dna-copper rounded-full"></div>
                <span className="text-sm">Build meaningful connections across continents</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dna-copper rounded-full"></div>
                <span className="text-sm">Access exclusive opportunities and resources</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-dna-copper rounded-full"></div>
                <span className="text-sm">Contribute to Africa's development through innovation</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-dna-copper/20 rounded-full transform translate-x-16 translate-y-16"></div>
        <div className="absolute top-0 left-0 w-24 h-24 bg-dna-gold/20 rounded-full transform -translate-x-12 -translate-y-12"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 pt-20 lg:pt-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-dna-copper rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dna-forest">DNA Network</h2>
          </div>

          <Card className="shadow-xl border-0 sm:border bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <CardTitle className="text-xl sm:text-2xl font-bold text-dna-forest mb-2 pt-4 sm:pt-0">
                {isLogin ? 'Welcome Back to DNA' : 'Join the DNA Community'}
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                {isLogin 
                  ? 'Sign in to connect with the African diaspora' 
                  : 'Be part of Africa\'s global innovation network'
                }
              </p>
            </CardHeader>
          
          <CardContent>
            {/* OAuth Options */}
            <div className="space-y-4 mb-6">
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-3 p-4 h-auto"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isGoogleLoading || isLinkedInLoading || isSubmitting}
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-3 p-4 h-auto"
                  onClick={() => handleOAuthSignIn('linkedin_oidc')}
                  disabled={isGoogleLoading || isLinkedInLoading || isSubmitting}
                >
                  {isLinkedInLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  <span>{isLogin ? 'Continue with LinkedIn' : 'Sign up with LinkedIn'}</span>
                </Button>
              </div>
              
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-2 text-sm text-gray-500">or</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || isGoogleLoading || isLinkedInLoading}
                className="w-full bg-dna-copper hover:bg-dna-gold text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  className="p-0 text-dna-copper hover:text-dna-gold underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
