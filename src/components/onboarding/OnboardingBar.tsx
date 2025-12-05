import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LocationTypeahead from "@/components/location/LocationTypeahead";
import AvatarUploader from "@/components/uploader/AvatarUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { USERNAME_REGEX as usernameRegex, isValidUsername, isUsernameAvailable, normalizeUsername } from "@/utils/username";

const requiredSatisfied = (p: any) => {
  if (!p) return false;
  return Boolean(
    p.full_name && (p.current_country || p.location) && p.avatar_url
  );
};

const OnboardingBar: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { toast } = useToast();

  const [open, setOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const show = useMemo(() => {
    if (!open) return false;
    return !requiredSatisfied(profile);
  }, [open, profile]);

  const isValid = useMemo(() => {
    return Boolean(firstName && lastName && location && avatar);
  }, [firstName, lastName, location, avatar]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setMiddleInitial(profile.middle_initial || "");
      setLastName(profile.last_name || "");
      setLocation(profile.location || "");
      setAvatar(profile.avatar_url || undefined);
    }
  }, [profile]);

  if (!user || !show) return null;

  const onSave = async () => {
    if (!firstName || !lastName || !location || !avatar) {
      toast({ title: "Missing fields", description: "Please complete all required fields." });
      return;
    }

    setSaving(true);
    try {
      const display = `${firstName}${middleInitial ? ` ${middleInitial.toUpperCase()}.` : ""} ${lastName}`;
      const updates: any = {
        first_name: firstName,
        middle_initial: middleInitial ? middleInitial[0].toUpperCase() : null,
        last_name: lastName,
        full_name: display,
        location,
        avatar_url: avatar,
      };
      if (!profile?.display_name) updates.display_name = display;
      const existingPercentRaw = (profile as any)?.onboarding_progress;
      const existingPercent =
        typeof existingPercentRaw === 'string'
          ? (() => { try { return JSON.parse(existingPercentRaw)?.percent ?? 0; } catch { return 0; } })()
          : typeof existingPercentRaw === 'object' && existingPercentRaw !== null
          ? (existingPercentRaw as any)?.percent ?? 0
          : 0;
      const percent = Math.max(40, Number(existingPercent || 0));
      updates.onboarding_progress = { percent };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;

      toast({ title: "Saved", description: "Welcome to DNA. You’re all set!" });
      setOpen(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 border border-border shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-semibold text-foreground">Complete your profile</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Name, location & photo required</p>
        </div>
        
        {/* Form Fields - stacked on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" aria-label="First name" className="w-full" />
          <Input value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value.slice(0,1).toUpperCase())} placeholder="M" aria-label="Middle initial" className="w-full sm:w-16 lg:w-full" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" aria-label="Last name" className="w-full" />
          <LocationTypeahead value={location} onChange={setLocation} />
          <AvatarUploader value={avatar} onUploaded={(url) => setAvatar(url)} />
        </div>
        
        {/* Actions - stacked on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button onClick={onSave} disabled={saving || !isValid} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
          <a href="/dna/feed" className="text-sm text-primary underline text-center sm:text-left">Skip for now</a>
        </div>
      </div>
    </Card>
  );
};

export default OnboardingBar;
