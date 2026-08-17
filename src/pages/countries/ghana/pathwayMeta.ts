import type { PathwayId } from "@/content/ghana-content";

/**
 * Pathway navigation labels. Structural, not marketing copy: ghana-content.ts
 * carries no pathway metadata (labels/icons for the grid), so this derives
 * readable labels from the PathwayId union until the design handoff bundle
 * supplies the real ones.
 */
export const GHANA_PATHWAYS: { id: PathwayId; label: string }[] = [
  { id: "history", label: "History" },
  { id: "culture", label: "Culture" },
  { id: "news", label: "News" },
  { id: "government", label: "Government" },
  { id: "investment", label: "Investment" },
  { id: "real-estate", label: "Real Estate" },
  { id: "tourism", label: "Tourism" },
  { id: "relocation-citizenship", label: "Relocation & Citizenship" },
  { id: "education", label: "Education" },
  { id: "community", label: "Community" },
];

export function getPathwayLabel(id: string): string {
  return GHANA_PATHWAYS.find((p) => p.id === id)?.label ?? id;
}
