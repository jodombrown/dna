
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  User, 
  FileText, 
  Calendar,
  Shield,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { formatDistanceToNow } from 'date-fns';

const AuditLogViewer: React.FC = () => {
  const { auditLogs, loading } = useAuditLog();

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'update':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <X className="w-4 h-4 text-red-600" />;
      case 'suspend':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      suspend: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[action.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {action}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading audit logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-sm font-medium">{log.target_type}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Admin performed {log.action.toLowerCase()} on {log.target_type}
                    {log.target_id && ` (ID: ${log.target_id.substring(0, 8)}...)`}
                  </p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-800">View details</summary>
                      <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No audit logs found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
