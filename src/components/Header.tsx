
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Logo from './header/Logo';
import SearchBar from './header/SearchBar';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import UserActions from './header/UserActions';
import MessageNotifications from './messaging/MessageNotifications';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Search Bar */}
          <SearchBar />

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <MessageNotifications className="cursor-pointer" />
            )}
            
            {user ? (
              <UserActions />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  Join DNA
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
