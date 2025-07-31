import { usePulseStore } from "@/stores/usePulseStore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";
import { SeedDataManager } from "@/components/admin/SeedDataManager";
import { cn } from "@/lib/utils";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AdminRoute } from "@/components/auth/AdminRoute";

export default function CommunityPulseDashboard() {
  const { user, isAdmin } = useAuth();
  const { data, fetchPulseData, loading, error } = usePulseStore();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) fetchPulseData(user.id);
  }, [user]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchPulseData(user.id);
    setRefreshing(false);
  };

  if (loading || !data) return <Loader label="Loading Community Pulse..." />;
  if (error) return <div className="text-red-500">Failed to load data: {error}</div>;

  return (
    <AdminRoute>
      <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dna-forest">Community Pulse</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          {isAdmin && (
            <Collapsible open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Tools
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <Collapsible open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
          <CollapsibleContent>
            <SeedDataManager onDataReset={handleRefresh} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Platform Insights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dna-copper">Platform Insights</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <PulseCard title="Total Members" value={data.totalUsers} />
          <PulseCard title="Active This Week" value={data.activeUsersThisWeek} />
          <PulseCard title="Total Connections" value={data.totalConnections} />
          <PulseCard title="Total Posts" value={data.totalPosts} />
          <PulseCard title="Upcoming Events" value={data.totalEvents} />
          <PulseCard title="Engagement Rate" value={`${(data.engagementRate * 100).toFixed(1)}%`} />
        </div>
      </section>

      {/* Personal Impact */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dna-emerald">Your Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <PulseCard title="Your Connections" value={data.myConnections || 0} />
          <PulseCard title="Your Posts" value={data.myPosts || 0} />
          <PulseCard title="Communities Joined" value={data.myCommunities || 0} />
          <PulseCard title="Profile Views" value={data.myViews || 0} />
        </div>
        <div className="rounded-xl bg-dna-mint/10 p-4">
          <p className="text-sm text-dna-mint font-medium">Impact Score</p>
          <h3 className="text-3xl font-bold text-dna-mint">{data.impactScore ?? 0}</h3>
        </div>
      </section>
      </div>
    </AdminRoute>
  );
}

function PulseCard({ title, value }: { title: string; value: any }) {
  return (
    <div className={cn(
      "rounded-xl bg-white shadow p-4",
      "transition hover:shadow-lg"
    )}>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-xl font-bold text-dna-forest">{value}</h3>
    </div>
  );
}