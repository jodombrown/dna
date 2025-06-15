
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedProfileDisplay from "@/components/profile/EnhancedProfileDisplay";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

const MyProfile = () => {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setFetching(false);
        setProfile(null);
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
        if (!data) {
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, [user]);

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

  if (!profile) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="text-gray-700 text-lg mb-2">
          Welcome! You don’t have a profile yet.
        </div>
        <a
          href="/profile"
          className="px-6 py-3 bg-dna-copper text-white rounded-xl font-bold shadow hover:bg-dna-forest transition"
        >
          Create Your Profile
        </a>
      </div>
    );
  }

  // When profile exists
  return <EnhancedProfileDisplay profile={profile} isOwnProfile={profile.id === user.id} onEdit={() => {}} onConnect={() => {}} />;
};

export default MyProfile;
