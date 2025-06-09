
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Users, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const MobileNavigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect-example' },
    { name: 'Collaborate', path: '/collaborations-example' },
    { name: 'Contribute', path: '/contribute-example' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/my-profile');
    }
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
          
          {user ? (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-4">Dashboard</p>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/members')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/opportunities')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Opportunities
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/innovation-pathways')}
                  >
                    Innovation Pathways
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full"
                  onClick={handleProfileClick}
                >
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="border-t pt-4 mt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => handleNavClick('/auth')}
                className="w-full border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-dna-white"
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-dna-copper hover:bg-dna-gold text-dna-white"
                onClick={() => handleNavClick('/auth')}
              >
                Join Now
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
