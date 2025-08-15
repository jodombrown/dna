import React from "react";
import { createHomePageAdapter } from "@/features/home/Home";
import useLiveCollaborations from "@/hooks/useLiveCollaborations";
import useRoleBasedAccess from "@/hooks/useRoleBasedAccess";
import type { FeedMode, Pillar } from "@/features/home/Home";
// optional:
// import useLiveEvents from "@/hooks/useLiveEvents";
// import { createPost } from "@/lib/posts"; // if you have a poster

// Bridge adapter for usePaginatedPosts hook compatibility
const usePaginatedPostsAdapter = ({ mode, pillar, resetKey }: {
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
        content: "Welcome to DNA! Share your first update.",
        author: { id: "a1", name: "DNA Team", avatar_url: "" },
        likes_count: 3,
        comments_count: 1,
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
  usePaginatedPosts: usePaginatedPostsAdapter,
  useLiveCollaborations,
  // useLiveEvents,
  // onCreatePost: async ({ text, pillar, file }) => { ... }
});

export default function HomePage() {
  return <Page />;
}