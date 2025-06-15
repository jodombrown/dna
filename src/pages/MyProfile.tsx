import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedProfileDisplay from "@/components/profile/EnhancedProfileDisplay";
import EnhancedProfileForm from "@/components/profile/EnhancedProfileForm";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import ProfileCompletionBar, { calculateProfileCompletion } from "@/components/profile/ProfileCompletionBar";

const MyProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Helper to mark if this is the user's first visit and show tour
  useEffect(() => {
    if (user && !localStorage.getItem("dna-onboarded")) {
      setShowTour(true);
    }
  }, [user]);

  const handleTourClose = () => {
    setShowTour(false);
    localStorage.setItem("dna-onboarded", "1");
  };

  // Parse query param
  function getEditingFromQuery() {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("edit") === "1";
  }

  // Keep editing state synced with URL param
  useEffect(() => {
    setEditing(getEditingFromQuery());
    // eslint-disable-next-line
  }, [location.search]);

  // When editing changes (via code, e.g. user clicks "Edit Profile"), sync to URL
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
    // eslint-disable-next-line
  }, [editing]);

  // Fetch profile logic
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
        // If no profile, go straight to editing (or respect URL param)
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

  // Sign out logic
  const handleSignOut = async () => {
    await signOut();
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Signed Out",
      description: "You have been signed out and storage cleared.",
    });
    setTimeout(() => {
      navigate("/");
    }, 1200);
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
      setEditing(false); // Clear ?edit param
      // Show completion notification if new user
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

  if (authLoading || fetching) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Spinner />
        <div className="mt-4 text-gray-700 text-lg">Loading your profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="text-red-600 font-semibold mb-2">Error loading profile</div>
        <div className="mb-4">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="text-gray-700 text-lg">
          You are not logged in. Please <a href="/auth" className="underline text-dna-copper">sign in</a>.
        </div>
      </div>
    );
  }

  // Onboarding popup for new users
  if (showTour) {
    return (
      <OnboardingTour open={showTour} onClose={handleTourClose} />
    );
  }

  if (editing || !profile) {
    // Show the profile editing form (first visit, or when editing is active)
    return (
      <div className="max-w-2xl mx-auto pt-4">
        <div className="flex justify-end">
          <Button
            variant="destructive"
            className="mb-6"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
        <ProfileCompletionBar profile={profile || {}} />
        <EnhancedProfileForm profile={profile} onSave={handleProfileSaved} />
        {/* Placeholder: Suggestions for next steps */}
        <div className="mt-6">
          <b>Suggested communities to join:</b>
          <div className="text-sm text-gray-500 mt-1">
            (Personalized suggestions coming soon)
          </div>
          <b className="block mt-5">Suggested connections:</b>
          <div className="text-sm text-gray-500 mt-1">
            (Personalized suggestions coming soon)
          </div>
        </div>
      </div>
    );
  }

  // Show the completed profile with profile completion and dashboard suggestion
  return (
    <div className="max-w-2xl mx-auto pt-4">
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="mb-6"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
      <ProfileCompletionBar profile={profile} />
      <EnhancedProfileDisplay
        profile={profile}
        isOwnProfile={profile.id === user.id}
        onEdit={() => setEditing(true)}
        onConnect={() => {}}
      />
      {/* Placeholder for dashboard */}
      <div className="mt-8">
        <b className="block mb-1 text-dna-forest">Your Personalized Dashboard (coming soon)</b>
        <div className="rounded bg-dna-mint/5 py-3 px-4 text-gray-700">
          Once onboarding is complete, you’ll see events, community invites, and more here!
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
