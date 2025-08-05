import React, { createContext, useContext, useState, ReactNode } from 'react';

type DashboardView = 'dashboard' | 'search' | 'network' | 'messaging' | 'notifications' | 'metrics' | 'profile' | 'menu' | 'settings';

interface DashboardContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  activePillar: string;
  setActivePillar: (pillar: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [activePillar, setActivePillar] = useState('feed');

  return (
    <DashboardContext.Provider
      value={{
        activeView,
        setActiveView,
        activePillar,
        setActivePillar,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};