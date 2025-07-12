import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/header/Logo';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import AppMobileMenu from './AppMobileMenu';

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/app' },
    { name: 'Network', icon: Users, path: '/my-network' },
    { name: 'Communities', icon: Building, path: '/community' },
    { name: 'Projects', icon: FolderOpen, path: '/explore/projects' },
    { name: 'Messaging', icon: MessageCircle, path: '/messaging' },
  ];

  const currentPath = location.pathname;

  if (isMobile) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 flex-shrink-0">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu */}
            <AppMobileMenu 
              isOpen={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              onFeedbackClick={() => setFeedbackOpen(true)}
            />

            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Mobile Right Icons */}
            <div className="flex items-center space-x-2">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/search')}
                className="p-2"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </Button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile Avatar */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white text-xs">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
        
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 flex-shrink-0">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
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

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center p-3 h-auto min-w-[60px] transition-colors ${
                  currentPath === item.path 
                    ? 'text-dna-emerald border-b-2 border-dna-emerald rounded-none bg-dna-mint/10' 
                    : 'text-gray-600 hover:text-dna-forest hover:bg-dna-mint/20'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1 hidden lg:block">{item.name}</span>
              </Button>
            ))}

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-4 p-0 h-auto hover:bg-dna-mint/20 transition-colors">
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
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings & Privacy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app')}>
                  <FileText className="mr-2 h-4 w-4" />
                  My Posts & Activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/community')}>
                  <Building className="mr-2 h-4 w-4" />
                  My Communities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/leaderboard')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Leaderboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Give Feedback
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

          {/* Tablet Navigation - Show key icons only */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
              className="p-2"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
            <NotificationDropdown />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/profile')}
              className="p-1"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-dna-emerald text-white text-xs">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
      
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
};

export default AppHeader;