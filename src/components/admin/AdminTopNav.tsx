import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AdminInfo {
  role: string;
  email: string;
  name: string;
  avatar?: string;
}

export function AdminTopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use real-time queries for admin info
  const { data: adminData } = useRealtimeQuery('admin-topnav-admin', {
    table: 'admin_users',
    select: 'role',
    filter: user ? `user_id=eq.${user.id},is_active=eq.true` : undefined,
    enabled: !!user
  });

  const { data: profileData } = useRealtimeQuery('admin-topnav-profile', {
    table: 'profiles',
    select: 'full_name, email, avatar_url',
    filter: user ? `id=eq.${user.id}` : undefined,
    enabled: !!user
  });

  const adminInfo = useMemo(() => {
    if (!user || adminData.length === 0 || profileData.length === 0) return null;

    return {
      role: adminData[0].role,
      email: profileData[0]?.email || user.email || '',
      name: profileData[0]?.full_name || 'Administrator',
      avatar: profileData[0]?.avatar_url || undefined,
    };
  }, [user, adminData, profileData]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="p-2 hover:bg-gray-100 rounded-md" />
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 h-9 bg-gray-50 border-gray-300 focus:bg-white focus:border-dna-emerald focus:ring-dna-emerald"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-gray-600" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600" />
            )}
          </Button>

          {/* Admin Profile Dropdown */}
          {adminInfo && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2 h-auto hover:bg-gray-100 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-32">{adminInfo.email}</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={adminInfo.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white text-xs">
                        {getInitials(adminInfo.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg z-50">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={adminInfo.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white">
                        {getInitials(adminInfo.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{adminInfo.name}</p>
                      <p className="text-sm text-gray-500 truncate">{adminInfo.email}</p>
                      <Badge className={`mt-1 ${getRoleBadgeColor(adminInfo.role)} text-xs`}>
                        {adminInfo.role}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                  <User className="w-4 h-4 mr-3" />
                  Profile Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
                  <Settings className="w-4 h-4 mr-3" />
                  Admin Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="p-3 cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}