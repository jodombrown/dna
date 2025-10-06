import SignalAnalyticsDashboard from '@/components/admin/SignalAnalyticsDashboard';

export default function AdminSignals() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Signal Analytics</h1>
        <p className="text-muted-foreground">
          Analyze ADIN signals, connection health, and user behavior patterns
        </p>
      </div>
      <SignalAnalyticsDashboard />
    </div>
  );
}
