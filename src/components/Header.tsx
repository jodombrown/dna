
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import NotificationsDropdown from './notifications/NotificationsDropdown';
import MessagingNotifications from './notifications/MessagingNotifications';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Button } from '@/components/ui/button';
import { User, MessageSquare, MessageCircle, Home, Users, Users2, Bell } from 'lucide-react';
import { mainNavItems } from './header/navigationConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          {user ? (
            // Authenticated: Show main navigation (feed-focused)
            <div className="hidden md:flex items-center space-x-6">
              {mainNavItems.map((item) => {
                const IconComponent = {
                  MessageSquare,
                  Users,
                  Users2,
                  MessageCircle,
                  Bell
                }[item.icon] || MessageSquare;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 text-gray-600 hover:text-dna-emerald"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          ) : null}
          
          <div className="flex items-center space-x-4">
            {!user && <DesktopNavigation />}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationsDropdown />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/messages')}
                  className="relative"
                >
                  <MessagingNotifications />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'DNA Member'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile/my')}>
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved')}>
                      Saved Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/')}>
                      <Home className="w-4 h-4 mr-2" />
                      Home (DNA Website)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/functional-auth')}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Sign In
              </Button>
            )}
            
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
