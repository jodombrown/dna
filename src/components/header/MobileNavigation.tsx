
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SurveyDialog from '@/components/survey/SurveyDialog';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import MobileSheetMenu from './MobileSheetMenu';

const MobileNavigation = () => {
  const { user } = useAuth();
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
