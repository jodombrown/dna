import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { sanitizeText, isRateLimited } from '@/utils/validation';
import { getGenericErrorMessage } from '@/utils/errorHandling';
import { Users, Rocket, Target, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BetaSignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetaSignupDialog: React.FC<BetaSignupDialogProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    betaPhase: '',
    experience: '',
    motivation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOAuthSignup = async (provider: 'google' | 'linkedin_oidc') => {
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'linkedin_oidc') setIsLinkedInLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth?oauth=beta`,
          queryParams: {
            is_beta_tester: 'true',
            beta_phase: 'beta1'
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(`${provider} signup error:`, error);
      toast({
        title: "OAuth Signup Failed",
        description: error.message || `Failed to sign up with ${provider === 'google' ? 'Google' : 'LinkedIn'}`,
        variant: "destructive",
      });
    } finally {
      if (provider === 'google') setIsGoogleLoading(false);
      if (provider === 'linkedin_oidc') setIsLinkedInLoading(false);
    }
  };

  const betaPhases = [
    {
      id: 'beta1',
      title: 'Beta 1: Early Prototype Testing',
      icon: <Users className="w-5 h-5" />,
      description: 'Help us test core networking features and provide feedback on user experience',
      commitment: '2-3 hours per week',
      benefits: ['Early access to features', 'Direct line to development team', 'Shape the platform direction']
    },
    {
      id: 'beta2', 
      title: 'Beta 2: MVP Feature Testing',
      icon: <Rocket className="w-5 h-5" />,
      description: 'Test advanced collaboration tools and help validate our market fit',
      commitment: '3-5 hours per week', 
      benefits: ['Priority access to new features', 'Beta tester badge', 'Influence product roadmap']
    },
    {
      id: 'beta3',
      title: 'Beta 3: Pre-Launch Testing',
      icon: <Target className="w-5 h-5" />,
      description: 'Final testing phase before public launch with full platform access',
      commitment: '1-2 hours per week',
      benefits: ['Lifetime early adopter status', 'Free premium features', 'Recognition in launch']
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (isRateLimited(lastSubmission, 10000)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait a moment before submitting again",
        variant: "destructive",
      });
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeText(formData.name.trim()),
      email: sanitizeText(formData.email.trim()),
      company: sanitizeText(formData.company),
      role: sanitizeText(formData.role),
      experience: sanitizeText(formData.experience),
      motivation: sanitizeText(formData.motivation),
      betaPhase: formData.betaPhase
    };
    
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.betaPhase) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(sanitizedData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLastSubmission(Date.now());

    try {
      // Submit beta application (no account creation yet)
      const { error: applicationError } = await supabase
        .from('beta_applications')
        .insert([
          {
            name: sanitizedData.name,
            email: sanitizedData.email,
            company: sanitizedData.company,
            role: sanitizedData.role,
            beta_phase: sanitizedData.betaPhase,
            experience: sanitizedData.experience,
            motivation: sanitizedData.motivation
          }
        ]);

      if (applicationError) {
        if (applicationError.message.includes('duplicate key')) {
          toast({
            title: "Application Already Submitted",
            description: "You have already submitted a beta application with this email address.",
            variant: "destructive",
          });
        } else {
          throw applicationError;
        }
        return;
      }

      // Send confirmation email to applicant
      const { error: emailError } = await supabase.functions.invoke('send-universal-email', {
        body: {
          formType: 'beta-application',
          formData: {
            ...sanitizedData,
            selectedPhase: betaPhases.find(phase => phase.id === sanitizedData.betaPhase)?.title || sanitizedData.betaPhase
          },
          userEmail: sanitizedData.email
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the application if email fails
      }

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest in the DNA Beta Program. Our team will review your application within 48 hours and contact you directly if selected.",
      });
      
      setFormData({
        name: '',
        email: '',
        password: '',
        company: '',
        role: '',
        betaPhase: '',
        experience: '',
        motivation: ''
      });
      
      onClose();
      
    } catch (error: any) {
      console.error('Beta application error:', error);
      toast({
        title: "Application Failed",
        description: getGenericErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPhase = betaPhases.find(phase => phase.id === formData.betaPhase);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="w-6 h-6 text-dna-emerald" />
            Join DNA Beta Program
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* OAuth Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Quick Signup</h3>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-3 p-4 h-auto"
                onClick={() => handleOAuthSignup('google')}
                disabled={isGoogleLoading || isLinkedInLoading}
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
                <span>Continue with Google</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-3 p-4 h-auto"
                onClick={() => handleOAuthSignup('linkedin_oidc')}
                disabled={isGoogleLoading || isLinkedInLoading}
              >
                {isLinkedInLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                <span>Continue with LinkedIn</span>
              </Button>
            </div>
            
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">or apply manually</span>
              </div>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Beta Application Form</h3>
            <p className="text-sm text-gray-600">Fill out your information to apply for the DNA beta program. Our team will review your application within 48 hours.</p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="Your company or organization"
                />
              </div>
              <div>
                <Label htmlFor="role">Professional Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g., Software Engineer, Entrepreneur"
                />
              </div>
            </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Your Beta Phase *</h3>
            <RadioGroup 
              value={formData.betaPhase} 
              onValueChange={(value) => setFormData({...formData, betaPhase: value})}
              className="space-y-4"
            >
              {betaPhases.map((phase) => (
                <div key={phase.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={phase.id} id={phase.id} />
                    <Label htmlFor={phase.id} className="flex items-center gap-2 font-medium">
                      {phase.icon}
                      {phase.title}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{phase.description}</p>
                  <div className="ml-6 flex flex-wrap gap-2">
                    <Badge variant="outline">⏰ {phase.commitment}</Badge>
                    {phase.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tell Us More</h3>
            <div>
              <Label htmlFor="experience">Relevant Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Tell us about your background, skills, or experience relevant to our platform"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="motivation">Why do you want to join?</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                placeholder="What motivates you to be part of the DNA beta program?"
                rows={3}
              />
            </div>
          </div>

          {selectedPhase && (
            <div className="bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg p-4">
              <h4 className="font-semibold text-dna-emerald mb-2">Your Selected Phase:</h4>
              <div className="flex items-center gap-2 mb-2">
                {selectedPhase.icon}
                <span className="font-medium">{selectedPhase.title}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{selectedPhase.description}</p>
              <p className="text-sm font-medium">Time Commitment: {selectedPhase.commitment}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Application...' : 'Join the Beta Program'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaSignupDialog;
