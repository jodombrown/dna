import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings, 
  User,
  LogOut,
  BookOpen,
  Briefcase,
  Square,
  LayoutGrid,
  Search
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';

const mainNavItems = [
  { title: 'Home', url: '/dna', icon: Home },
  { title: 'Connect', url: '/dna/connect', icon: Users },
  { title: 'Spaces', url: '/dna/spaces', icon: Square },
  { title: 'Opportunities', url: '/dna/opportunities', icon: Briefcase },
  { title: 'Messages', url: '/dna/messages', icon: MessageSquare },
  { title: 'Events', url: '/dna/events', icon: Calendar },
  { title: 'Communities', url: '/dna/communities', icon: BookOpen },
];

const bottomNavItems = [
  { title: 'Profile', url: '/dna/profile', icon: User },
  { title: 'Settings', url: '/settings/privacy', icon: Settings },
];

const AppSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const { profile, signOut } = useAuth();
  const { activeView, setActiveView } = useDashboard();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dna') {
      return currentPath === '/dna';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? 'bg-dna-mint/20 text-dna-forest font-medium border-r-2 border-dna-copper' 
      : 'hover:bg-gray-100 text-gray-700 hover:text-dna-forest';

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      {/* Brand */}
      <div className="p-4 border-b border-border bg-background flex items-center justify-center">
        <NavLink to="/dna" className="flex items-center">
          <img
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png"
            alt="DNA logo"
            loading="lazy"
            className="h-12 w-auto object-contain transition-all"
          />
        </NavLink>
      </div>

      <SidebarContent>
        {/* Sidebar Toggle */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                         <button 
                           onClick={toggleSidebar}
                           className="w-full flex items-center justify-center text-gray-700 hover:text-dna-forest hover:bg-gray-100 p-2 rounded-md"
                         >
                           <LayoutGrid className="h-4 w-4" />
                        </button>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Navigation</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                     <button 
                       onClick={toggleSidebar}
                       className="w-full flex items-center justify-start text-gray-700 hover:text-dna-forest hover:bg-gray-100 p-2 rounded-md"
                     >
                       <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>Navigation</span>
                    </button>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Search */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                         <NavLink to="/dna/search" className={`${getNavCls('/dna/search')} flex items-center justify-center p-2 rounded-md`}>
                           <Search className="h-4 w-4" />
                         </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Search</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                     <NavLink to="/dna/search" className={`${getNavCls('/dna/search')} flex items-center justify-start p-2 rounded-md`}>
                       <Search className="mr-2 h-4 w-4" />
                       <span>Search</span>
                     </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          {item.title === 'Messages' ? (
                            <RequireProfileScore min={80} featureName="Messages" showToast showModal={false}>
                             <NavLink to={item.url} className={`${getNavCls(item.url)} flex items-center justify-center p-2 rounded-md`}>
                               <item.icon className="h-4 w-4" />
                             </NavLink>
                            </RequireProfileScore>
                          ) : (
                            <NavLink to={item.url} className={getNavCls(item.url)}>
                              <item.icon className="mr-2 h-4 w-4" />
                            </NavLink>
                          )}
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                      {item.title === 'Messages' ? (
                        <RequireProfileScore min={80} featureName="Messages" showToast showModal={false}>
                         <NavLink to={item.url} className={`${getNavCls(item.url)} flex items-center justify-start p-2 rounded-md`}>
                           <item.icon className="mr-2 h-4 w-4" />
                           <span>{item.title}</span>
                         </NavLink>
                        </RequireProfileScore>
                      ) : (
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* User Profile Section at Bottom */}
      <div className="mt-auto p-4 border-t border-gray-200 bg-background">
        {!isCollapsed && profile && (
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold">
                {profile.display_name?.charAt(0) || profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dna-forest truncate">
                {profile.display_name || profile.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile.current_role || 'DNA Member'}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && profile && (
          <div className="flex justify-center mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-dna-mint text-dna-forest text-xs">
                {profile.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                           <NavLink to={item.url} className={`${getNavCls(item.url)} flex items-center justify-center p-2 rounded-md`}>
                             <item.icon className="h-4 w-4" />
                           </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton asChild>
                       <NavLink to={item.url} className={`${getNavCls(item.url)} flex items-center justify-start p-2 rounded-md`}>
                         <item.icon className="mr-2 h-4 w-4" />
                         <span>{item.title}</span>
                       </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                         <Button
                           variant="ghost"
                           onClick={signOut}
                           className="w-full flex items-center justify-center text-gray-700 hover:text-red-600 hover:bg-red-50 p-2 rounded-md"
                         >
                           <LogOut className="h-4 w-4" />
                        </Button>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Sign Out</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                     <Button
                       variant="ghost"
                       onClick={signOut}
                       className="w-full flex items-center justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 p-2 rounded-md"
                     >
                       <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;