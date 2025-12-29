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
import { publicNavItems, aboutUsDropdown } from './navigationConfig';
import { NewFeaturePill } from '@/components/releases/NewFeaturePill';

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  // Get current page to hide active nav item
  const currentPath = location.pathname;

  // Filter out current page from nav items
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  // Phase icons and colors

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
  };

  return (
    <>
      <nav className="hidden md:flex items-center space-x-8">
        {/* About Us Dropdown */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-dna-forest hover:bg-dna-mint/30 hover:text-dna-forest">
                About Us
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-48 p-2">
                  {aboutUsDropdown.map((item) => (
                    <li key={item.name}>
                      <NavigationMenuLink
                        onClick={() => handleNavClick(item)}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-dna-mint/30 hover:text-dna-forest focus:bg-dna-mint/30 focus:text-dna-forest cursor-pointer"
                      >
                        <div className="text-sm font-medium leading-none">{item.name}</div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

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
        
        {/* New Feature Pill */}
        <NewFeaturePill />

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
