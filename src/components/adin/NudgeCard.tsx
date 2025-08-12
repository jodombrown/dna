import React from "react";
import { Button } from "@/components/ui/button";

type Nudge = {
  id: string;
  nudge_type?: string;
  message?: string;
  [key: string]: any;
};

type Props = {
  nudge: Nudge;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (id: string, until: string) => void;
};

export default function NudgeCard({ nudge, onAccept, onDismiss, onSnooze }: Props) {
  const snooze30d = () => {
    const until = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    onSnooze(nudge.id, until);
  };

  return (
    <div className="border border-border rounded-xl p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{nudge.nudge_type}</div>
      <div className="mt-1 leading-relaxed">{nudge.message}</div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => onAccept(nudge.id)}>
          Do this
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDismiss(nudge.id)}>
          Not now
        </Button>
        <Button size="sm" variant="outline" onClick={snooze30d}>
          Snooze 30d
        </Button>
      </div>
    </div>
  );
}
