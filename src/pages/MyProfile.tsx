
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedProfileDisplay from "@/components/profile/EnhancedProfileDisplay";
import EnhancedProfileForm from "@/components/profile/EnhancedProfileForm";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const MyProfile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        // If no profile, go straight to editing
        setEditing(!data);
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
    // Refetch profile and exit editing mode after save.
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

  if (editing || !profile) {
    // Show the profile editing form on first visit if profile is missing,
    // or anytime editing is active.
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
        <EnhancedProfileForm profile={profile} onSave={handleProfileSaved} />
      </div>
    );
  }

  // Show the completed profile
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
      {/* Show profile display, with Edit function */}
      <EnhancedProfileDisplay
        profile={profile}
        isOwnProfile={profile.id === user.id}
        onEdit={() => setEditing(true)}
        onConnect={() => {}}
      />
    </div>
  );
};

export default MyProfile;

