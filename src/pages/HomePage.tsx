import React from "react";
import { createHomePageAdapter } from "@/features/home/Home";
import useRoleBasedAccess from "@/hooks/useRoleBasedAccess";
import type { FeedMode, Pillar } from "@/features/home/Home";

// Simple mock data for now to avoid dependency issues
const useMockCollaborations = () => ({
  recommended_people: [
    { id: "m1", full_name: "Fatima A.", title: "ClimateTech Founder", skills: ["climate", "energy"] },
    { id: "m2", full_name: "Kwame B.", title: "Fintech Product Lead", skills: ["fintech", "payments"] },
  ],
  items: [
    { id: "o1", title: "Kigali AgriTech Pilot", owner_name: "AgriLab", tags: ["agritech", "pilot"] },
  ],
  insights: [
    "Fintech founders in ECOWAS saw a 14% increase in cross-border pilots last quarter.",
    "SME digitization grants closing in 2 weeks.",
  ],
});

// Simple mock posts to avoid import issues
const useMockPaginatedPosts = ({ mode, pillar, resetKey }: {
  mode: FeedMode;
  pillar: Pillar;
  resetKey?: string;
}) => {
  return {
    posts: [
      {
        id: "p1",
        created_at: new Date().toISOString(),
        pillar: "connect" as const,
        content: "Welcome to DNA! Share your first update and connect with the community.",
        author: { id: "a1", name: "DNA Team", avatar_url: "" },
        likes_count: 3,
        comments_count: 1,
      },
      {
        id: "p2", 
        created_at: new Date(Date.now() - 3600000).toISOString(),
        pillar: "collaborate" as const,
        content: "Looking for collaborators on a new AgriTech project in Kenya. Let's build something impactful together!",
        author: { id: "a2", name: "Kwame Asante", avatar_url: "", headline: "AgriTech Founder" },
        likes_count: 8,
        comments_count: 3,
      },
    ],
    isLoading: false,
    hasMore: false,
    loadMore: () => {},
    reset: () => {},
    refetch: () => {}
  };
};

const Page = createHomePageAdapter({
  useRoleBasedAccess,
  usePaginatedPosts: useMockPaginatedPosts,
  useLiveCollaborations: useMockCollaborations,
});

export default function HomePage() {
  return <Page />;
}