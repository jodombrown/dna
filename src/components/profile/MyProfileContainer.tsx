
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  useEffect(() => setEditing(getEditingFromQuery()), [location.search]);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (editing) {
      if (searchParams.get("edit") !== "1") {
        searchParams.set("edit", "1");
        navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
      }
    } else {
      if (searchParams.get("edit")) {
        searchParams.delete("edit");
        navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
      }
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
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        setProfile(data || null);
        if (!data && !getEditingFromQuery()) {
          setEditing(true);
        }
      } catch (err: any) {
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
      // Show toast if completion >= 90 and they have been onboarded
      const { calculateProfileCompletion } = await import("./ProfileCompletionBar");
      if (calculateProfileCompletion(data) >= 90 && localStorage.getItem("dna-onboarded")) {
        toast({
          title: "🎉 Profile Nearly Complete!",
          description: "You’re ready to connect and explore the DNA community.",
        });
      }
    } catch (err: any) {
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
