import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  Palette,
  Newspaper,
  Building2,
  TrendingUp,
  Home,
  Compass,
  Plane,
  GraduationCap,
  Users,
} from "lucide-react";
import type { PathwayId } from "@/content/ghana-content";

/**
 * Pathway navigation labels. Structural, not marketing copy: ghana-content.ts
 * carries no pathway metadata (labels/icons/descriptions for the grid), so
 * this derives readable labels from the PathwayId union until the design
 * handoff bundle supplies the real ones.
 */
export const GHANA_PATHWAYS: {
  id: PathwayId;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "history",
    label: "History",
    description: "From sovereign kingdoms to Region 17.",
    icon: Landmark,
  },
  {
    id: "culture",
    label: "Culture",
    description: "Language, chieftaincy, food, and what's playing now.",
    icon: Palette,
  },
  {
    id: "news",
    label: "News",
    description: "Business, policy, and community, briefed and sourced.",
    icon: Newspaper,
  },
  {
    id: "government",
    label: "Government",
    description: "How Ghana is governed, and how to reach it.",
    icon: Building2,
  },
  {
    id: "investment",
    label: "Investment",
    description: "Where capital is invited, and the risk named plainly.",
    icon: TrendingUp,
  },
  {
    id: "real-estate",
    label: "Real Estate",
    description: "Verify the title before any money moves.",
    icon: Home,
  },
  {
    id: "tourism",
    label: "Tourism",
    description: "The pilgrimage first, a great trip second.",
    icon: Compass,
  },
  {
    id: "relocation-citizenship",
    label: "Relocation & Citizenship",
    description: "Dual citizenship, Right of Abode, and moving with family.",
    icon: Plane,
  },
  {
    id: "education",
    label: "Education",
    description: "Mentor, teach, and exchange in both directions.",
    icon: GraduationCap,
  },
  {
    id: "community",
    label: "Community",
    description: "Members, chapters, and leaders, from the founding moment.",
    icon: Users,
  },
];

export function getPathwayLabel(id: string): string {
  return GHANA_PATHWAYS.find((p) => p.id === id)?.label ?? id;
}
