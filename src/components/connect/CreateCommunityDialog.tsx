
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
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

type FormFields = {
  name: string;
  category: string;
  description: string;
};

export default function CreateCommunityDialog({ open, setOpen, onCreated }: Props) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState } = useForm<FormFields>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormFields) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("communities").insert([{
      created_by: user?.id,
      name: values.name,
      category: values.category,
      description: values.description,
    }]);
    setLoading(false);
    if (error) {
      setError(error.message || "Failed to create community.");
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
          <DialogTitle>Create Community / Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            placeholder="Community/Group Name"
            {...register("name", { required: true })}
          />
          <Input
            placeholder="Category (e.g. Youth, Tech, Nigerians in Germany)"
            {...register("category", { required: true })}
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
