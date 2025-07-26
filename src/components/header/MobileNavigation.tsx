
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import MobileSheetMenu from './MobileSheetMenu';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-2 md:hidden">
        <Button
          onClick={() => navigate('/auth')}
          size="sm"
          className="bg-dna-copper hover:bg-dna-gold text-white"
        >
          Sign In
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

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
