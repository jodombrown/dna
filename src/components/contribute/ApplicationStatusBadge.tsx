import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/types/applicationTypes';

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground border-border' },
  shortlisted: { label: 'Shortlisted', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Not Selected', className: 'bg-red-100 text-red-800 border-red-300' },
  withdrawn: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground border-border' },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
