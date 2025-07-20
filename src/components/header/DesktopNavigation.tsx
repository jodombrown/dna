
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import SurveyDialog from '@/components/survey/SurveyDialog';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { publicNavItems, appNavItems } from './navigationConfig';
import { useAuth } from '@/contexts/AuthContext';

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  // Get current page to hide active nav item
  const currentPath = location.pathname;

  // Use app nav for authenticated users, public nav for guests
  const navItems = user ? appNavItems : publicNavItems;
  const filteredNavItems = navItems.filter(item => item.path !== currentPath);

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
  };

  return (
    <>
      <nav className="hidden md:flex items-center space-x-8">
        {filteredNavItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => handleNavClick(item)}
            className="text-dna-forest hover:bg-dna-mint/30 hover:text-dna-forest relative hover:before:absolute hover:before:bottom-0 hover:before:left-1/2 hover:before:-translate-x-1/2 hover:before:w-0 hover:before:h-0.5 hover:before:bg-dna-emerald hover:before:animate-pulse transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-emerald/50 focus:ring-offset-2"
          >
            {item.name}
          </Button>
        ))}
        
        {!user && (
          <>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-dna-emerald hover:bg-dna-forest text-white hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-emerald/50 focus:ring-offset-2 mr-2"
            >
              Join DNA
            </Button>
            
            <Button
              onClick={() => setIsSurveyOpen(true)}
              className="bg-dna-copper hover:bg-dna-gold text-white hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-copper/50 focus:ring-offset-2"
            >
              Take Survey
            </Button>
          </>
        )}

        {user && (
          <>
            <Button
              onClick={() => navigate('/app')}
              className="bg-dna-emerald hover:bg-dna-forest text-white hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-emerald/50 focus:ring-offset-2 mr-2"
            >
              Dashboard
            </Button>
            
            <Button
              onClick={() => navigate('/profile')}
              className="bg-dna-copper hover:bg-dna-gold text-white hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-copper/50 focus:ring-offset-2"
            >
              Profile
            </Button>
          </>
        )}
      </nav>

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

export default DesktopNavigation;
