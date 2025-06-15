
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-dna-copper" />
            Welcome to DNA!
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-3 pt-1">
          <p>
            Before you connect with the vibrant African diaspora, let's complete your profile and explore the DNA community!
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><b>Fill out your profile</b> for better connection and discovery.</li>
            <li><b>Join communities</b> that match your impact areas.</li>
            <li><b>Connect with others</b> with shared passions and goals.</li>
            <li><b>Track your progress</b> as you complete onboarding steps.</li>
          </ul>
        </DialogDescription>
        <Button className="w-full bg-dna-copper hover:bg-dna-gold" onClick={onClose}>
          Let's Get Started!
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
