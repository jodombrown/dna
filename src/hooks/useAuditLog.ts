
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
  ip_address: string | null;
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
      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error logging action:', err);
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
