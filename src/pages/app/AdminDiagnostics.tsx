import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1 text-sm">
      <div className="text-muted-foreground pr-4">{label}</div>
      <div className="text-right break-all">{value}</div>
    </div>
  );
}

export default function AdminDiagnostics() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [probes, setProbes] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('rpc_health_snapshot');
    if (error) { setError(error.message); setLoading(false); return; }
    setSnapshot(data);
    setLoading(false);
  };

  const runProbes = async () => {
    const results: any = {};
    // Probe 1: realtime subscribe to tasks table (should not error)
    try {
      const ch = supabase
        .channel('diag:tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {})
        .subscribe(status => {
          // no-op; presence indicates ok
        });
      results.realtime_tasks_subscribed = true;
      // Immediately cleanup to avoid leaks
      setTimeout(() => supabase.removeChannel(ch), 1000);
    } catch (e: any) {
      results.realtime_tasks_subscribed = false;
      results.realtime_error = String(e?.message || e);
    }

    // Probe 2: can current user read own notifications (RLS)
    try {
      const r = await supabase.from('notifications').select('id').limit(1);
      results.notifications_select_allowed = !r.error;
      if (r.error) results.notifications_select_error = r.error.message;
    } catch (e: any) {
      results.notifications_select_allowed = false;
      results.notifications_select_error = String(e?.message || e);
    }

    // Probe 3: can call a SAFE RPC (public profile) for a non-existing username
    try {
      const r = await supabase.rpc('rpc_public_profile_bundle', { p_username: '___no_user___' });
      results.public_profile_rpc_ok = !r.error;
      if (r.error) results.public_profile_rpc_error = r.error.message;
    } catch (e: any) {
      results.public_profile_rpc_ok = false;
      results.public_profile_rpc_error = String(e?.message || e);
    }

    // Probe 4: check policies client-side for multiple permissive inserts on notifications (from snapshot)
    const multi = snapshot?.warnings?.notifications_multiple_permissive_insert ?? false;
    results.notifications_multiple_permissive_insert = multi;

    setProbes(results);
  };

  useEffect(() => { document.title = 'Admin Diagnostics | DNA'; load(); }, []);
  useEffect(() => { if (snapshot) runProbes(); }, [snapshot]);

  const tables = useMemo(() => snapshot?.tables || [], [snapshot]);
  const triggers = useMemo(() => snapshot?.triggers || [], [snapshot]);
  const functions = useMemo(() => snapshot?.functions || [], [snapshot]);
  const grants = useMemo(() => snapshot?.grants_exec_to_anon_or_auth || [], [snapshot]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="font-semibold mb-2">Summary</div>
                <Row label="Generated at" value={new Date(snapshot.generated_at).toLocaleString()} />
                <Row label="Tables without RLS" value={snapshot.warnings.some_tables_without_rls ? 'Yes' : 'No'} />
                <Row label="Notifications has multiple permissive INSERT policies" value={snapshot.warnings.notifications_multiple_permissive_insert ? 'Yes' : 'No'} />
              </div>

              <div>
                <div className="font-semibold mb-2">Tables</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {tables.map((t: any) => (
                    <div key={t.name} className="p-3 border rounded text-sm">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">exists: {String(t.exists)} | rls: {String(t.rls)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Functions (selected)</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {functions.map((f: any) => (
                    <div key={f.name} className="p-3 border rounded text-sm">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">security_definer: {String(f.security_definer)} | volatility: {f.volatile}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Triggers (expected)</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {triggers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No expected triggers found.</div>
                  ) : triggers.map((tr: any, i: number) => (
                    <div key={`${tr.table}-${tr.trigger}-${i}`} className="p-3 border rounded text-sm">
                      <div className="font-medium">{tr.trigger}</div>
                      <div className="text-xs text-muted-foreground">table: {tr.table} | enabled: {String(tr.enabled)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Potentially risky function EXECUTE grants</div>
                {grants.length === 0 ? (
                  <div className="text-sm text-muted-foreground">None detected for anon/authenticated.</div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {grants.map((g: any, i: number) => (
                      <div key={i} className="p-2 border rounded">{g.function} → {g.grantee} ({g.privilege})</div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="font-semibold mb-2">Client live probes</div>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 border rounded">Realtime tasks subscription: {probes.realtime_tasks_subscribed ? 'OK' : 'Fail'}</div>
                  <div className="p-3 border rounded">Notifications select allowed: {probes.notifications_select_allowed ? 'OK' : 'Fail'}{probes.notifications_select_error ? ` (${probes.notifications_select_error})` : ''}</div>
                  <div className="p-3 border rounded">Public profile RPC: {probes.public_profile_rpc_ok ? 'OK' : 'Fail'}{probes.public_profile_rpc_error ? ` (${probes.public_profile_rpc_error})` : ''}</div>
                  <div className="p-3 border rounded">Notifications multiple permissive insert: {probes.notifications_multiple_permissive_insert ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={load}>Refresh</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}