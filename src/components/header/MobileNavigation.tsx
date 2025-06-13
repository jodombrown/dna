
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Home, ChevronDown } from 'lucide-react';
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
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);

  // Get current page to hide active nav item
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/';

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
    setIsHomeDropdownOpen(false);
  };

  const handleSurveyClick = () => {
    setIsMobileMenuOpen(false);
    setIsSurveyOpen(true);
  };

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  const handleHomeClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsHomeDropdownOpen(false);
  };

  const toggleHomeDropdown = () => {
    setIsHomeDropdownOpen(!isHomeDropdownOpen);
  };

  return (
    <>
      {/* Home Dropdown for non-home pages */}
      {!isHomePage && (
        <div className="relative md:hidden">
          <button
            onClick={toggleHomeDropdown}
            className="flex items-center space-x-2 text-dna-forest hover:text-dna-copper transition-colors duration-200 px-3 py-2 rounded-md hover:bg-dna-mint/20"
          >
            <Home className="w-4 h-4" />
            <span>Back</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHomeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isHomeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <ScrollArea className="max-h-80">
                <div className="py-2">
                  <button
                    onClick={handleHomeClick}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150 font-medium border-b border-gray-100"
                  >
                    🏠 Home
                  </button>
                  
                  {/* Main Navigation Items */}
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150"
                    >
                      {item.name}
                    </button>
                  ))}
                  
                  {/* Separator */}
                  <div className="border-t border-gray-100 my-2"></div>
                  
                  {/* Development Phase Items */}
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Development Phases
                  </div>
                  {phases.map((phase) => (
                    <button
                      key={phase.path}
                      onClick={() => {
                        navigate(phase.path);
                        setIsHomeDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150 text-sm"
                    >
                      {phase.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

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
                  alt="Logo" 
                  className="h-8 w-auto"
                />
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
