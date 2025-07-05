import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Home, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Bell,
  User,
  Settings,
  FileText,
  Building,
  HelpCircle,
  Globe,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/header/Logo';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/app', active: true },
    { name: 'My Network', icon: Users, path: '/app/network' },
    { name: 'Jobs', icon: Briefcase, path: '/app/jobs' },
    { name: 'Messaging', icon: MessageCircle, path: '/app/messages' },
    { name: 'Notifications', icon: Bell, path: '/app/notifications' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search DNA Network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-gray-50 border-gray-200 focus:bg-white"
              />
            </form>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center p-3 h-auto min-w-[60px] ${
                  item.active 
                    ? 'text-dna-emerald border-b-2 border-dna-emerald rounded-none' 
                    : 'text-gray-600 hover:text-dna-forest'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 hidden lg:block">{item.name}</span>
              </Button>
            ))}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-4 p-0 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-dna-emerald text-white text-sm">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings & Privacy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/posts')}>
                  <FileText className="mr-2 h-4 w-4" />
                  My Posts & Activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/communities')}>
                  <Building className="mr-2 h-4 w-4" />
                  My Communities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/jobs')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  My Jobs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Globe className="mr-2 h-4 w-4" />
                  Language
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;