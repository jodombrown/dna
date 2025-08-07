import React, { createContext, useContext, useState } from 'react';

type DashboardV1View = 'dashboard' | 'search' | 'connect' | 'profile' | 'messaging' | 'notifications' | 'metrics' | 'menu' | 'settings';

interface DashboardV1ContextType {
  activeView: DashboardV1View;
  setActiveView: (view: DashboardV1View) => void;
}

const DashboardV1Context = createContext<DashboardV1ContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardV1Context);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardV1Provider');
  }
  return context;
};

interface DashboardV1ProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardV1ProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<DashboardV1View>('dashboard');

  return (
    <DashboardV1Context.Provider value={{ activeView, setActiveView }}>
      {children}
    </DashboardV1Context.Provider>
  );
};