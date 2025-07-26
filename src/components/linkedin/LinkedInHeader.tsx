import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const navigationItems = [
    { title: 'Home', url: '/app', icon: Home },
    { title: 'My Network', url: '/app/connect', icon: Users },
    { title: 'Messaging', url: '/app/messages', icon: MessageSquare },
    { title: 'Notifications', url: '/app/notifications', icon: Bell },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left section - Logo and Search */}
          <div className="flex items-center space-x-4">
            <NavLink to="/app" className="text-dna-forest font-bold text-xl">
              DNA
            </NavLink>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search"
                className="pl-10 w-64 bg-gray-50 border-0 h-9 text-sm"
                onClick={() => navigate('/app/search')}
              />
            </div>
          </div>

          {/* Center section - Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-dna-forest border-b-2 border-dna-forest'
                      : 'text-gray-600 hover:text-dna-forest'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right section - Profile and Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8">
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Work</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/app/events')}>
                  Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/communities')}>
                  Communities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex flex-col items-center px-2 py-1 h-auto">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-xs bg-dna-mint text-dna-forest">
                      {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs mt-1">Me</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                  Settings & Privacy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
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