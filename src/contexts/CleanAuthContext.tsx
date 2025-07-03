
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const CleanAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(CleanAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a CleanAuthProvider');
  }
  return context;
};

interface CleanAuthProviderProps {
  children: ReactNode;
}

export const CleanAuthProvider: React.FC<CleanAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo sign in
    setUser({ id: '1', email, name: 'Demo User' });
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return (
    <CleanAuthContext.Provider value={value}>
      {children}
    </CleanAuthContext.Provider>
  );
};
