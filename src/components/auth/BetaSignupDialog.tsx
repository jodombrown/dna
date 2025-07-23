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
import { Users, Rocket, Target, Eye, EyeOff } from 'lucide-react';

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
  const { toast } = useToast();
  const navigate = useNavigate();

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
    
    if (!formData.name || !formData.email || !formData.betaPhase) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit beta application (no account creation yet)
      const { error: applicationError } = await supabase
        .from('beta_applications')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company,
            role: formData.role,
            beta_phase: formData.betaPhase,
            experience: formData.experience,
            motivation: formData.motivation
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
            ...formData,
            selectedPhase: betaPhases.find(phase => phase.id === formData.betaPhase)?.title || formData.betaPhase
          },
          userEmail: formData.email
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
        description: error.message || "Please try again later or contact us directly.",
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Apply for Beta Access</h3>
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
      </DialogContent>
    </Dialog>
  );
};

export default BetaSignupDialog;
