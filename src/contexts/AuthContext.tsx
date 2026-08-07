
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_SELECT_COLUMNS } from '@/lib/profileColumns';
import { logger } from '@/lib/logger';

/**
 * User profile data from the profiles table
 */
export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  profession: string | null;
  industry: string | null;
  created_at: string;
  updated_at?: string;
  // Optional fields that may be present
  current_country?: string | null;
  current_city?: string | null;
  /** Primary origin country, ISO code, sourced from member_heritage (BD038). */
  primary_origin_country?: string | null;
  
  verification_status?: string | null;
  current_role?: string | null;
  professional_title?: string | null;
  professional_role?: string | null;
  professional_sectors?: string[] | null;
  skills?: string[] | null;
  years_experience?: number | null;
  interests?: string[] | null;
  my_dna_statement?: string | null;
  focus_areas?: string[] | null;
  regional_expertise?: string[] | null;
  industries?: string[] | null;
  engagement_intentions?: string[] | null;
  onboarding_completed_at?: string | null;
  connections_count?: number | null;
  connection_count?: number | null;
  profile_views_count?: number | null;
}

/**
 * Error type for auth operations - matches Supabase AuthError structure
 */
export interface AuthOperationError {
  message: string;
  name?: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | AuthOperationError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | AuthOperationError | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs, not state: both are read from inside long-lived closures
  // (onAuthStateChange's callback, async chains in getInitialSession) that
  // must always see the *current* value, not the value captured when the
  // closure was created. `isInitialized` as state was ineffective for this
  // reason — the onAuthStateChange closure is created once, at mount, so it
  // always read isInitialized as false, and the `authVersion` counter below
  // needs read/write from that same code without triggering re-renders.
  const isInitializedRef = useRef(false);
  // Bumped by every authoritative auth event (a real onAuthStateChange
  // firing, or an explicit signOut()). Any async chain that resolves after
  // its own captured version has been superseded is stale and must not
  // write session/user/profile state — this closes a race where a slow
  // getUser() validation round trip in getInitialSession() could resolve
  // after a sign-out and silently resurrect the just-cleared session.
  const authVersionRef = useRef(0);

  // Fetch user profile. `expectedVersion` guards every state write against
  // being superseded by a newer auth event while this call was in flight.
  const fetchProfile = async (userId: string, expectedVersion: number) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT_COLUMNS)
        .eq('id', userId)
        .maybeSingle();

      if (authVersionRef.current !== expectedVersion) return;

      if (error) {
        logger.error('AuthContext', 'Failed to fetch profile', error);
        return;
      }

      if (!data) {
        // Profile should have been created by trigger — brief retry delay
        await new Promise(resolve => setTimeout(resolve, 150));

        if (authVersionRef.current !== expectedVersion) return;

        // Try one more time
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .select(PROFILE_SELECT_COLUMNS)
          .eq('id', userId)
          .maybeSingle();

        if (authVersionRef.current !== expectedVersion) return;

        if (retryError) {
          logger.error('AuthContext', 'Failed to fetch profile on retry', retryError);
          return;
        }

        if (retryData) {
          setProfile(retryData);
          return;
        }

        // If still no profile, the trigger failed
        logger.warn('AuthContext', 'No profile found for user after retry', { userId });
        return;
      }

      setProfile(data);
    } catch (err) {
      logger.error('AuthContext', 'Unexpected error fetching profile', err);
    }
  };

  // Public method to refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, authVersionRef.current);
    }
  };

  useEffect(() => {
    // Removed dev bypass; relying solely on Supabase auth

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Every real auth event is authoritative: bump the version so any
        // in-flight, now-superseded async response (e.g. getInitialSession's
        // getUser() validation round trip below) can never overwrite this
        // with stale data once it resolves.
        const myVersion = ++authVersionRef.current;

        setSession(session);
        setUser(session?.user ?? null);

      if (session?.user) {
          // Fetch profile immediately - the retry inside fetchProfile handles race conditions
          fetchProfile(session.user.id, myVersion);
        } else {
          setProfile(null);
        }

        // Only set loading to false after initial session check is complete
        if (isInitializedRef.current) {
          setLoading(false);
        }
      }
    );

    // Get initial session with error handling
    const getInitialSession = async () => {
      const myVersion = ++authVersionRef.current;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          isInitializedRef.current = true;
          setLoading(false);
          return;
        }

        // Validate the stored JWT against Auth server. A stale token from a
        // prior signing-key rotation or storageKey change comes back as
        // "bad_jwt / missing sub claim" and poisons every downstream RPC.
        // Clear it so the app falls back to the signed-out state instead of
        // rendering a blank screen behind 401s.
        if (session) {
          const { error: userError } = await supabase.auth.getUser();

          if (authVersionRef.current !== myVersion) {
            // A newer auth event (e.g. a sign-out that happened while this
            // JWT validation round trip was in flight) already landed —
            // acting on this stale session would resurrect a session the
            // user just signed out of.
            isInitializedRef.current = true;
            setLoading(false);
            return;
          }

          if (userError) {
            // Only clear the session for a definitively bad token. A transient
            // failure (offline, Supabase 5xx/timeout) must NOT sign the user
            // out — keep the session and let downstream calls retry.
            const status = userError.status;
            const isBadToken =
              status === 401 ||
              status === 403 ||
              /bad_jwt|invalid claim|missing sub/i.test(userError.message ?? '');
            if (isBadToken) {
              await supabase.auth.signOut();
              if (authVersionRef.current === myVersion) {
                setSession(null);
                setUser(null);
                setProfile(null);
              }
              isInitializedRef.current = true;
              setLoading(false);
              return;
            }
          }
        }

        if (authVersionRef.current !== myVersion) {
          isInitializedRef.current = true;
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id, myVersion);
        }

        isInitializedRef.current = true;
        setLoading(false);
      } catch {
        isInitializedRef.current = true;
        setLoading(false);
      }
    };

    getInitialSession();


    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dna/feed`;
      
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
        // Provide more specific error messages
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          return { error: { ...error, message: 'This email is already registered. Please sign in instead.' } };
        }
        const lowerMsg = error.message.toLowerCase();
        // Map only explicit minimum-length messages to our 8-character requirement
        if (
          lowerMsg.includes('should be at least') ||
          lowerMsg.includes('at least 6 characters') ||
          lowerMsg.includes('at least 8 characters')
        ) {
          return { error: { ...error, message: 'Password must be at least 8 characters long.' } };
        }
        // For other password-related errors (strength, leaks, etc.), surface Supabase's message directly
        if (lowerMsg.includes('password')) {
          return { error };
        }
        if (error.message.includes('Invalid email') || error.message.includes('invalid email')) {
          return { error: { ...error, message: 'Please enter a valid email address.' } };
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          return { error: { ...error, message: 'Connection error. Please check your internet connection and try again.' } };
        }
        // Return the original error message if no specific match
        return { error };
      }
      
      return { error };
    } catch {
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
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
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
      
      return { error, data: { user: data?.user ?? null } };
    } catch {
      return { 
        error: { 
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          name: 'NetworkError'
        } 
      };
    }
  };

  const signOut = async () => {
    // Bump the version immediately, without waiting for the
    // onAuthStateChange event to arrive, so any async chain already in
    // flight (e.g. a slow getInitialSession() JWT-validation round trip)
    // can never resurrect this session after we've cleared it here.
    ++authVersionRef.current;
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
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
