
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import SurveyDialog from '@/components/survey/SurveyDialog';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

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

  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleTakeSurvey = () => {
    setIsOpen(false);
    setIsSurveyOpen(true);
  };

  return (
    <>
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-dna-forest">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through DiasporaLink
              </SheetDescription>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-120px)] mt-6">
              <div className="flex flex-col space-y-4">
                {/* Main Navigation */}
                <div className="space-y-3">
                  {filteredNavItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="w-full justify-start text-dna-forest hover:bg-dna-mint"
                      onClick={() => handleNavClick(item.path)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>

                {/* Phases Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-dna-forest mb-3">Development Phases</h3>
                  <div className="space-y-2">
                    {phases.map((phase) => (
                      <Button
                        key={phase.path}
                        variant="ghost"
                        className="w-full justify-start text-left hover:bg-dna-mint"
                        onClick={() => handleNavClick(phase.path)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-dna-copper text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {phase.phase}
                          </div>
                          <span className="text-sm">{phase.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Survey Button */}
                <div className="border-t pt-4 mt-4">
                  <Button
                    onClick={handleTakeSurvey}
                    className="w-full bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    Take Survey
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <SurveyDialog 
        isOpen={isSurveyOpen} 
        onClose={() => setIsSurveyOpen(false)} 
      />
    </>
  );
};

export default MobileNavigation;
