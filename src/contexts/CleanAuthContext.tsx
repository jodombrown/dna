
import React, { createContext, useContext } from 'react';
import { useCleanAuth } from '@/hooks/useCleanAuth';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const CleanAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(CleanAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a CleanAuthProvider');
  }
  return context;
};

export const CleanAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useCleanAuth();
  return <CleanAuthContext.Provider value={auth}>{children}</CleanAuthContext.Provider>;
};
