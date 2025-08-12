import React from "react";
import { useConnectionContext } from "@/hooks/useConnectionContext";
import IntentionPicker from "@/components/connection/IntentionPicker";
import CadenceChips from "@/components/connection/CadenceChips";
import NudgeCard from "@/components/adin/NudgeCard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

export default function ConnectionDetail({ connectionId }: { connectionId: string }) {
  const ctx = useConnectionContext(connectionId);
  const { toast } = useToast();

  if (ctx.loading)
    return (
      <div className="py-10 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connection</h2>
        <div className="text-sm text-muted-foreground">Health: {ctx.health}/100</div>
      </div>

      <section className="space-y-2">
        <h3 className="font-medium">Cadence</h3>
        <CadenceChips
          value={(ctx.preferences?.nudge_cadence as any) ?? "standard"}
          onChange={async (val) => {
            try {
              await ctx.setCadence(val as any);
              toast({ title: "Cadence updated", description: `Now set to ${val}.` });
            } catch (e: any) {
              toast({ title: "Failed to update cadence", description: e?.message ?? "Please try again", variant: "destructive" });
            }
          }}
        />
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">Intention</h3>
        <IntentionPicker
          onSubmit={async (v) => {
            try {
              await ctx.setIntention(v);
              toast({ title: "Intention saved", description: "Your connection intention was recorded." });
            } catch (e: any) {
              toast({ title: "Failed to save intention", description: e?.message ?? "Please try again", variant: "destructive" });
            }
          }}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Suggested next step</h3>
        {ctx.nextNudges.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nothing right now.</div>
        ) : (
          ctx.nextNudges.map((n) => (
            <NudgeCard
              key={n.id}
              nudge={n}
              onAccept={async (id) => {
                try {
                  await ctx.resolveNudge(id, "accepted");
                  toast({ title: "Great – done!", description: "Marked as completed." });
                } catch (e: any) {
                  toast({ title: "Action failed", description: e?.message ?? "Please try again", variant: "destructive" });
                }
              }}
              onDismiss={async (id) => {
                try {
                  await ctx.resolveNudge(id, "dismissed");
                  toast({ title: "Dismissed", description: "We’ll suggest something else later." });
                } catch (e: any) {
                  toast({ title: "Action failed", description: e?.message ?? "Please try again", variant: "destructive" });
                }
              }}
              onSnooze={async (id, until) => {
                try {
                  await ctx.resolveNudge(id, "snoozed", until);
                  toast({ title: "Snoozed", description: "We’ll remind you later." });
                } catch (e: any) {
                  toast({ title: "Action failed", description: e?.message ?? "Please try again", variant: "destructive" });
                }
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
