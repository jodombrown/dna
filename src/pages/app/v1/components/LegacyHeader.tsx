import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardV1Context';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Users, User, Menu, X, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/header/Logo';

const LegacyHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { setActiveView, activeView } = useDashboard();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { title: 'Home', view: 'dashboard', icon: Home, badge: '[LEGACY]' },
    { title: 'Search', view: 'search', icon: Search, badge: '[LEGACY]' },
    { title: 'Connect', view: 'connect', icon: Users, badge: '[LEGACY]' },
    { title: 'Profile', view: 'profile', icon: User, badge: '[LEGACY]' },
  ];

  const handleNavigation = (view: string) => {
    setActiveView(view as any);
    const viewRouteMap: { [key: string]: string } = {
      'dashboard': '/app/v1/dashboard',
      'search': '/app/v1/search', 
      'connect': '/app/v1/connect',
      'profile': '/app/v1/profile',
    };
    navigate(viewRouteMap[view] || '/app/v1/dashboard');
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-8 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo />
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">
              LEGACY v1
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname.includes(item.view === 'dashboard' ? '/dashboard' : `/${item.view}`);
              
              return (
                <Button
                  key={item.view}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.view)}
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? 'bg-dna-mint/10 text-dna-forest border border-dna-mint/20' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-amber-600">{item.badge}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="hidden sm:flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.display_name || profile.full_name}
                  </p>
                  <p className="text-xs text-gray-500">Legacy Dashboard</p>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Sign Out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname.includes(item.view === 'dashboard' ? '/dashboard' : `/${item.view}`);
                
                return (
                  <Button
                    key={item.view}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.view)}
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-dna-mint/10 text-dna-forest' 
                        : 'text-gray-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-3" />
                    <span>{item.title}</span>
                    <span className="ml-auto text-xs text-amber-600">{item.badge}</span>
                  </Button>
                );
              })}
              
              <hr className="my-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LegacyHeader;