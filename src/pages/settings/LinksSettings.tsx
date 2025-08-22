import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SettingsNav from "./SettingsNav";

const LinksSettings: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();

  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    if (profile) {
      const links = (profile as any).links || {};
      setWebsite(links.website || "");
      setTwitter(links.twitter || "");
      setLinkedin(profile.linkedin_url || links.linkedin || "");
    }
  }, [profile]);

  useEffect(() => {
    document.title = "Settings — Links | DNA";
    const desc = "Manage your website and social links on DNA.";
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
        links: { website, twitter, linkedin },
        linkedin_url: linkedin || null,
      };
      await updateProfile({ id: user.id, updates });
      toast({ title: "Saved", description: "Links updated" });
      refetch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message || "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Links</h1>
      <SettingsNav active="links" />
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Website</label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Twitter/X</label>
          <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/you" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">LinkedIn</label>
          <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/you" />
        </div>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};

export default LinksSettings;
