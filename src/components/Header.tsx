
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import UserActions from './header/UserActions';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isHomePage = location.pathname === '/';

  return (
    <header className={`bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-[100] ${isHomePage ? 'border-b border-dna-mint/20' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with proper spacing */}
          <div className="mr-8">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <UserActions />

            {/* Mobile menu */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
