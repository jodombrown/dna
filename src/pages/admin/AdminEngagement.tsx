import EngagementDashboard from '@/components/admin/EngagementDashboard';

export default function AdminEngagement() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Engagement Analytics</h1>
        <p className="text-muted-foreground">
          Monitor user activity, engagement metrics, and platform health
        </p>
      </div>
      <EngagementDashboard />
    </div>
  );
}
