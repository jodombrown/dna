import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  MessageSquare, 
  BookOpen, 
  CheckCircle,
  Globe2,
  Newspaper,
  Handshake,
  Feather,
  Rocket
} from "lucide-react";
import { useTourProgress } from "@/hooks/useTourProgress";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

// Unique color themes for each step using DNA cultural colors
const STEP_THEMES = [
  { 
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-700 dark:text-emerald-300',
    bullet: 'text-emerald-500',
    progressActive: 'bg-emerald-500',
  },
  { 
    bg: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'text-amber-700 dark:text-amber-300',
    bullet: 'text-amber-500',
    progressActive: 'bg-amber-500',
  },
  { 
    bg: 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    accent: 'text-purple-700 dark:text-purple-300',
    bullet: 'text-purple-500',
    progressActive: 'bg-purple-500',
  },
  { 
    bg: 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/30 dark:to-pink-900/20',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    accent: 'text-rose-700 dark:text-rose-300',
    bullet: 'text-rose-500',
    progressActive: 'bg-rose-500',
  },
  { 
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/30 dark:to-cyan-900/20',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50',
    iconColor: 'text-teal-600 dark:text-teal-400',
    accent: 'text-teal-700 dark:text-teal-300',
    bullet: 'text-teal-500',
    progressActive: 'bg-teal-500',
  },
];

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to DNA',
    subtitle: 'YOUR JOURNEY STARTS HERE',
    description: 'The Diaspora Network of Africa connects you with a global community of professionals committed to Africa\'s development.',
    icon: Globe2,
    content: (theme: typeof STEP_THEMES[0]) => (
      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <Handshake className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
          <span>DNA is built on the Five C's: Connect, Convene, Collaborate, Contribute, and Convey</span>
        </li>
        <li className="flex items-start gap-3">
          <Rocket className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
          <span>Each action you take creates value that flows into your next opportunity</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
          <span>During beta, you'll have access to Feed, Connect, and Convey</span>
        </li>
      </ul>
    ),
  },
  {
    id: 'feed',
    title: 'Discover the Feed',
    subtitle: 'STAY INFORMED',
    description: 'Your home for diaspora news, updates, and community stories.',
    icon: Newspaper,
    content: (theme: typeof STEP_THEMES[0]) => (
      <div className="space-y-3 text-sm">
        <p>The <b className={theme.accent}>Feed</b> is where you'll find:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Posts and updates from the community</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Stories of diaspora impact across Africa</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Content from people in your network</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Your saved and bookmarked items</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'connect',
    title: 'Build Your Network',
    subtitle: 'GROW TOGETHER',
    description: 'Find and connect with diaspora members who share your vision.',
    icon: Users,
    content: (theme: typeof STEP_THEMES[0]) => (
      <div className="space-y-3 text-sm">
        <p><b className={theme.accent}>Connect</b> helps you discover people based on:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Shared interests and focus areas</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Country of origin or heritage</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Professional background and skills</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Collaboration opportunities</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'convey',
    title: 'Share Your Story',
    subtitle: 'INSPIRE OTHERS',
    description: 'Tell your impact story and inspire the community.',
    icon: Feather,
    content: (theme: typeof STEP_THEMES[0]) => (
      <div className="space-y-3 text-sm">
        <p><b className={theme.accent}>Convey</b> is where you can:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Share your diaspora journey and experiences</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Highlight projects making impact in Africa</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Discover inspiring stories from others</span>
          </li>
          <li className="flex items-start gap-3">
            <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", theme.progressActive)} />
            <span>Build your thought leadership</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'complete',
    title: "You're All Set!",
    subtitle: 'START EXPLORING',
    description: "You're ready to start your DNA journey.",
    icon: Rocket,
    content: (theme: typeof STEP_THEMES[0]) => (
      <div className="space-y-3 text-sm">
        <p>Here's what to do next:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <CheckCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
            <span><b>Complete your profile</b> to get discovered</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
            <span><b>Explore the feed</b> and engage with content</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
            <span><b>Connect with members</b> who share your interests</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", theme.bullet)} />
            <span><b>Share your story</b> when you're ready</span>
          </li>
        </ul>
        <p className="mt-3 text-muted-foreground text-xs">
          You can always retake this tour from your profile menu.
        </p>
      </div>
    ),
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ open, onClose }) => {
  const { 
    currentStep: savedStep, 
    markTourShown, 
    updateStep, 
    skipTour, 
    completeTour 
  } = useTourProgress();
  
  const [currentStep, setCurrentStep] = useState(savedStep || 0);
  const totalSteps = TOUR_STEPS.length;
  const step = TOUR_STEPS[currentStep];
  const theme = STEP_THEMES[currentStep];
  const Icon = step.icon;

  // Mark tour as shown when opened
  useEffect(() => {
    if (open) {
      markTourShown();
    }
  }, [open, markTourShown]);

  // Sync local step with saved step on open
  useEffect(() => {
    if (open && savedStep > 0 && savedStep < totalSteps) {
      setCurrentStep(savedStep);
    }
  }, [open, savedStep, totalSteps]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateStep(nextStep);
    } else {
      // Completed last step
      completeTour();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateStep(prevStep);
    }
  };

  const handleSkip = () => {
    skipTour();
    onClose();
  };

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className={cn("max-w-md p-0 overflow-hidden border-0", theme.bg)}>
        {/* Progress dots at top */}
        <div className="flex justify-center gap-1.5 pt-4 pb-2">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentStep 
                  ? cn("w-6", theme.progressActive) 
                  : index < currentStep 
                    ? cn("w-1.5", theme.progressActive, "opacity-50")
                    : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Icon container */}
        <div className="flex justify-center pt-4 pb-6">
          <div className={cn("p-6 rounded-full", theme.iconBg)}>
            <Icon className={cn("w-12 h-12", theme.iconColor)} strokeWidth={1.5} />
          </div>
        </div>

        <div className="px-6 pb-6">
          <DialogHeader className="text-center space-y-2">
            <p className={cn("text-xs font-semibold tracking-widest uppercase", theme.accent)}>
              {step.subtitle}
            </p>
            <DialogTitle className="text-2xl font-bold">
              {step.title}
            </DialogTitle>
          </DialogHeader>
          
          <DialogDescription className="text-center mt-3 mb-6 text-muted-foreground">
            {step.description}
          </DialogDescription>

          <div className="mb-6">
            {step.content(theme)}
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleNext}
              className={cn(
                "w-full h-12 text-base font-medium",
                currentStep === 0 && "bg-emerald-600 hover:bg-emerald-700",
                currentStep === 1 && "bg-amber-600 hover:bg-amber-700",
                currentStep === 2 && "bg-purple-600 hover:bg-purple-700",
                currentStep === 3 && "bg-rose-600 hover:bg-rose-700",
                currentStep === 4 && "bg-teal-600 hover:bg-teal-700"
              )}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Rocket className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-between">
              {!isFirstStep ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip tutorial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
