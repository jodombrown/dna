import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Flag, 
  Calendar, 
  Settings,
  Lock,
  BarChart3,
  Shield
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
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/admin/insights',
    icon: BarChart3,
  },
  {
    title: 'Communities',
    url: '/admin/communities',
    icon: Building,
  },
  {
    title: 'Content Moderation',
    url: '/admin/moderation',
    icon: Flag,
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: Calendar,
  },
  {
    title: 'Admin Roles',
    url: '/admin/roles',
    icon: Shield,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const isExpanded = navigationItems.some((item) => isActive(item.url));
  
  const getNavClass = (path: string) => {
    const baseClass = "w-full justify-start transition-colors duration-200";
    return isActive(path) 
      ? `${baseClass} bg-dna-emerald/10 text-dna-emerald border-r-2 border-dna-emerald` 
      : `${baseClass} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-64'} border-r border-gray-200 bg-white`}>
      <SidebarContent className="px-0">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-dna-emerald to-dna-copper rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-dna-forest">DNA Admin</h2>
                <p className="text-xs text-gray-500">Control Panel</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-0">
          <SidebarGroupLabel className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${collapsed ? 'hidden' : ''}`}>
            Administration
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Indicator */}
        {!collapsed && (
          <div className="mt-auto px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">System Online</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}