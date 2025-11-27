import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';

import { 
  Home,
  Users, 
  MessageSquare, 
  MessageCircle,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Zap,
  Target,
  Users2,
  Lightbulb,
  TestTube,
  Rocket,
  Briefcase,
  Shield,
  Calendar,
  Handshake,
  Heart,
  BookOpen
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { publicNavItems, phases, aboutUsDropdown } from './header/navigationConfig';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';

const UnifiedHeader = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { open: openAccountDrawer } = useAccountDrawer();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Conditionally use dashboard context only for authenticated users
  let setActiveView: any = () => {};
  let activeView: any = 'dashboard';
  
  try {
    const dashboard = useDashboard();
    setActiveView = dashboard.setActiveView;
    activeView = dashboard.activeView;
  } catch (error) {
    // DashboardProvider not available (marketing pages)
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  // Query admin status
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user
  });

  // Use the unread notification count hook
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Query unread message count
  const { data: unreadMessageCount = 0 } = useUnreadMessageCount();

  const isAuthenticated = !!user;
  
  // Show skeleton/minimal header during initial load to prevent flash
  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/" 
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                  alt="DNA Logo" 
                  className="h-8 w-auto"
                />
              </NavLink>
            </div>
            <div className="flex items-center space-x-4">
              {/* Show hamburger menu during loading for mobile */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2 md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left" 
                  className="w-[85vw] max-w-sm p-0 [&>*]:!hidden [&>div]:!block"
                  onPointerDownOutside={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex flex-col h-full max-h-screen">
                    <div className="p-4 sm:p-6 border-b flex-shrink-0">
                      <div className="flex items-center justify-end">
                        <img 
                          src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                          alt="Logo" 
                          className="h-6 sm:h-8 w-auto"
                        />
                      </div>
                    </div>
                    <ScrollArea className="flex-1 overflow-y-auto">
                      <nav className="flex flex-col space-y-1 p-4 sm:p-6 pb-20">
                        <div className="text-gray-500 text-sm">Loading...</div>
                      </nav>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    );
  }
  const currentPath = location.pathname;

  // 5C Framework Navigation - PRIMARY for authenticated users
  const fiveCNavigation = [
    { title: 'Connect', pillar: 'connect', icon: Users, path: '/dna/connect', description: 'Build your network', badge: 0 },
    { title: 'Convene', pillar: 'convene', icon: Calendar, path: '/dna/convene', description: 'Join events & gatherings', badge: 0 },
    { title: 'Collaborate', pillar: 'collaborate', icon: Handshake, path: '/dna/collaborate', description: 'Work together on projects', badge: 0 },
    { title: 'Contribute', pillar: 'contribute', icon: Heart, path: '/dna/contribute', description: 'Give back & support', badge: 0 },
    { title: 'Convey', pillar: 'convey', icon: BookOpen, path: '/dna/convey', description: 'Share your story', badge: 0 },
  ];

  // Utility navigation - SECONDARY
  const utilityNavigation = [
    { title: 'Feed', icon: Home, path: '/dna/feed', badge: 0 },
    { title: 'Messages', icon: MessageCircle, path: '/dna/messages', badge: unreadMessageCount },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const handleBetaSignup = () => {
    setIsMobileMenuOpen(false);
    setIsBetaSignupOpen(true);
  };

  const handleSignInClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/auth');
  };

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  // Phase icons mapping
  const phaseIcons = {
    1: Zap,
    2: Lightbulb,
    3: Target,
    4: TestTube,
    5: Users2,
    6: Rocket,
  };

  const handleAuthNavigation = (view: string) => {
    // Navigate to main feature pages instead of app routes
    const viewRouteMap: { [key: string]: string } = {
      'dashboard': '/',
      'network': '/connect',
      'connections': '/network',
      'messages': '/messages',
      'messaging': '/collaborate', 
      'opportunities': '/opportunities'
    };
    navigate(viewRouteMap[view] || '/');
  };

  // Filter out current page from nav items for mobile menu
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  return (
    <>
      <header 
        data-unified-header
        className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section - Logo and Search */}
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/" 
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                  alt="DNA Logo" 
                  className="h-8 w-auto"
                />
              </NavLink>
              
            </div>


            {/* Right section - Navigation and Profile */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation - 5C Framework PRIMARY */}
              {isAuthenticated && (
                <nav className="hidden lg:flex items-center space-x-1 border-r pr-4 mr-4">
                  {fiveCNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActivePillar = location.pathname.includes(item.path);
                    return (
                      <Tooltip key={item.pillar}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "flex flex-col items-center gap-1 h-auto py-2 px-3 relative group",
                              isActivePillar 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.title}</span>
                            {isActivePillar && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary rounded-full" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </nav>
              )}

              {/* Desktop Utility Navigation - SECONDARY */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-1">
                  {utilityNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const hasBadge = item.badge && item.badge > 0;
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "relative",
                              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {hasBadge && (
                              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
              
              {/* Admin Link - Only for admin users */}
              {isAuthenticated && isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/app/admin')}
                      className={cn(
                        "flex items-center gap-2",
                        location.pathname.startsWith('/app/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary'
                      )}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium hidden lg:inline">Admin</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Admin Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              )}
                  
              {/* Notifications Center */}
              {isAuthenticated && user && <NotificationCenter />}
              
              {/* User Profile Dropdown */}
              {isAuthenticated && profile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openAccountDrawer}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Desktop Navigation - Public */}
              {!isAuthenticated && (
                <>
                  <nav className="hidden md:flex items-center space-x-6">
                    {/* About Us Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-gray-700 hover:text-dna-forest transition-colors font-medium">
                          About Us
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {aboutUsDropdown.map((item) => (
                          <DropdownMenuItem
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className="cursor-pointer"
                          >
                            {item.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {publicNavItems.filter(item => item.path !== currentPath).map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className="text-gray-700 hover:text-dna-forest transition-colors font-medium"
                      >
                        {item.name}
                      </NavLink>
                    ))}
                    
                    {/* Phases Dropdown */}
                    {phases.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="text-gray-700 hover:text-dna-forest transition-colors font-medium">
                            Phases
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2">
                          {phases.map((phase, index) => {
                            const PhaseIcon = [Search, Lightbulb, Target, TestTube, Users2, Rocket][index];
                            const colors = ['text-dna-emerald', 'text-dna-forest', 'text-dna-copper', 'text-dna-mint', 'text-dna-gold', 'text-dna-emerald'];
                            const bgColors = ['hover:bg-dna-emerald/10', 'hover:bg-dna-forest/10', 'hover:bg-dna-copper/10', 'hover:bg-dna-mint/10', 'hover:bg-dna-gold/10', 'hover:bg-dna-emerald/10'];
                            
                            return (
                              <DropdownMenuItem 
                                key={phase.path}
                                onClick={() => navigate(phase.path)}
                                className={`py-3 px-3 cursor-pointer rounded-lg transition-all ${bgColors[index]} group`}
                              >
                                <div className="flex items-center w-full">
                                  <div className={`w-8 h-8 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mr-3 transition-colors`}>
                                    <PhaseIcon className={`w-4 h-4 ${colors[index]}`} />
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-base font-medium text-gray-900">{phase.name}</span>
                                    <div className="text-xs text-gray-500 mt-0.5">Phase {index + 1}</div>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    
                  </nav>
                  
                  {!isAuthenticated && (
                    <Button
                      variant="default"
                      onClick={handleSignInClick}
                      className="hidden md:inline-flex bg-dna-copper text-white hover:bg-dna-gold transition-all duration-200"
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}


              {/* Mobile Menu - Show only when not authenticated */}
              {!isAuthenticated && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="p-2 md:hidden"
                      aria-label="Open menu"
                    >
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                <SheetContent
                  side="left" 
                  className="w-[85vw] max-w-sm p-0 [&>*]:!hidden [&>div]:!block"
                  onPointerDownOutside={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex flex-col h-full max-h-screen">
                    <div className="p-4 sm:p-6 border-b flex-shrink-0">
                      <div className="flex items-center justify-end">
                        <img 
                          src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                          alt="Logo" 
                          className="h-6 sm:h-8 w-auto"
                        />
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 overflow-y-auto">
                      <nav className="flex flex-col space-y-1 p-4 sm:p-6 pb-20">
                        {!isAuthenticated ? (
                          <>
                            {/* About Us Section with submenu */}
                            <div className="border-b pb-4 mb-4">
                              <p className="text-sm text-gray-600 mb-2 font-medium px-4">About</p>
                              {aboutUsDropdown.map((item) => (
                                <Button
                                  key={item.name}
                                  variant="ghost"
                                  className="justify-start text-left w-full hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                  onClick={() => handleNavClick(item)}
                                >
                                  {item.name}
                                </Button>
                              ))}
                            </div>

                            {filteredNavItems.map((item) => (
                              <Button
                                key={item.name}
                                variant="ghost"
                                className="justify-start text-left hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                onClick={() => handleNavClick(item)}
                              >
                                {item.name}
                              </Button>
                            ))}
                            
                            {/* Mobile Phases Menu */}
                            {phases.length > 0 && (
                              <>
                                <div className="border-t pt-4 mt-4">
                                  <p className="text-sm text-gray-600 mb-4 font-medium">Development Phases</p>
                                  <div className="space-y-2">
                                    {phases.map((phase, index) => {
                                      const PhaseIcon = [Search, Lightbulb, Target, TestTube, Users2, Rocket][index];
                                      const colors = ['text-dna-emerald', 'text-dna-forest', 'text-dna-copper', 'text-dna-mint', 'text-dna-gold', 'text-dna-emerald'];
                                      
                                      return (
                                        <Button
                                          key={phase.path}
                                          variant="ghost"
                                          className="justify-start text-left w-full hover:bg-dna-mint/20 transition-all duration-200 focus:ring-0 focus:ring-offset-0 py-3"
                                          onClick={() => {
                                            navigate(phase.path);
                                            setIsMobileMenuOpen(false);
                                          }}
                                        >
                                          <div className="flex items-center w-full">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                              <PhaseIcon className={`w-4 h-4 ${colors[index]}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                              <div className="font-medium">{phase.name}</div>
                                              <div className="text-xs text-gray-500">Phase {index + 1}</div>
                                            </div>
                                          </div>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            
                            <Button
                              variant="default"
                              className="justify-start text-left transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                              onClick={handleSignInClick}
                            >
                              Sign In
                            </Button>
                          </>
                        ) : null}
                        
                      </nav>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Beta Signup Dialog */}
      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default UnifiedHeader;