import type { PathwayId } from "@/content/ghana-content";

export interface PlaceholderArticle {
  id: string;
  headline: string;
  pathwayId: PathwayId;
  date: string;
}

/**
 * Placeholder story slots. No article data exists in ghana-content.ts yet;
 * this array is a stand-in for the real feed and is expected to be replaced
 * wholesale once that content lands. Single source, imported by both the
 * home carousel and the search overlay so there is never a second copy.
 */
export const PLACEHOLDER_ARTICLES: PlaceholderArticle[] = [
  { id: "1", headline: "This week in Ghana: business, policy, and community", pathwayId: "news", date: "Placeholder" },
  { id: "2", headline: "Region 17: what the Diaspora Affairs Office is working on", pathwayId: "government", date: "Placeholder" },
  { id: "3", headline: "Where diaspora capital is moving in Ghana", pathwayId: "investment", date: "Placeholder" },
  { id: "4", headline: "Sounds and stories out of Accra this month", pathwayId: "culture", date: "Placeholder" },
  { id: "5", headline: "Planning a homecoming trip: what to know before you go", pathwayId: "tourism", date: "Placeholder" },
  { id: "6", headline: "Land title verification: a diaspora buyer's checklist", pathwayId: "real-estate", date: "Placeholder" },
  { id: "7", headline: "DNA Ghana chapters: who's convening first", pathwayId: "community", date: "Placeholder" },
];
