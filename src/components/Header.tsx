
import React from 'react';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Auto-redirect authenticated users to app dashboard
  useEffect(() => {
    if (!loading && user && window.location.pathname === '/') {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  // Don't render marketing header for authenticated users
  if (!loading && user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DesktopNavigation />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
