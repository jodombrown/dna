import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

import { 
  Home,
  Users, 
  MessageSquare, 
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
  Rocket
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { publicNavItems, phases } from './header/navigationConfig';
import NotificationsBell from '@/components/notifications/NotificationsBell';

const UnifiedHeader = () => {
  const { user, profile, signOut, loading } = useAuth();
  
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

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  const isAuthenticated = !!user;
  const currentPath = location.pathname;
  const isAppRoute = currentPath.startsWith('/app');

  // Navigation items for authenticated users
  const authNavigationItems = [
    { title: 'Home', view: 'dashboard', icon: Home },
    { title: 'My Network', view: 'network', icon: Users },
    { title: 'Messaging', view: 'messaging', icon: MessageSquare },
    { title: 'Notifications', view: 'notifications', icon: Bell },
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
    // Check if we're in the app dashboard context
    if (location.pathname.startsWith('/app/dashboard') || 
        location.pathname.startsWith('/app/search') ||
        location.pathname.startsWith('/app/connect') ||
        location.pathname.startsWith('/app/messages') ||
        location.pathname.startsWith('/app/events') ||
        location.pathname.startsWith('/app/communities')) {
      // Navigate within app dashboard context
      const viewRouteMap: { [key: string]: string } = {
        'dashboard': '/app/dashboard',
        'search': '/app/search', 
        'network': '/app/connect',
        'messaging': '/app/messages',
        'notifications': '/app/notifications'
      };
      navigate(viewRouteMap[view] || '/app/dashboard');
    } else if (location.pathname === '/app') {
      setActiveView(view as any);
    } else {
      navigate('/app');
      setTimeout(() => setActiveView(view as any), 100);
    }
  };

  // Filter out current page from nav items for mobile menu
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section - Logo and Search */}
            <div className="flex items-center space-x-4">
              <NavLink 
                to={isAuthenticated ? "/app" : "/"} 
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                  alt="DNA Logo" 
                  className="h-8 w-auto"
                />
              </NavLink>
              
              {/* Search - only for authenticated users */}
              {isAuthenticated && isAppRoute && (
                <>
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search"
                      className="pl-10 w-40 lg:w-64 bg-gray-50 border-0 h-10 text-base cursor-pointer"
                      onClick={() => handleAuthNavigation('search')}
                      readOnly
                    />
                  </div>
                  
                  {/* Mobile search button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:hidden p-2"
                    onClick={() => handleAuthNavigation('search')}
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-gray-600" />
                  </Button>
                </>
              )}
            </div>

            {/* Center section - Navigation for authenticated users */}
            {isAuthenticated && isAppRoute && (
              <nav className="hidden lg:flex items-center space-x-8">
                {authNavigationItems.map((item) => {
                  const isActive = location.pathname === '/app' && activeView === item.view;
                  return (
                    <button
                      key={item.title}
                      onClick={() => handleAuthNavigation(item.view)}
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
            )}

            {/* Right section - Navigation and Profile */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && isAppRoute && <NotificationsBell />}
              {/* Desktop Navigation for unauthenticated users */}
              {(!isAuthenticated || !isAppRoute) && (
                <>
                  <nav className="hidden md:flex items-center space-x-6">
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
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger className="text-gray-700 hover:text-dna-forest transition-colors font-medium bg-transparent">
                            Phases
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="w-96 p-4">
                              <div className="grid gap-3">
                                {phases.map((phase) => {
                                  const Icon = phaseIcons[phase.phase as keyof typeof phaseIcons];
                                  return (
                                    <NavigationMenuLink key={phase.path} asChild>
                                      <button
                                        onClick={() => navigate(phase.path)}
                                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-dna-mint/20 transition-colors text-left w-full"
                                      >
                                        <div className="flex items-center justify-center w-8 h-8 bg-dna-copper text-white rounded-full text-sm font-bold flex-shrink-0">
                                          {phase.phase}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <Icon className="w-4 h-4 text-dna-forest" />
                                            <h4 className="text-sm font-medium text-gray-900">{phase.name}</h4>
                                          </div>
                                          <p className="text-xs text-gray-600">{phase.timeline}</p>
                                        </div>
                                      </button>
                                    </NavigationMenuLink>
                                  );
                                })}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </nav>
                  
                  {!isAuthenticated && (
                    <Button
                      variant="default"
                      onClick={handleSignInClick}
                      className="hidden md:inline-flex bg-dna-copper text-white hover:bg-primary"
                    >
                      Sign In
                    </Button>
                  )}
                </>
              )}

              {/* Profile Menu for authenticated users */}
              {isAuthenticated && isAppRoute && (
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
                    <DropdownMenuItem onClick={() => navigate('/settings/privacy')} className="py-3">
                      <span className="text-base">Settings & Privacy</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 py-3">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="text-base">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
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
                        {/* Show different navigation based on auth status */}
                        {isAuthenticated && isAppRoute ? (
                          <>
                            {authNavigationItems.map((item) => (
                              <Button
                                key={item.title}
                                variant="ghost"
                                className="justify-start text-left hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                onClick={() => {
                                  handleAuthNavigation(item.view);
                                  setIsMobileMenuOpen(false);
                                }}
                              >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.title}
                              </Button>
                            ))}
                            
                            <div className="border-t pt-4 mt-4">
                              <p className="text-sm text-gray-600 mb-4">More</p>
                              <div className="space-y-2">
                                <Button
                                  variant="ghost"
                                  className="justify-start text-left w-full hover:bg-dna-mint/20 transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                  onClick={() => {
                                    navigate('/app/events');
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  Events
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="justify-start text-left w-full hover:bg-dna-mint/20 transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                  onClick={() => {
                                    navigate('/app/communities');
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  Communities
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
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
                            
                            <Button
                              className="justify-start text-left bg-dna-copper text-white hover:bg-dna-copper/90 transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                              onClick={handleBetaSignup}
                            >
                              Join Beta
                            </Button>
                            
                            <Button
                              variant="default"
                              className="justify-start text-left transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                              onClick={handleSignInClick}
                            >
                              Sign In
                            </Button>
                          </>
                        )}
                        
                        {/* Development Phases - show for all users */}
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm text-gray-600 mb-4">Development Phases</p>
                          <div className="space-y-2">
                            {phases.map((phase) => (
                              <Button
                                key={phase.path}
                                variant="ghost"
                                className="justify-start text-left w-full hover:bg-dna-mint/20 transition-all duration-200 focus:ring-0 focus:ring-offset-0"
                                onClick={() => {
                                  navigate(phase.path);
                                  setIsMobileMenuOpen(false);
                                }}
                              >
                                <div className="w-6 h-6 bg-dna-copper text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                  {phase.phase}
                                </div>
                                {phase.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </nav>
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
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