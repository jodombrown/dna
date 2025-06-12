
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import SurveyDialog from '@/components/survey/SurveyDialog';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  // Get current page to hide active nav item
  const currentPath = location.pathname;

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect' },
    { name: 'Collaborate', path: '/collaborate' },
    { name: 'Contribute', path: '/contribute' },
    { name: 'Contact', path: '/contact' },
  ];

  // Filter out current page from nav items
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  const phases = [
    { name: 'Prototyping Phase', path: '/prototyping-phase', phase: 1 },
    { name: 'Build Phase', path: '/build-phase', phase: 2 },
    { name: 'MVP Phase', path: '/mvp-phase', phase: 3 },
    { name: 'Customer Discovery Phase', path: '/customer-discovery-phase', phase: 4 },
    { name: 'Go-to-Market Phase', path: '/go-to-market-phase', phase: 5 },
  ];

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

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
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                  alt="DNA" 
                  className="h-8 w-auto"
                />
                DNA
              </SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="flex-1 px-6">
              <nav className="flex flex-col space-y-4 py-6">
                {filteredNavItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="justify-start text-left"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.name}
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  className="justify-start text-left bg-dna-copper/10 text-dna-copper"
                  onClick={handleSurveyClick}
                >
                  Take Survey
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start text-left bg-dna-emerald/10 text-dna-emerald"
                  onClick={handleBetaSignup}
                >
                  Join Beta Program
                </Button>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-4">Development Phases</p>
                  <div className="space-y-2">
                    {phases.map((phase) => (
                      <Button
                        key={phase.path}
                        variant="ghost"
                        className="justify-start text-left w-full"
                        onClick={() => {
                          navigate(phase.path);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <div className="w-6 h-6 bg-dna-copper text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                          {phase.phase}
                        </div>
                        {phase.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

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
