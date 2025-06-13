
import React, { useState } from 'react';
import SurveyDialog from '@/components/survey/SurveyDialog';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import MobileDropdown from './MobileDropdown';
import MobileSheetMenu from './MobileSheetMenu';

const MobileNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);

  const handleSurveyClick = () => {
    setIsMobileMenuOpen(false);
    setIsSurveyOpen(true);
  };

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  const handleDropdownClose = () => {
    setIsHomeDropdownOpen(false);
  };

  const toggleHomeDropdown = () => {
    setIsHomeDropdownOpen(!isHomeDropdownOpen);
  };

  return (
    <>
      {/* Home Dropdown for non-home pages */}
      <MobileDropdown 
        isOpen={isHomeDropdownOpen}
        onToggle={toggleHomeDropdown}
        onClose={handleDropdownClose}
      />

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
