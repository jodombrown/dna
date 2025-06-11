
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import SurveyDialog from '@/components/survey/SurveyDialog';

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect' },
    { name: 'Collaborate', path: '/collaborate' },
    { name: 'Contribute', path: '/contribute' },
    { name: 'Contact', path: '/contact' },
  ];

  const phases = [
    { name: 'Prototyping Phase', path: '/prototyping-phase', phase: 1 },
    { name: 'Build Phase', path: '/build-phase', phase: 2 },
    { name: 'MVP Phase', path: '/mvp-phase', phase: 3 },
    { name: 'Customer Discovery Phase', path: '/customer-discovery-phase', phase: 4 },
    { name: 'Go-to-Market Phase', path: '/go-to-market-phase', phase: 5 },
  ];

  return (
    <>
      <nav className="hidden md:flex items-center space-x-8">
        {publicNavItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => navigate(item.path)}
            className="text-dna-forest hover:bg-dna-mint hover:text-dna-forest"
          >
            {item.name}
          </Button>
        ))}
        
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-dna-forest hover:bg-dna-mint">
                Phases
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px]">
                  {phases.map((phase) => (
                    <NavigationMenuLink key={phase.path} asChild>
                      <button
                        onClick={() => navigate(phase.path)}
                        className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint text-left w-full"
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
          onClick={() => setIsSurveyOpen(true)}
          className="bg-dna-copper hover:bg-dna-gold text-white"
        >
          Take Survey
        </Button>
      </nav>

      <SurveyDialog 
        isOpen={isSurveyOpen} 
        onClose={() => setIsSurveyOpen(false)} 
      />
    </>
  );
};

export default DesktopNavigation;
