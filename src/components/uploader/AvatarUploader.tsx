import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploaderProps {
  value?: string;
  onUploaded: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ value, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "Too large", description: "Max size is 5MB.", variant: "destructive" });
      return;
    }

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      toast({ title: "Not signed in", description: "Please sign in to upload." });
      return;
    }

    setUploading(true);
    try {
      const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `user-avatars/${uid}/${Date.now()}_${clean}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;
      onUploaded(url);
      toast({ title: "Uploaded", description: "Profile photo updated." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload failed", description: err.message || "Try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <img
        src={value || "/placeholder.svg"}
        alt="Profile photo preview"
        className="w-12 h-12 rounded-full object-cover border border-border"
        loading="lazy"
      />
      <label className="inline-flex items-center px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-muted">
        {uploading ? "Uploading..." : "Choose photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default AvatarUploader;
