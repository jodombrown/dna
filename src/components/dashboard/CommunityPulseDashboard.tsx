import { usePulseStore } from "@/stores/usePulseStore";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { useUserAchievements } from "@/stores/useUserAchievements";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Loader } from "@/components/ui/loader";
import { SeedDataManager } from "@/components/admin/SeedDataManager";
import { MilestoneBanner } from "./MilestoneBanner";
import { ScoreBreakdownCard } from "./ScoreBreakdownCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function CommunityPulseDashboard() {
  const { user } = useAuth();
  const { data, fetchPulseData, loading, error } = usePulseStore();
  const { setActiveView, activePillar } = useDashboard();
  const { checkMilestones } = useUserAchievements();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data: adminData } = await supabase.rpc('is_admin_user', { 
          _user_id: user.id 
        });
        setIsAdmin(adminData || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchPulseData(user.id);
  }, [user]);

  // Check for milestones when data changes
  useEffect(() => {
    if (data?.impactScore) {
      checkMilestones(data.impactScore);
    }
  }, [data?.impactScore, checkMilestones]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchPulseData(user.id);
    setRefreshing(false);
  }, [user?.id, fetchPulseData]);

  // Auto-refresh every 60 seconds in development/staging
  const isDev = import.meta.env.DEV;
  useAutoRefresh({
    enabled: isDev && !!user?.id,
    interval: 60000,
    onRefresh: () => fetchPulseData(user.id)
  });

  if (loading || !data) return <Loader label="Loading Community Pulse..." />;
  if (error) return <div className="text-red-500">Failed to load data: {error}</div>;

  return (
    <>
      <MilestoneBanner />
      <div className="px-6 py-8 space-y-6">
        <button
          onClick={() => setActiveView(activePillar as any)} 
          className="text-sm text-dna-copper underline hover:text-dna-forest mb-4"
        >
          ← Back to {activePillar.charAt(0).toUpperCase() + activePillar.slice(1)}
        </button>
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
        
        {/* Score Breakdown Panel */}
        <ScoreBreakdownCard />
      </section>
      </div>
    </>
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