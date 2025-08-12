import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SettingsNav from "./SettingsNav";

const ExperienceSettings: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();

  const [roles, setRoles] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    if (profile) {
      setRoles(((profile as any).roles || []).join(", "));
      setSkills(((profile as any).skills || []).join(", "));
    }
  }, [profile]);

  useEffect(() => {
    document.title = "Settings — Experience | DNA";
    const desc = "Manage your roles and skills settings on DNA.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  const onSave = async () => {
    if (!user) return;
    try {
      const updates: any = {
        roles: roles ? roles.split(/\s*,\s*/).filter(Boolean) : [],
        skills: skills ? skills.split(/\s*,\s*/).filter(Boolean) : [],
      };
      await updateProfile({ id: user.id, updates });
      toast({ title: "Saved", description: "Experience updated" });
      refetch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Experience</h1>
      <SettingsNav active="experience" />
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Roles (comma separated)</label>
          <Input value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Founder, Engineer" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Skills (comma separated)</label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Go-To-Market, React, Policy" />
        </div>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};

export default ExperienceSettings;
