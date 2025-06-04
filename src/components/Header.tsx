
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Bell, MessageCircle, Users, Briefcase, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-dna-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-dna-copper rounded-lg flex items-center justify-center">
                <span className="text-dna-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-xl font-bold text-dna-forest">DNA</span>
            </div>
          </div>

          {/* Navigation Menu */}
          {user && (
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-dna-forest hover:bg-dna-mint">Community</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => scrollToSection('programs')}
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
                          onClick={() => scrollToSection('events')}
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
                          onClick={() => scrollToSection('resources')}
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
                          onClick={() => scrollToSection('services')}
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
                      onClick={() => scrollToSection('pathways')}
                      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-dna-mint hover:text-dna-forest focus:bg-dna-mint focus:text-dna-forest focus:outline-none text-dna-forest"
                    >
                      Innovation Pathways
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Search Bar */}
          {user && (
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

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Navigation Icons */}
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
                  <Button variant="ghost" size="sm" className="flex flex-col items-center p-2 text-dna-forest hover:bg-dna-mint">
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
