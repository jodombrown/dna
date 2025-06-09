
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import SearchBar from './header/SearchBar';
import UserActions from './header/UserActions';

const Header = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="bg-dna-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Search Bar (for logged in users on desktop) */}
          {user && !isMobile && <SearchBar />}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation */}
            <MobileNavigation />

            {/* User Actions */}
            <UserActions />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
