
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
};

export default function CreateEventDialog({ open, setOpen, onCreated }: Props) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState } = useForm<EventForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: EventForm) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("events").insert([{
      created_by: user?.id,
      title: values.title,
      type: values.type,
      date_time: values.date_time,
      location: values.location,
      description: values.description,
      is_virtual: false
    }]);
    setLoading(false);
    if (error) {
      setError(error.message || "Failed to create event.");
    } else {
      reset();
      setOpen(false);
      if (onCreated) onCreated();
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
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
