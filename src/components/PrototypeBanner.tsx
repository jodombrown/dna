import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * Universal prototype phase info/feedback banner.
 * Place just below the global header or page header.
 */
const PrototypeBanner: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // Handler for future onboarding/modal simulation
  const handleStartJourney = () => {
    setOpen(true);
  };

  // Handler to actually navigate, if you want to trigger real routing.
  const handleNavigate = () => {
    setOpen(false);
    navigate('/my-profile');
  };

  return (
    <div className="bg-gradient-to-r from-dna-emerald/15 via-dna-copper/10 to-dna-gold/10 border-b border-dna-emerald/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-dna-emerald mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-md md:text-lg text-dna-forest mb-0.5">
              You’re using the DNA Platform Prototype!
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              This is an early preview of Diaspora Network of Africa—your ideas, feedback, and involvement
              will shape the future of our community-powered professional platform.
              <br className="hidden md:block" />
              <span className="font-semibold">Help us build a home for Africa’s Diaspora!</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Start Your Journey Button with Popup */}
          <Button 
            size="sm"
            onClick={handleStartJourney}
            variant="outline"
            className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10"
          >
            Start Your Journey, Today
          </Button>
          {/* Existing "Give Feedback" remains unchanged */}
          <Button
            size="sm"
            onClick={() => navigate('/contribute')}
            className="bg-dna-copper hover:bg-dna-gold text-white"
          >
            Give Feedback
          </Button>
        </div>
      </div>
      {/* Modal that previews onboarding breakdown */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-dna-copper" />
              Platform Onboarding Preview
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p className="mb-4">
              <b>Start Your Journey, Today</b> will soon unlock an interactive onboarding guide to help you set up your DNA profile and navigate our professional platform!
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>
                <b>Personalized setup</b>: Complete your profile with skills, interests, and background.
              </li>
              <li>
                <b>Guided onboarding</b>: Get step-by-step help to join relevant communities and events.
              </li>
              <li>
                <b>Connection tips</b>: Receive smart recommendations on who to connect with.
              </li>
              <li>
                <b>Progress tracker</b>: Track your onboarding progress and get tips for unlocking platform features!
              </li>
            </ul>
            <div className="text-center mt-6">
              <Button 
                className="bg-dna-copper hover:bg-dna-gold text-white"
                onClick={handleNavigate}
              >
                Go to My Profile
              </Button>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrototypeBanner;
