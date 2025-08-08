
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Public method to refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Preview mode: bypass Supabase auth and provide mock user/profile
    try {
      const params = new URLSearchParams(window.location.search);
      const previewFlag = params.get('preview') === '1';
      const localFlag = typeof localStorage !== 'undefined' && localStorage.getItem('dna_preview') === '1';
      const isPreview = previewFlag || localFlag;

      if (isPreview) {
        if (previewFlag) {
          try { localStorage.setItem('dna_preview', '1'); } catch {}
        }
        const mockUser = ({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'preview@diasporanetwork.africa',
          app_metadata: { provider: 'preview' },
          user_metadata: { full_name: 'Preview User' },
          aud: 'authenticated',
        } as unknown) as User;

        setSession(null);
        setUser(mockUser);
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: 'Preview User',
          display_name: 'Preview User',
          username: 'preview-user',
          avatar_url: null,
          is_public: true,
          profile_completeness_score: 100,
        });
        setLoading(false);
        return; // Do not initialize Supabase listeners in preview
      }
    } catch {}

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile after a short delay to allow database trigger to complete
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Network error getting session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        // Provide more specific error messages
        if (error.message.includes('already registered')) {
          return { error: { ...error, message: 'This email is already registered. Please sign in instead.' } };
        }
        if (error.message.includes('Password')) {
          return { error: { ...error, message: 'Password must be at least 6 characters long.' } };
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return { error: { ...error, message: 'Connection error. Please check your internet connection and try again.' } };
        }
      }
      
      return { error };
    } catch (networkError: any) {
      console.error('Network error during sign up:', networkError);
      return { 
        error: { 
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          name: 'NetworkError'
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Invalid email or password. Please try again.' } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: { ...error, message: 'Please check your email and confirm your account before signing in.' } };
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return { error: { ...error, message: 'Connection error. Please check your internet connection and try again.' } };
        }
      }
      
      return { error };
    } catch (networkError: any) {
      console.error('Network error during sign in:', networkError);
      return { 
        error: { 
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          name: 'NetworkError'
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    profile,
    signUp,
    signIn,
    signOut,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
