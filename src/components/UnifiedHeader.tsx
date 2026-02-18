import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';
import dnaLogo from '@/assets/dna-logo.png';

import { 
  Home,
  MessageCircle,
  Bell,
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
  Shield,
  Plus,
  Search
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
import { publicNavItems, aboutUsDropdown } from './header/navigationConfig';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { useMobile } from '@/hooks/useMobile';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { UniversalComposer } from '@/components/composer/UniversalComposer';

const UnifiedHeader = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { open: openAccountDrawer } = useAccountDrawer();
  const { isMobile } = useMobile();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);
  
  // Universal Composer hook for global create button
  const composer = useUniversalComposer();

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
  
  // Hide UnifiedHeader on mobile for Connect routes (has its own header)
  // Also hide when header visibility is set to hidden (e.g., during mobile chat)
  // IMPORTANT: This check must be AFTER all hooks to prevent "fewer hooks" error
  const isConnectRoute = location.pathname.includes('/dna/connect');
  const { isHeaderHidden } = useHeaderVisibility();
  
  if (isMobile && (isConnectRoute || isHeaderHidden)) {
    return null;
  }

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
                  src={dnaLogo}
                  alt="DNA Logo" 
                  className="h-[60px] w-auto"
                  width={57}
                  height={32}
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
                          src={dnaLogo}
                          alt="Logo" 
                  className="h-[60px] w-auto"
                  width={57}
                  height={32}
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

  // NOTE: 5C Framework Navigation removed from header - PulseBar is now the primary navigation
  // This consolidation reduces confusion from duplicate navigation elements

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
                  src={dnaLogo}
                  alt="DNA Logo" 
                  className="h-[60px] w-auto"
                  width={57}
                  height={32}
                />
              </NavLink>
              
            </div>


            {/* Right section - Navigation and Profile */}
            <div className="flex items-center space-x-4">
              {/* 5C Navigation removed - PulseBar is now the primary Five C's navigation */}

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
              
              {/* Global Create Button - Opens Universal Composer */}
              {isAuthenticated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => composer.open('post')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 hidden md:flex"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Create</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create post, story, event, space, or opportunity</p>
                  </TooltipContent>
                </Tooltip>
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
                          src={dnaLogo}
                          alt="Logo" 
                          className="h-6 sm:h-8 w-auto"
                          width={57}
                          height={32}
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

                            {/* The 5 C's Section */}
                            <div className="border-b pb-4 mb-4">
                              <p className="text-sm text-gray-600 mb-2 font-medium px-4">The 5 C's</p>
                              {filteredNavItems.map((item) => (
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

      {/* Universal Composer - Global Create */}
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
      />
    </>
  );
};

export default UnifiedHeader;