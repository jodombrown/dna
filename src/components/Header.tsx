
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Bell, MessageCircle, Users, Briefcase, Calendar, BookOpen, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
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

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/my-profile');
    }
  };

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect-example' },
    { name: 'Collaborate', path: '/collaborations-example' },
    { name: 'Contribute', path: '/contribute-example' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
              alt="DNA Platform" 
              className="h-8 w-auto"
            />
            DNA Platform
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-8">
          {publicNavItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="justify-start text-left"
              onClick={() => handleNavClick(item.path)}
            >
              {item.name}
            </Button>
          ))}
          
          {user ? (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-4">Dashboard</p>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/members')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/opportunities')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Opportunities
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left w-full"
                    onClick={() => handleNavClick('/innovation-pathways')}
                  >
                    Innovation Pathways
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full"
                  onClick={handleProfileClick}
                >
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="border-t pt-4 mt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => handleNavClick('/auth')}
                className="w-full border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-dna-white"
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-dna-copper hover:bg-dna-gold text-dna-white"
                onClick={() => handleNavClick('/auth')}
              >
                Join Now
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  const DesktopNavigation = () => (
    <nav className="hidden md:flex items-center space-x-8">
      {publicNavItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={() => navigate(item.path)}
          className="text-dna-forest hover:bg-dna-mint hover:text-dna-forest"
        >
          {item.name}
        </Button>
      ))}
    </nav>
  );

  return (
    <header className="bg-dna-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                alt="DNA Platform" 
                className="h-10 w-auto"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* User Dashboard Navigation (Desktop) */}
          {user && !isMobile && (
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-dna-mint hover:text-dna-forest focus:bg-dna-mint focus:text-dna-forest focus:outline-none text-dna-forest"
                    >
                      Dashboard
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-dna-forest hover:bg-dna-mint">Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate('/programs')}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint text-left w-full"
                        >
                          <GraduationCap className="w-5 h-5 text-dna-copper" />
                          <div>
                            <div className="font-medium text-dna-forest">Programs</div>
                            <div className="text-sm text-gray-600">Accelerators and initiatives</div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate('/events')}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint text-left w-full"
                        >
                          <Calendar className="w-5 h-5 text-dna-copper" />
                          <div>
                            <div className="font-medium text-dna-forest">Events</div>
                            <div className="text-sm text-gray-600">Conferences and meetups</div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate('/resources')}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint text-left w-full"
                        >
                          <BookOpen className="w-5 h-5 text-dna-copper" />
                          <div>
                            <div className="font-medium text-dna-forest">Resources</div>
                            <div className="text-sm text-gray-600">Guides and toolkits</div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate('/services')}
                          className="flex items-center space-x-3 p-3 rounded-md hover:bg-dna-mint text-left w-full"
                        >
                          <Briefcase className="w-5 h-5 text-dna-copper" />
                          <div>
                            <div className="font-medium text-dna-forest">Services</div>
                            <div className="text-sm text-gray-600">Professional services</div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => navigate('/innovation-pathways')}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-dna-mint hover:text-dna-forest focus:bg-dna-mint focus:text-dna-forest focus:outline-none text-dna-forest"
                    >
                      Innovation Pathways
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Search Bar (for logged in users) */}
          {user && !isMobile && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for people, companies, or opportunities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dna-copper focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation */}
            <MobileNavigation />

            {user ? (
              <>
                {/* Navigation Icons (Desktop) */}
                {!isMobile && (
                  <nav className="hidden md:flex items-center space-x-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex flex-col items-center p-2 text-dna-forest hover:bg-dna-mint"
                      onClick={() => navigate('/members')}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-xs mt-1">Members</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex flex-col items-center p-2 text-dna-forest hover:bg-dna-mint"
                      onClick={() => navigate('/opportunities')}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="text-xs mt-1">Opportunities</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 text-dna-forest hover:bg-dna-mint">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs mt-1">Messages</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 text-dna-forest hover:bg-dna-mint">
                      <Bell className="w-5 h-5" />
                      <span className="text-xs mt-1">Notifications</span>
                    </Button>
                  </nav>
                )}

                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback className="bg-dna-emerald text-dna-white">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick}>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              !isMobile && (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-dna-white"
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-dna-copper hover:bg-dna-gold text-dna-white"
                    onClick={() => navigate('/auth')}
                  >
                    Join Now
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
