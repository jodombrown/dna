import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";

const opts = [
  { key: "public", label: "Public" },
  { key: "connections", label: "Connections" },
  { key: "private", label: "Private" },
];

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const [visibility, setVisibility] = useState<any>({});

  useEffect(() => {
    if (profile) setVisibility((profile as any).visibility || {});
  }, [profile]);

  const setField = (field: string, value: string) => {
    setVisibility((v: any) => ({ ...v, [field]: value }));
  };

  const onSave = async () => {
    if (!user) return;
    await updateProfile({ id: user.id, updates: { visibility } });
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Privacy</h1>
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
      </div>
    </div>
  );
};

export default PrivacySettings;
