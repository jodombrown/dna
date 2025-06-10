
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect-example' },
    { name: 'Collaborate', path: '/collaborations-example' },
    { name: 'Contribute', path: '/contribute-example' },
    { name: 'Contact', path: '/contact' },
  ];

  const phases = [
    { name: 'Prototyping Phase', path: '/prototyping-phase', phase: 1 },
    { name: 'Build Phase', path: '/build-phase', phase: 2 },
    { name: 'MVP Phase', path: '/mvp-phase', phase: 3 },
    { name: 'Customer Discovery Phase', path: '/customer-discovery-phase', phase: 4 },
    { name: 'Go-to-Market Phase', path: '/go-to-market-phase', phase: 5 },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
              alt="DNA Platform" 
              className="h-8 w-auto"
            />
            DNA Platform
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-8">
          {publicNavItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handleNavClick(item.path)}
            >
              {item.name}
            </Button>
          ))}
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-4">Development Phases</p>
            <div className="space-y-2">
              {phases.map((phase) => (
                <Button
                  key={phase.path}
                  variant="ghost"
                  className="justify-start text-left w-full"
                  onClick={() => handleNavClick(phase.path)}
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
