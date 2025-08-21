import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from '@/components/layout/AppSidebar';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold">DNA Platform</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        3
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-96 p-0" 
                    align="end"
                    sideOffset={5}
                  >
                    <NotificationCenter />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppShell;