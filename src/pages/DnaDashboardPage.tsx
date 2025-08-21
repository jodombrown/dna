import React from "react";
import { createDashboardPageAdapter } from "@/components/dashboard/DnaDashboard";
import usePaginatedPosts from "@/hooks/usePaginatedPosts";
import useLiveCollaborations from "@/hooks/useLiveCollaborations";
import useRoleBasedAccess from "@/hooks/useRoleBasedAccess";
import EnhancedDashboard from "@/components/dashboard/EnhancedDashboard";
import BetaAccessGate from "@/components/auth/BetaAccessGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = createDashboardPageAdapter({
  usePaginatedPosts,
  useLiveCollaborations,
  useRoleBasedAccess,
});

export default function Page() {
  return (
    <BetaAccessGate>
      <div className="max-w-7xl mx-auto px-4">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <EnhancedDashboard />
          </TabsContent>

          <TabsContent value="feed">
            <DashboardPage />
          </TabsContent>
        </Tabs>
      </div>
    </BetaAccessGate>
  );
}