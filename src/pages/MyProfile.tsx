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
import SuggestedCommunitiesSection from "@/components/profile/SuggestedCommunitiesSection";
import SuggestedConnectionsSection from "@/components/profile/SuggestedConnectionsSection";

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

  // If user has not completed onboarding, send to onboarding
  useEffect(() => {
    // If user has not completed onboarding, send to onboarding
    if (user && profile && profile.onboarding_status && (
      !profile.onboarding_status.profile_completed ||
      !profile.onboarding_status.community_joined ||
      !profile.onboarding_status.connection_sent
    )) {
      navigate('/onboarding');
    }
  }, [user, profile, location, navigate]);

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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dna-forest mb-3">
            Join Africa’s Diaspora Community!
          </h2>
          <div className="text-lg text-dna-copper mb-2">
            Connect, collaborate, and help shape the future of African impact worldwide.
          </div>
          <div className="mb-6 text-gray-600 text-base">
            Already a member? <a href="/auth?mode=signin" className="underline text-dna-copper">Sign in here</a>.
            <br />
            New here? 
            <a href="/auth?mode=signup" className="underline text-dna-emerald ml-1">Join now</a>—it's fast and free!
          </div>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-full bg-dna-emerald hover:bg-dna-forest transition-colors text-white font-semibold text-lg shadow-md"
          >
            Sign In / Join the DNA Network
          </a>
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
        {/* Actual suggestions for onboarding */}
        <div className="mt-6">
          <h3 className="font-semibold text-dna-forest mb-2">Suggested communities to join</h3>
          <SuggestedCommunitiesSection
            impactAreas={profile?.impact_areas}
            onJoin={(communityId) => {
              toast({
                title: "Request Sent",
                description: "Your request to join the community has been submitted.",
              });
              // TODO: add join logic here
            }}
          />
        </div>
        <div className="mt-8">
          <h3 className="font-semibold text-dna-forest mb-2">People you may want to connect with</h3>
          <SuggestedConnectionsSection
            userId={user.id}
            countryOfOrigin={profile?.country_of_origin}
            location={profile?.location}
            onConnect={(profileId) =>
              toast({
                title: "Connection Sent",
                description: "We’ve sent a connection request on your behalf!",
              })
            }
          />
        </div>
        <div className="mt-8 text-center text-dna-copper text-base">
          <b>Need help onboarding?</b> Use the guided tour or reach out to our community manager for 1–1 support.
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
