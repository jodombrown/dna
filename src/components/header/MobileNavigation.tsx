
import React, { useState } from 'react';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import MobileSheetMenu from './MobileSheetMenu';

const MobileNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  return (
    <>
      <MobileSheetMenu 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        onBetaSignup={handleBetaSignup}
      />

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default MobileNavigation;
