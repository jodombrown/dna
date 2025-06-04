
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Bell, MessageCircle, Users, Briefcase } from 'lucide-react';
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

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-africa-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-xl font-bold text-africa-green">DiasporaLink</span>
            </div>
          </div>

          {/* Search Bar */}
          {user && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for people, companies, or opportunities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-africa-orange focus:border-transparent"
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
                  <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs mt-1">Network</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-xs mt-1">Opportunities</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs mt-1">Messages</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
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
                        <AvatarFallback>
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
                    <DropdownMenuItem>Profile</DropdownMenuItem>
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
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-africa-orange hover:bg-africa-sunset"
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
