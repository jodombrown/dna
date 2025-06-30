
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  ip_address: unknown | null;
  user_agent: string | null;
  created_at: string;
}

export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAuditLogs = async (limit = 50) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: string,
    targetType: string,
    targetId?: string,
    details: any = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for audit log');
        return;
      }

      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          admin_user_id: user.id,
          ip_address: null, // Could be enhanced to capture real IP
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      
      // Refresh the audit logs to show the new entry
      await fetchAuditLogs();
      
      console.log(`Audit log created: ${action} on ${targetType}`);
    } catch (err: any) {
      console.error('Error logging action:', err);
      toast({
        title: "Audit Log Error",
        description: "Failed to log admin action",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
    logAction
  };
};
