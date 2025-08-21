
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Code, Users, Target, BarChart3, TrendingUp } from 'lucide-react';
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

  // Phase icons and colors
  const phaseStyles = [
    { icon: Search, bgColor: 'bg-blue-500', hoverBgColor: 'hover:bg-blue-500', textColor: 'text-blue-500', hoverBorderColor: 'hover:border-blue-500' },
    { icon: Code, bgColor: 'bg-dna-emerald', hoverBgColor: 'hover:bg-dna-emerald', textColor: 'text-dna-emerald', hoverBorderColor: 'hover:border-dna-emerald' },
    { icon: Users, bgColor: 'bg-green-500', hoverBgColor: 'hover:bg-green-500', textColor: 'text-green-500', hoverBorderColor: 'hover:border-green-500' },
    { icon: Target, bgColor: 'bg-dna-copper', hoverBgColor: 'hover:bg-dna-copper', textColor: 'text-dna-copper', hoverBorderColor: 'hover:border-dna-copper' },
    { icon: BarChart3, bgColor: 'bg-dna-mint', hoverBgColor: 'hover:bg-dna-mint', textColor: 'text-dna-mint', hoverBorderColor: 'hover:border-dna-mint' },
    { icon: TrendingUp, bgColor: 'bg-dna-gold', hoverBgColor: 'hover:bg-dna-gold', textColor: 'text-dna-gold', hoverBorderColor: 'hover:border-dna-gold' }
  ];

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
                  {phases.map((phase, index) => {
                    const phaseStyle = phaseStyles[index];
                    const IconComponent = phaseStyle.icon;
                    return (
                      <NavigationMenuLink key={phase.path} asChild>
                        <button
                          onClick={() => navigate(phase.path)}
                          className={`flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint/30 hover:border-l-4 ${phaseStyle.hoverBorderColor} text-left w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-copper/50 focus:ring-offset-2`}
                        >
                          <div className={`w-8 h-8 ${phaseStyle.bgColor} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-dna-forest">{phase.name}</div>
                            <div className="text-sm text-gray-600">Phase {phase.phase} of our development journey</div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

      </nav>

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default DesktopNavigation;
