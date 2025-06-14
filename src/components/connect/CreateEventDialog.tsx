
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  setOpen: (state: boolean) => void;
  onCreated?: () => void;
};

type EventForm = {
  title: string;
  type: string;
  date_time: string;
  location: string;
  description: string;
  image: FileList;
  banner: FileList;
};

function getFileExtension(file: File) {
  return file.name.split('.').pop();
}

function getImagePath(userId: string, kind: "profile" | "banner", file?: File) {
  // Store under event-images/{userId}/events/{kind}.{ext}
  const ext = file ? getFileExtension(file) : "png";
  return `${userId}/events/${kind}.${ext}`;
}

export default function CreateEventDialog({ open, setOpen, onCreated }: Props) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState } = useForm<EventForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (values: EventForm) => {
    setLoading(true);
    setError(null);
    let image_url: string | null = null;
    let banner_url: string | null = null;

    try {
      // Upload profile image if present
      if (values.image && values.image[0] && user?.id) {
        setUploading(true);
        const file = values.image[0];
        const filePath = getImagePath(user.id, "profile", file);
        const { data, error: uploadErr } = await supabase.storage
          .from("event-images")
          .upload(filePath, file, { upsert: true, cacheControl: "3600" });
        setUploading(false);
        if (uploadErr) throw uploadErr;
        // Public bucket, use getPublicUrl for convenience
        const { publicUrl } = supabase.storage.from("event-images").getPublicUrl(filePath).data;
        image_url = publicUrl || null;
      }
      // Upload banner image if present
      if (values.banner && values.banner[0] && user?.id) {
        setUploading(true);
        const file = values.banner[0];
        const filePath = getImagePath(user.id, "banner", file);
        const { data, error: uploadErr } = await supabase.storage
          .from("event-images")
          .upload(filePath, file, { upsert: true, cacheControl: "3600" });
        setUploading(false);
        if (uploadErr) throw uploadErr;
        const { publicUrl } = supabase.storage.from("event-images").getPublicUrl(filePath).data;
        banner_url = publicUrl || null;
      }

      // Insert the event row
      const { error: eventError } = await supabase.from("events").insert([{
        created_by: user?.id,
        title: values.title,
        type: values.type,
        date_time: values.date_time,
        location: values.location,
        description: values.description,
        is_virtual: false,
        image_url,
        banner_url
      }]);
      setLoading(false);

      if (eventError) {
        setError(eventError.message || "Failed to create event.");
      } else {
        reset();
        setOpen(false);
        if (onCreated) onCreated();
      }
    } catch (e: any) {
      setError(e.message || "Error uploading event images.");
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            placeholder="Title"
            {...register("title", { required: true })}
          />
          <Input
            placeholder="Type (e.g. Conference, Meetup)"
            {...register("type", { required: true })}
          />
          <Input
            type="datetime-local"
            placeholder="Date & Time"
            {...register("date_time", { required: true })}
          />
          <Input
            placeholder="Location"
            {...register("location", { required: true })}
          />
          <Textarea
            placeholder="Description"
            {...register("description")}
          />
          {/* Event profile image */}
          <div>
            <label className="block mb-1 font-medium">Event Profile Image</label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              {...register("image")}
            />
          </div>
          {/* Event banner image */}
          <div>
            <label className="block mb-1 font-medium">Event Banner Image</label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              {...register("banner")}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading || uploading}>
              {(loading || uploading) ? "Creating..." : "Create"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
