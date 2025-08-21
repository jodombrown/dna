import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  User,
  Briefcase,
  BarChart3,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Search,
  Plus,
  Award
} from 'lucide-react';

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const currentPath = location.pathname;

  const mainNavItems = [
    { title: "Dashboard", url: "/dna/dashboard", icon: Home },
    { title: "Connect", url: "/dna/connect", icon: Users },
    { title: "Events", url: "/dna/events", icon: Calendar },
    { title: "Messages", url: "/dna/messages", icon: MessageSquare },
    { title: "Analytics", url: "/dna/analytics", icon: BarChart3 },
  ];

  const toolsItems = [
    { title: "Collaboration", url: "/dna/collaboration", icon: Briefcase },
    { title: "Opportunities", url: "/dna/opportunities", icon: Award },
    { title: "Notifications", url: "/dna/notifications", icon: Bell },
  ];

  const accountItems = [
    { title: "Profile", url: "/dna/profile", icon: User },
    { title: "Settings", url: "/dna/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors";

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Monitor;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <Sidebar 
      className={`border-r ${collapsed ? "w-16" : "w-64"} transition-all duration-300`}
    >
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              DNA
            </div>
            <div>
              <h2 className="font-bold text-lg">DNA Platform</h2>
              <p className="text-xs text-muted-foreground">Diaspora Network</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm mx-auto">
            DNA
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Search */}
        <div className="p-2">
          {!collapsed ? (
            <Button variant="outline" className="w-full justify-start text-muted-foreground">
              <Search className="h-4 w-4 mr-2" />
              Search...
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="w-full">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                      {item.title === "Notifications" && !collapsed && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          3
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 space-y-2">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "sm"}
          onClick={toggleTheme}
          className="w-full"
        >
          <ThemeIcon className="h-4 w-4" />
          {!collapsed && (
            <span className="ml-2 capitalize">
              {theme} mode
            </span>
          )}
        </Button>

        <Separator />

        {/* User Profile */}
        <div className={`flex items-center p-2 rounded-lg hover:bg-accent transition-colors ${
          collapsed ? 'justify-center' : 'space-x-3'
        }`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "sm"}
          onClick={() => signOut()}
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="pt-2">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;