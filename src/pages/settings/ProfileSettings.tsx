import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AvatarUploader from "@/components/uploader/AvatarUploader";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();

  const [avatar, setAvatar] = useState<string | undefined>();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [org, setOrg] = useState("");

  useEffect(() => {
    if (profile) {
      setAvatar(profile.avatar_url || undefined);
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setOrg((profile as any).company || "");
    }
  }, [profile]);

  const completion = useMemo(() => {
    let c = 0;
    if (avatar) c += 1;
    if (headline) c += 1;
    if (bio) c += 1;
    if (location) c += 1;
    if (org) c += 1;
    return Math.min(100, Math.round((c / 5) * 100));
  }, [avatar, headline, bio, location, org]);

  const onSave = async () => {
    if (!user) return;
    try {
      const updates: any = {
        avatar_url: avatar || null,
        headline,
        bio,
        location,
        company: org || null,
        onboarding_progress: { percent: completion },
      };
      await updateProfile({ id: user.id, updates });
      toast({ title: "Saved", description: "Profile updated" });
      refetch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Profile Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Avatar</label>
          <div className="mt-2"><AvatarUploader value={avatar} onUploaded={setAvatar} /></div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Headline</label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="What do you do?" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Bio</label>
          <textarea className="w-full border border-input rounded-md p-3 text-sm" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Location</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Organization</label>
          <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Company / Org" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Onboarding completion</span>
          <span className="text-sm font-medium">{completion}%</span>
        </div>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
