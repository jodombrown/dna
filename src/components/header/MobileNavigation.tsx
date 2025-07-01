
import React, { useState } from 'react';
import SurveyDialog from '@/components/survey/SurveyDialog';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import MobileSheetMenu from './MobileSheetMenu';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';

const MobileNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  const handleSurveyClick = () => {
    setIsMobileMenuOpen(false);
    setIsSurveyOpen(true);
  };

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  return (
    <>
      <MobileSheetMenu 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        onSurveyClick={handleSurveyClick}
        onBetaSignup={handleBetaSignup}
      />

      <SurveyDialog 
        isOpen={isSurveyOpen} 
        onClose={() => setIsSurveyOpen(false)} 
      />

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default MobileNavigation;
