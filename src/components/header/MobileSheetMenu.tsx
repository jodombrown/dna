
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { publicNavItems } from './navigationConfig';

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
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-8">
          {publicNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-lg font-medium text-gray-700 hover:text-dna-forest transition-colors"
              onClick={() => onOpenChange(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex flex-col space-y-3 mt-8 pt-8 border-t">
            <Button 
              onClick={onSurveyClick}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Take Survey
            </Button>
            <Button 
              onClick={onBetaSignup}
              variant="outline" 
              className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
            >
              Join Beta
            </Button>
            <Link to="/auth" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheetMenu;
