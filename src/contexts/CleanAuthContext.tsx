
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  profession?: string;
  skills?: string[];
  interests?: string[];
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  website_url?: string;
  is_mentor?: boolean;
  is_investor?: boolean;
  looking_for_opportunities?: boolean;
  onboarding_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
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

interface CleanAuthProviderProps {
  children: ReactNode;
}

export const CleanAuthProvider: React.FC<CleanAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
    const demoUser = { id: '1', email, name: 'Demo User' };
    const demoProfile = {
      id: '1',
      full_name: 'Demo User',
      display_name: 'Demo User',
      bio: 'Demo user for testing',
      location: 'Global',
      profession: 'Software Developer',
      skills: ['React', 'TypeScript'],
      interests: ['Technology', 'Innovation'],
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      onboarding_completed_at: new Date().toISOString()
    };
    
    setUser(demoUser);
    setProfile(demoProfile);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Demo sign up
    const demoUser = { id: '1', email, name: fullName };
    const demoProfile = {
      id: '1',
      full_name: fullName,
      display_name: fullName,
      bio: 'New user',
      location: 'Global',
      profession: 'Professional',
      skills: [],
      interests: [],
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      onboarding_completed_at: new Date().toISOString()
    };
    
    setUser(demoUser);
    setProfile(demoProfile);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const updatePassword = async (password: string) => {
    // Demo password update
    return { error: null };
  };

  const value = {
    user,
    loading,
    profile,
    signIn,
    signUp,
    signOut,
    updatePassword,
  };

  return (
    <CleanAuthContext.Provider value={value}>
      {children}
    </CleanAuthContext.Provider>
  );
};
