import React, { createContext, useContext, useState } from 'react';

interface AccountDrawerState {
  isOpen: boolean;
}

interface AccountDrawerContextType extends AccountDrawerState {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const AccountDrawerContext = createContext<AccountDrawerContextType | undefined>(undefined);

export const AccountDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return (
    <AccountDrawerContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </AccountDrawerContext.Provider>
  );
};

export const useAccountDrawer = () => {
  const context = useContext(AccountDrawerContext);
  if (!context) {
    throw new Error('useAccountDrawer must be used within AccountDrawerProvider');
  }
  return context;
};
