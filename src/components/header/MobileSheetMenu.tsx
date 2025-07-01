
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { publicNavItems, phases } from './navigationConfig';

interface MobileSheetMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSurveyClick: () => void;
  onBetaSignup: () => void;
}

const MobileSheetMenu: React.FC<MobileSheetMenuProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSurveyClick, 
  onBetaSignup 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Filter out current page from nav items
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <TouchFriendlyButton variant="outline" size="sm" className="md:hidden p-2 min-h-[44px] min-w-[44px]">
          <Menu className="w-5 h-5" />
        </TouchFriendlyButton>
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
            <nav className="flex flex-col space-y-2 py-6">
              {filteredNavItems.map((item) => (
                <TouchFriendlyButton
                  key={item.name}
                  variant="outline"
                  size="md"
                  onClick={() => handleNavClick(item)}
                  className="justify-start text-left w-full"
                >
                  {item.name}
                </TouchFriendlyButton>
              ))}
              
              <TouchFriendlyButton
                variant="secondary"
                size="md"
                onClick={onSurveyClick}
                className="justify-start text-left w-full bg-dna-copper/10 text-dna-copper border-dna-copper/20"
              >
                Take Survey
              </TouchFriendlyButton>
              
              <TouchFriendlyButton
                variant="primary"
                size="md"
                onClick={onBetaSignup}
                className="justify-start text-left w-full bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20"
              >
                Join Beta Program
              </TouchFriendlyButton>
              
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-4 px-2">Development Phases</p>
                <div className="space-y-2">
                  {phases.map((phase) => (
                    <TouchFriendlyButton
                      key={phase.path}
                      variant="outline"
                      size="md"
                      onClick={() => {
                        navigate(phase.path);
                        onOpenChange(false);
                      }}
                      className="justify-start text-left w-full"
                    >
                      <div className="w-6 h-6 bg-dna-copper text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                        {phase.phase}
                      </div>
                      <span className="truncate">{phase.name}</span>
                    </TouchFriendlyButton>
                  ))}
                </div>
              </div>
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheetMenu;
