import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import { Badge } from '@/components/ui/badge';
import type { FulfillmentStatus } from '@/types/applicationTypes';
import { CheckCircle, Clock, Send, RotateCcw, AlertTriangle } from 'lucide-react';

interface FulfillmentBannerProps {
  opportunityId: string;
}

const bannerConfig: Record<FulfillmentStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  in_progress: { label: 'Contribution in progress -- deliver your work', icon: Clock, className: 'bg-[#B87333]/10 border-[#B87333]/30 text-[#B87333]' },
  submitted: { label: 'Delivery submitted -- awaiting review', icon: Send, className: 'bg-amber-50 border-amber-300 text-amber-800' },
  revision_requested: { label: 'Revision requested', icon: RotateCcw, className: 'bg-amber-50 border-amber-300 text-amber-800' },
  completed: { label: 'Contribution complete', icon: CheckCircle, className: 'bg-[#4A8D77]/10 border-[#4A8D77]/30 text-[#4A8D77]' },
  cancelled: { label: 'Contribution cancelled', icon: AlertTriangle, className: 'bg-destructive/10 border-destructive/30 text-destructive' },
};

export function FulfillmentBanner({ opportunityId }: FulfillmentBannerProps) {
  const { data: fulfillment, isLoading } = useQuery({
    queryKey: ['fulfillment-for-opp', opportunityId],
    queryFn: () => contributeApplicationService.getFulfillmentForOpportunity(opportunityId),
  });

  if (isLoading || !fulfillment) return null;

  const config = bannerConfig[fulfillment.status];
  const Icon = config.icon;

  return (
    <Link to={`/dna/contribute/fulfillment/${fulfillment.id}`}>
      <div className={`px-4 py-3 rounded-lg border flex items-center gap-3 hover:opacity-90 transition-opacity ${config.className}`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-current">
              Active Contribution
            </Badge>
          </div>
          <p className="text-sm font-medium mt-0.5">{config.label}</p>
        </div>
        <span className="text-xs underline flex-shrink-0">View Fulfillment</span>
      </div>
    </Link>
  );
}
