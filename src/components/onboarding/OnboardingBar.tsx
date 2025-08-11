import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LocationSearch from "./LocationSearch";
import AvatarUploader from "@/components/uploader/AvatarUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const usernameRegex = /^[a-z0-9._-]{3,30}$/;

const requiredSatisfied = (p: any) => {
  if (!p) return false;
  return Boolean(
    p.first_name && p.last_name && p.username && p.location && p.avatar_url
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
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const show = useMemo(() => {
    if (!open) return false;
    return !requiredSatisfied(profile);
  }, [open, profile]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setMiddleInitial(profile.middle_initial || "");
      setLastName(profile.last_name || "");
      setUsername((profile.username as string) || "");
      setLocation(profile.location || "");
      setAvatar(profile.avatar_url || undefined);
    }
  }, [profile]);

  if (!user || !show) return null;

  const checkUsername = async (val: string) => {
    const v = val.toLowerCase();
    if (!usernameRegex.test(v)) {
      setUsernameError("3–30 chars; lowercase letters, numbers, . _ -");
      return false;
    }
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", v)
        .neq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setUsernameError("Username already taken");
        return false;
      }
      setUsernameError(null);
      return true;
    } catch (e: any) {
      setUsernameError(e.message || "Check failed");
      return false;
    } finally {
      setChecking(false);
    }
  };

  const onSave = async () => {
    const ok = await checkUsername(username);
    if (!ok) return;
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
        username: username.toLowerCase(),
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
      <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Finish these quick steps to personalize your profile</h3>
          <p className="text-sm text-muted-foreground">Required: name, username, location, photo</p>
        </div>
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" aria-label="First name" />
          <Input value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value.slice(0,1).toUpperCase())} placeholder="M" aria-label="Middle initial" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" aria-label="Last name" />
          <div className="space-y-1">
            <Input
              value={username}
              onChange={(e) => { const v = e.target.value.toLowerCase(); setUsername(v); }}
              onBlur={() => checkUsername(username)}
              placeholder="username"
              aria-label="Username"
            />
            {usernameError && <div className="text-xs text-destructive">{usernameError}</div>}
          </div>
          <LocationSearch value={location} onChange={setLocation} placeholder="Current location" />
          <AvatarUploader value={avatar} onUploaded={(url) => setAvatar(url)} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onSave} disabled={saving || checking}>
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
          <a href="/settings/profile" className="text-sm text-primary underline">Edit full profile in Settings</a>
        </div>
      </div>
    </Card>
  );
};

export default OnboardingBar;
