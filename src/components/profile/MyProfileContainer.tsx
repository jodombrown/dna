
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/CleanAuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileSignInPanel from "./ProfileSignInPanel";
import ProfileLoadingState from "./ProfileLoadingState";
import ProfileErrorState from "./ProfileErrorState";
import ProfileOnboardingPanel from "./ProfileOnboardingPanel";
import ProfileLinkedInView from "./ProfileLinkedInView";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MyProfileContainer = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !localStorage.getItem("dna-onboarded")) {
      setShowTour(true);
    }
  }, [user]);

  const handleTourClose = () => {
    setShowTour(false);
    localStorage.setItem("dna-onboarded", "1");
  };

  function getEditingFromQuery() {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("edit") === "1";
  }

  // Fix: Prevent infinite loop by managing URL updates more carefully
  useEffect(() => {
    const shouldEdit = getEditingFromQuery();
    if (shouldEdit !== editing) {
      setEditing(shouldEdit);
    }
  }, [location.search]);

  // Fix: Only update URL when editing state actually changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentEdit = searchParams.get("edit");
    
    if (editing && currentEdit !== "1") {
      searchParams.set("edit", "1");
      navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
    } else if (!editing && currentEdit === "1") {
      searchParams.delete("edit");
      navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
    }
  }, [editing]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setFetching(false);
        setProfile(null);
        setEditing(false);
        return;
      }
      
      setFetching(true);
      setError(null);
      
      try {
        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }
        
        console.log('Profile data:', data);
        setProfile(data || null);
        
        // Only auto-enable editing if no profile exists and not already editing
        if (!data && !getEditingFromQuery()) {
          setEditing(true);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || "Failed to load profile.");
      } finally {
        setFetching(false);
      }
    }
    
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    localStorage.clear();
    sessionStorage.clear();
    toast({ title: "Signed Out", description: "You have been signed out and storage cleared." });
    setTimeout(() => navigate("/"), 1200);
  };

  const handleProfileSaved = async () => {
    if (!user) return;
    
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      setProfile(data || null);
      setEditing(false);
      
      // Show completion toast if profile is nearly complete
      if (data) {
        const { calculateProfileCompletion } = await import("./ProfileCompletionBar");
        if (calculateProfileCompletion(data) >= 90 && localStorage.getItem("dna-onboarded")) {
          toast({
            title: "🎉 Profile Nearly Complete!",
            description: "You're ready to connect and explore the DNA community.",
          });
        }
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || "Failed to load profile.");
    } finally {
      setFetching(false);
    }
  };

  if (authLoading || fetching) return <ProfileLoadingState />;
  if (error) return <ProfileErrorState error={error} />;
  if (!user) return <ProfileSignInPanel />;
  if (showTour) return <OnboardingTour open={showTour} onClose={handleTourClose} />;
  if (!profile || editing)
    return (
      <ProfileOnboardingPanel
        profile={profile}
        user={user}
        handleSignOut={handleSignOut}
        handleProfileSaved={handleProfileSaved}
        toast={toast}
      />
    );
  return (
    <ProfileLinkedInView
      user={user}
      profile={profile}
      handleSignOut={handleSignOut}
      setEditing={setEditing}
    />
  );
};

export default MyProfileContainer;
