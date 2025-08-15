import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, Search, LayoutGrid } from 'lucide-react';
import { NAV, NavItem } from '@/config/nav';
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

const AppSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const { profile, signOut } = useAuth();
  const { activeView, setActiveView } = useDashboard();
  const location = useLocation();
  const currentPath = location.pathname;

  // Filter navigation items for main and bottom sections
  const mainNavItems = NAV.filter(item => 
    ['home', 'discover', 'connect', 'collaborate', 'contribute', 'notifications'].includes(item.key)
  );
  
  const bottomNavItems = NAV.filter(item => 
    ['profile', 'settings', 'help'].includes(item.key)
  );

  const isActive = (path: string) => {
    if (path === '/' || path === '/dna') {
      return currentPath === '/' || currentPath === '/dna';
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
                           <LayoutGrid className="h-5 w-5" />
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
                       <LayoutGrid className="mr-2 h-5 w-5" />
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
                           <Search className="h-5 w-5" />
                         </NavLink>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">Search</TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild>
                     <NavLink to="/dna/search" className={`${getNavCls('/dna/search')} flex items-center justify-start p-2 rounded-md`}>
                       <Search className="mr-2 h-5 w-5" />
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
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.key}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                             {item.key === 'messages' ? (
                               <RequireProfileScore min={80} featureName="Messages" showToast showModal={false}>
                                <NavLink to={item.path || '#'} className={`${getNavCls(item.path || '#')} flex items-center justify-center p-2 rounded-md`}>
                                  <IconComponent className="h-5 w-5" />
                                </NavLink>
                               </RequireProfileScore>
                             ) : (
                              <NavLink to={item.path || '#'} className={`${getNavCls(item.path || '#')} flex items-center justify-center p-2 rounded-md`}>
                                <IconComponent className="h-5 w-5" />
                              </NavLink>
                            )}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        {item.key === 'messages' ? (
                          <RequireProfileScore min={80} featureName="Messages" showToast showModal={false}>
                           <NavLink to={item.path || '#'} className={`${getNavCls(item.path || '#')} flex items-center justify-start p-2 rounded-md`}>
                             <IconComponent className="mr-2 h-5 w-5" />
                             <span>{item.label}</span>
                           </NavLink>
                          </RequireProfileScore>
                        ) : (
                          <NavLink to={item.path || '#'} className={getNavCls(item.path || '#')}>
                            <IconComponent className="mr-2 h-5 w-5" />
                            <span>{item.label}</span>
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* User Profile Section at Bottom */}
      <div className="mt-auto border-t border-gray-200 bg-background py-4 px-0">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest text-xs">
                    {profile.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Profile</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.key}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                             <NavLink to={item.path || '#'} className={`${getNavCls(item.path || '#')} flex items-center justify-center p-2 rounded-md`}>
                               <IconComponent className="h-5 w-5" />
                             </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                         <NavLink to={item.path || '#'} className={`${getNavCls(item.path || '#')} flex items-center justify-start p-2 rounded-md`}>
                           <IconComponent className="mr-2 h-5 w-5" />
                           <span>{item.label}</span>
                         </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
              
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
                           <LogOut className="h-5 w-5" />
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
                       <LogOut className="mr-2 h-5 w-5" />
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