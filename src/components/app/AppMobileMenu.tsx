import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
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

interface AppMobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackClick: () => void;
}

const AppMobileMenu: React.FC<AppMobileMenuProps> = ({
  isOpen,
  onOpenChange,
  onFeedbackClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, path: '/app' },
    { name: 'My Network', icon: Users, path: '/my-network' },
    { name: 'Communities', icon: Building, path: '/community' },
    { name: 'Projects', icon: FolderOpen, path: '/explore/projects' },
    { name: 'Messaging', icon: MessageCircle, path: '/messaging' },
  ];

  const profileItems = [
    { name: 'View Profile', icon: User, path: '/profile' },
    { name: 'Settings & Privacy', icon: Settings, path: '/profile/settings' },
    { name: 'My Posts & Activity', icon: FileText, path: '/app' },
    { name: 'Search', icon: Bell, path: '/search' },
    { name: 'Leaderboard', icon: Briefcase, path: '/leaderboard' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onOpenChange(false);
  };

  const handleFeedback = () => {
    onFeedbackClick();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                alt="DNA Logo" 
                className="h-8 w-auto"
              />
              <span className="text-dna-forest font-bold">DNA Network</span>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 px-6">
            <nav className="flex flex-col space-y-1 py-6">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-dna-mint/10 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dna-forest truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Navigation
                </p>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`justify-start text-left w-full hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200 ${
                      currentPath === item.path ? 'bg-dna-mint/30 text-dna-emerald font-medium' : ''
                    }`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                ))}
              </div>

              {/* Profile & Settings */}
              <div className="space-y-1 border-t pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                  Profile & Settings
                </p>
                {profileItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="justify-start text-left w-full hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200"
                    onClick={() => handleNavClick(item.path)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200"
                  onClick={handleFeedback}
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Give Feedback
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full hover:bg-dna-mint/20 hover:text-dna-forest transition-all duration-200"
                >
                  <Globe className="mr-3 h-4 w-4" />
                  Language
                </Button>
              </div>

              {/* Sign Out */}
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="ghost"
                  className="justify-start text-left w-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </nav>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppMobileMenu;