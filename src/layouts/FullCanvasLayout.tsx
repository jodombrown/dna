import React, { useState } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullCanvasLayoutProps {
  sidebar?: React.ReactNode;
  sidebarWidth?: string;
  content: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * FullCanvasLayout - Immersive workspace layout
 * 
 * Primary use case: COLLABORATE MODE
 * Features:
 * - Optional collapsible sidebar (default 20% width)
 * - Main content takes remaining space (80% when sidebar visible)
 * - Sidebar can be toggled to maximize content area
 * - Mobile: Sidebar becomes overlay/drawer
 * 
 * Default configuration: 20% sidebar - 80% content
 */
const FullCanvasLayout: React.FC<FullCanvasLayoutProps> = ({
  sidebar,
  sidebarWidth = '20%',
  content,
  className,
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const { isMobile, isTablet } = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Mobile: Overlay sidebar or hide it
  if (isMobile || isTablet) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        {/* Main content always visible */}
        <div className="w-full h-full overflow-y-auto p-4 transition-all duration-300 ease-in-out">
          {content}
        </div>

        {/* Sidebar as overlay when not collapsed */}
        {sidebar && !isCollapsed && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar overlay */}
            <aside className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 overflow-y-auto p-4 animate-slide-in-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="absolute top-4 right-4"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {sidebar}
            </aside>
          </>
        )}

        {/* Toggle button for mobile */}
        {sidebar && collapsible && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="fixed bottom-4 left-4 z-30 shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Desktop: Side-by-side layout with independent scrolling
  return (
    <div className={cn("flex w-full gap-4 p-4", className)} style={{ height: 'calc(100dvh - 64px)' }}>
      {/* Sidebar */}
      {sidebar && !isCollapsed && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-auto relative h-full"
          style={{ 
            width: sidebarWidth,
            minWidth: 0, // Allow shrinking below content width
          }}
        >
          <div className="min-w-max">
            {sidebar}
          </div>
          
          {/* Collapse button */}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="sticky top-2 right-2 h-8 w-8 ml-auto float-right"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </aside>
      )}

      {/* Main content area */}
      <main 
        id="main-content"
        tabIndex={-1}
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto relative h-full focus:outline-none",
          isCollapsed && "w-full"
        )}
        style={{ minWidth: 0 }}
      >
        <div className="min-w-max">
          {content}
        </div>
        
        {/* Expand button when sidebar is collapsed */}
        {sidebar && collapsible && isCollapsed && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="sticky top-4 left-4 shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </main>
    </div>
  );
};

export default FullCanvasLayout;
