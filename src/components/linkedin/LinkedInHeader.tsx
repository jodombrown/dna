import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDashboard } from '@/contexts/DashboardContext';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Bell,
  Search,
  User,
  Grid3X3,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LinkedInHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveView, activeView } = useDashboard();

  const navigationItems = [
    { title: 'Home', view: 'dashboard', icon: Home },
    { title: 'My Network', view: 'network', icon: Users },
    { title: 'Messaging', view: 'messaging', icon: MessageSquare },
    { title: 'Notifications', view: 'notifications', icon: Bell },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and Search */}
          <div className="flex items-center space-x-4">
            <NavLink to="/app" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png" 
                alt="DNA Logo" 
                className="h-8 w-auto"
              />
            </NavLink>
            
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search"
                className="pl-10 w-40 lg:w-64 bg-gray-50 border-0 h-10 text-base cursor-pointer"
                onClick={() => {
                  if (location.pathname === '/app') {
                    setActiveView('search');
                  } else {
                    navigate('/app');
                    setTimeout(() => setActiveView('search'), 100);
                  }
                }}
                readOnly
              />
            </div>
            
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden p-2"
              onClick={() => {
                if (location.pathname === '/app') {
                  setActiveView('search');
                } else {
                  navigate('/app');
                  setTimeout(() => setActiveView('search'), 100);
                }
              }}
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          {/* Center section - Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = location.pathname === '/app' && activeView === item.view;
              return (
                <button
                  key={item.title}
                  onClick={() => {
                    if (location.pathname === '/app') {
                      setActiveView(item.view as any);
                    } else {
                      navigate('/app');
                      setTimeout(() => setActiveView(item.view as any), 100);
                    }
                  }}
                  className={`flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-dna-forest border-b-2 border-dna-forest'
                      : 'text-gray-600 hover:text-dna-forest'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Right section - Profile and Menu */}
          <div className="flex items-center space-x-2">
            {/* Single mobile menu that includes everything */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="lg:hidden p-2" aria-label="Menu">
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navigationItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.title}
                    onClick={() => {
                      if (location.pathname === '/app') {
                        setActiveView(item.view as any);
                      } else {
                        navigate('/app');
                        setTimeout(() => setActiveView(item.view as any), 100);
                      }
                    }}
                    className="flex items-center space-x-3 py-3"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-base">{item.title}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/events')} className="flex items-center space-x-3 py-3">
                  <span className="text-base">Events</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/communities')} className="flex items-center space-x-3 py-3">
                  <span className="text-base">Communities</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')} className="flex items-center space-x-3 py-3">
                  <span className="text-base">Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center px-2 py-2 h-auto">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-sm bg-dna-mint text-dna-forest font-medium">
                      {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs mt-1 hidden sm:block">Me</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/app/profile')} className="py-3">
                  <User className="w-5 h-5 mr-3" />
                  <span className="text-base">View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')} className="py-3">
                  <span className="text-base">Settings & Privacy</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 py-3">
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="text-base">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LinkedInHeader;