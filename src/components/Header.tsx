
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './header/Logo';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import NotificationsDropdown from './notifications/NotificationsDropdown';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
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
          
          <div className="flex items-center space-x-4">
            <DesktopNavigation />
            
            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationsDropdown />
                
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
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/my')}>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/connect')}>
                      Connect
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/communities')}>
                      Communities
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-communities')}>
                      My Communities
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/saved')}>
                      Saved Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      Messages
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
