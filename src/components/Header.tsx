
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import { Button } from '@/components/ui/button';

const Header = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Don't show header if user is authenticated or still loading
  if (user || loading) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center space-x-4">
            <DesktopNavigation />
            <Button
              onClick={() => navigate('/auth')}
              className="bg-dna-copper hover:bg-dna-gold text-white hidden md:inline-flex"
            >
              Sign In
            </Button>
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
