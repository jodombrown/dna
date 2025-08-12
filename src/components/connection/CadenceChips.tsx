import React from "react";
import { Button } from "@/components/ui/button";

export type CadenceKey = "quiet" | "standard" | "builder";

type Props = {
  value?: CadenceKey;
  onChange: (v: CadenceKey) => void;
  disabled?: boolean;
};

const OPTIONS: { key: CadenceKey; label: string }[] = [
  { key: "quiet", label: "Quiet" },
  { key: "standard", label: "Standard" },
  { key: "builder", label: "Builder" },
];

export default function CadenceChips({ value = "standard", onChange, disabled }: Props) {
  const current = value ?? "standard";

  return (
    <div className="flex gap-2" role="group" aria-label="Nudge cadence">
      {OPTIONS.map((o) => {
        const selected = current === o.key;
        return (
          <Button
            key={o.key}
            type="button"
            variant={selected ? "secondary" : "outline"}
            size="sm"
            disabled={disabled}
            aria-pressed={selected}
            data-selected={selected}
            className="rounded-full"
            onClick={() => {
              if (!disabled && !selected) onChange(o.key);
            }}
          >
            {o.label}
          </Button>
        );
      })}
    </div>
  );
}
