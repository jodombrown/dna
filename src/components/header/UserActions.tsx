
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, MessageCircle, Users, Briefcase } from 'lucide-react';
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
import { Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const UserActions = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/my-profile');
    }
  };

  if (!user) {
    return !isMobile ? (
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
    ) : null;
  }

  return (
    <>
      {/* User Dashboard Navigation (Desktop) */}
      {!isMobile && (
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
  );
};

export default UserActions;
