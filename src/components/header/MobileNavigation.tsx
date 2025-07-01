
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  path: string;
  label: string;
}

interface MobileNavigationProps {
  navigationItems: NavigationItem[];
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ navigationItems }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-dna-emerald bg-dna-emerald/10'
                  : 'text-gray-600 hover:text-dna-emerald hover:bg-dna-emerald/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
