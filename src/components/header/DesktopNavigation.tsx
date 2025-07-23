
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
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { publicNavItems, phases } from './navigationConfig';

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  // Get current page to hide active nav item
  const currentPath = location.pathname;

  // Filter out current page from nav items
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

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
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-dna-forest hover:bg-dna-mint/30 focus:outline-none focus:ring-2 focus:ring-dna-emerald/50 focus:ring-offset-2 transition-all duration-200">
                Phases
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px]">
                  {phases.map((phase) => (
                    <NavigationMenuLink key={phase.path} asChild>
                      <button
                        onClick={() => navigate(phase.path)}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint/30 hover:border-l-4 hover:border-dna-copper text-left w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-copper/50 focus:ring-offset-2"
                      >
                        <div className="w-8 h-8 bg-dna-copper text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {phase.phase}
                        </div>
                        <div>
                          <div className="font-medium text-dna-forest">{phase.name}</div>
                          <div className="text-sm text-gray-600">Phase {phase.phase} of our development journey</div>
                        </div>
                      </button>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Button
          onClick={() => setIsBetaSignupOpen(true)}
          className="bg-dna-copper hover:bg-dna-gold text-white hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-copper/50 focus:ring-offset-2"
        >
          Join Beta
        </Button>
      </nav>

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default DesktopNavigation;
