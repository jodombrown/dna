import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Define all view states from Master Prompt
export type ViewState = 
  | 'DASHBOARD_HOME'
  | 'CONNECT_MODE'
  | 'CONVENE_MODE'
  | 'COLLABORATE_MODE'
  | 'CONTRIBUTE_MODE'
  | 'CONVEY_MODE'
  | 'MESSAGES_MODE'
  | 'FOCUS_DETAIL_MODE';

// Layout configuration for each view state
export type LayoutConfig = {
  type: 'three-column' | 'two-column' | 'full-canvas' | 'modal-overlay';
  leftWidth?: string;
  centerWidth?: string;
  rightWidth?: string;
  showLeftNav?: boolean;
  showRightColumn?: boolean;
};

interface ViewStateContextType {
  viewState: ViewState;
  layoutConfig: LayoutConfig;
}

const ViewStateContext = createContext<ViewStateContextType | undefined>(undefined);

export const useViewState = () => {
  const context = useContext(ViewStateContext);
  if (!context) {
    throw new Error('useViewState must be used within a ViewStateProvider');
  }
  return context;
};

interface ViewStateProviderProps {
  children: ReactNode;
}

// Route to ViewState mapping
const routeToViewState = (pathname: string): ViewState => {
  // DASHBOARD_HOME (default)
  if (pathname === '/dna/me' || pathname === '/dna/feed') {
    return 'DASHBOARD_HOME';
  }
  
  // CONNECT_MODE
  if (pathname.startsWith('/dna/connect') || 
      pathname.startsWith('/dna/network') || 
      pathname.startsWith('/dna/discover')) {
    return 'CONNECT_MODE';
  }
  
  // CONVENE_MODE
  if (pathname.startsWith('/dna/events') || 
      pathname.startsWith('/dna/convene')) {
    return 'CONVENE_MODE';
  }
  
  // MESSAGES_MODE
  if (pathname.startsWith('/dna/messages')) {
    return 'MESSAGES_MODE';
  }
  
  // COLLABORATE_MODE (future)
  if (pathname.startsWith('/dna/collaborate') || 
      pathname.startsWith('/dna/projects')) {
    return 'COLLABORATE_MODE';
  }
  
  // CONTRIBUTE_MODE (future)
  if (pathname.startsWith('/dna/contribute') || 
      pathname.startsWith('/dna/opportunities') ||
      pathname.startsWith('/dna/impact')) {
    return 'CONTRIBUTE_MODE';
  }
  
  // CONVEY_MODE (future)
  if (pathname.startsWith('/dna/convey') || 
      pathname.startsWith('/dna/daily') || 
      pathname.startsWith('/dna/stories')) {
    return 'CONVEY_MODE';
  }
  
  // FOCUS_DETAIL_MODE for specific item views
  if (pathname.match(/\/dna\/\w+\/[^/]+$/) && 
      !pathname.includes('/me') && 
      !pathname.includes('/feed')) {
    return 'FOCUS_DETAIL_MODE';
  }
  
  // Default fallback
  return 'DASHBOARD_HOME';
};

// ViewState to Layout configuration mapping
const viewStateToLayout = (viewState: ViewState): LayoutConfig => {
  switch (viewState) {
    case 'DASHBOARD_HOME':
      return {
        type: 'three-column',
        leftWidth: '15%',
        centerWidth: '70%',
        rightWidth: '15%',
        showLeftNav: true,
        showRightColumn: true,
      };
    
    case 'CONNECT_MODE':
      return {
        type: 'three-column',
        leftWidth: '15%',
        centerWidth: '70%',
        rightWidth: '15%',
        showLeftNav: true,
        showRightColumn: true, // Adapted with network stats
      };
    
    case 'CONVENE_MODE':
      return {
        type: 'two-column',
        leftWidth: '60%',
        rightWidth: '40%',
        showLeftNav: false, // Collapsed
        showRightColumn: true,
      };
    
    case 'MESSAGES_MODE':
      return {
        type: 'two-column',
        leftWidth: '35%',
        rightWidth: '65%',
        showLeftNav: false,
        showRightColumn: true,
      };
    
    case 'COLLABORATE_MODE':
      return {
        type: 'full-canvas',
        leftWidth: '20%',
        centerWidth: '80%',
        showLeftNav: true,
        showRightColumn: false,
      };
    
    case 'CONTRIBUTE_MODE':
      return {
        type: 'two-column',
        leftWidth: '55%',
        rightWidth: '45%',
        showLeftNav: true,
        showRightColumn: true,
      };
    
    case 'CONVEY_MODE':
      return {
        type: 'three-column',
        leftWidth: '15%',
        centerWidth: '70%',
        rightWidth: '15%',
        showLeftNav: true,
        showRightColumn: true,
      };
    
    case 'FOCUS_DETAIL_MODE':
      return {
        type: 'modal-overlay',
        showLeftNav: true,
        showRightColumn: false,
      };
    
    default:
      return {
        type: 'three-column',
        leftWidth: '15%',
        centerWidth: '70%',
        rightWidth: '15%',
        showLeftNav: true,
        showRightColumn: true,
      };
  }
};

export const ViewStateProvider: React.FC<ViewStateProviderProps> = ({ children }) => {
  const location = useLocation();
  
  const viewState = useMemo(() => routeToViewState(location.pathname), [location.pathname]);
  const layoutConfig = useMemo(() => viewStateToLayout(viewState), [viewState]);

  const value = useMemo(
    () => ({ viewState, layoutConfig }),
    [viewState, layoutConfig]
  );

  return (
    <ViewStateContext.Provider value={value}>
      {children}
    </ViewStateContext.Provider>
  );
};
