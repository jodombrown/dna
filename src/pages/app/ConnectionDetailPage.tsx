import * as React from "react";
import { useParams } from "react-router-dom";
import { useConnectionContext } from "@/hooks/useConnectionContext";
import CadenceChips from "@/components/connection/CadenceChips";
import IntentionPicker from "@/components/connection/IntentionPicker";
import NudgeCard from "@/components/adin/NudgeCard";

export default function ConnectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div>Connection not found.</div>;

  const ctx = useConnectionContext(id);

  React.useEffect(() => {
    document.title = `Connection | DNA`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage your connection cadence, intentions, and nudges.");
  }, []);

  if (ctx.loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Connection</h1>
        <div className="text-sm text-muted-foreground">Health: {ctx.health}/100</div>
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Cadence</h2>
        <CadenceChips value={ctx.preferences?.nudge_cadence ?? "standard"} onChange={ctx.setCadence} />
        <p className="text-xs text-muted-foreground">
          Quiet = minimal nudges. Standard = light monthly prompts. Builder = steady micro-actions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Intention</h2>
        <IntentionPicker onSubmit={ctx.setIntention} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Suggested next step</h2>
        {ctx.nextNudges.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nothing right now.</div>
        ) : (
          ctx.nextNudges.map((n) => (
            <NudgeCard
              key={n.id}
              nudge={n}
              onAccept={(id) => ctx.resolveNudge(id, "accepted")}
              onDismiss={(id) => ctx.resolveNudge(id, "dismissed")}
              onSnooze={(id, until) => ctx.resolveNudge(id, "snoozed", until)}
            />
          ))
        )}
      </section>
    </div>
  );
}
