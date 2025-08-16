import { useMemo } from "react";

export default function useInsights(profile?: {
  full_name?: string;
  impact_score?: number;
  profile_completion?: number;
  skills?: string[];
}) {
  return useMemo(() => {
    if (!profile) return [];
    const insights = [
      `Welcome back${profile.full_name ? `, ${profile.full_name}` : ""}.`,
      `Impact score: ${Math.round(profile.impact_score ?? 0)}`,
      `Profile completion: ${Math.min(100, Math.max(0, profile.profile_completion ?? 0))}%`,
    ];
    if ((profile as any)?.skills?.length) {
      insights.push(`Rising skill: ${(profile as any).skills[0]}`);
    }
    return insights;
  }, [profile]);
}