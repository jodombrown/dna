import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import SettingsNav from "./SettingsNav";

const opts = [
  { key: "public", label: "Public" },
  { key: "connections", label: "Connections" },
  { key: "private", label: "Private" },
];

const PrivacySettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const [visibility, setVisibility] = useState<any>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) setVisibility((profile as any).visibility || {});
  }, [profile]);

  useEffect(() => {
    document.title = "Settings — Privacy | DNA";
    const desc = "Control who can see your info: public, connections, or private.";
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

  const setField = (field: string, value: string) => {
    setVisibility((v: any) => ({ ...v, [field]: value }));
  };

  const onSave = async () => {
    if (!user) return;
    await updateProfile({ id: user.id, updates: { visibility } as any });
    refetch();
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account failed:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Privacy</h1>
      <SettingsNav active="privacy" />
      <p className="text-sm text-muted-foreground">Choose who can see each field. Public = visible to all; Connections = people you connect with; Private = only you.</p>
      <div className="space-y-4">
        {[
          { key: "location", label: "Location" },
          { key: "links", label: "Links" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ].map((f) => (
          <div key={f.key} className="flex items-center justify-between">
            <span className="text-sm">{f.label}</span>
            <select
              value={visibility?.[f.key] || "public"}
              onChange={(e) => setField(f.key, e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {opts.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
        <Button onClick={onSave}>Save</Button>

        <hr className="my-6" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Danger zone</h2>
          <p className="text-sm text-muted-foreground">Permanently delete your account and data.</p>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </div>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleConfirmDelete}
          title="Delete account"
          description="This will permanently delete your account and data. This action cannot be undone."
          confirmText={isDeleting ? 'Deleting…' : 'Delete'}
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default PrivacySettings;
