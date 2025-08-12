import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const TYPES = [
  { key: "get_acquainted", label: "Get acquainted" },
  { key: "knowledge_exchange", label: "Knowledge exchange" },
  { key: "mentor", label: "Mentorship" },
  { key: "partner_explore", label: "Explore partnership" },
  { key: "co-build", label: "Co-build" },
  { key: "investor_interest", label: "Investor interest" },
  { key: "other", label: "Other" },
] as const;

type Visibility = "shared" | "private";

export default function IntentionPicker({
  onSubmit,
}: {
  onSubmit: (v: { type: string; notes?: string; visibility?: Visibility }) => void;
}) {
  const [type, setType] = useState<string>("get_acquainted");
  const [notes, setNotes] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("shared");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="intention-type">Why are we connecting?</Label>
        <Select value={type} onValueChange={(v) => setType(v)}>
          <SelectTrigger id="intention-type" className="w-full">
            <SelectValue placeholder="Choose intention" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intention-notes">Notes</Label>
        <Textarea
          id="intention-notes"
          placeholder="Add context or a goal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="intention-visibility" className="text-sm">
          Visibility
        </Label>
        <Select value={visibility} onValueChange={(v: Visibility) => setVisibility(v)}>
          <SelectTrigger id="intention-visibility" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shared">Shared</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={() => onSubmit({ type, notes, visibility })}>
        Save intention
      </Button>
    </div>
  );
}
