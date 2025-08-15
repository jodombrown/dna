import React from "react";
import { createDashboardPageAdapter } from "@/components/dashboard/DnaDashboard";
import usePaginatedPosts from "@/hooks/usePaginatedPosts";
import useLiveCollaborations from "@/hooks/useLiveCollaborations";
import useRoleBasedAccess from "@/hooks/useRoleBasedAccess";

const DashboardPage = createDashboardPageAdapter({
  usePaginatedPosts,
  useLiveCollaborations,
  useRoleBasedAccess,
});

export default function Page() {
  return <DashboardPage />;
}