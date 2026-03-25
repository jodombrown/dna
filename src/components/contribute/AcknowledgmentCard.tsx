import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContributionAcknowledgment } from '@/types/applicationTypes';

interface AcknowledgmentCardProps {
  acknowledgment: ContributionAcknowledgment;
}

export function AcknowledgmentCard({ acknowledgment }: AcknowledgmentCardProps) {
  const initials = (acknowledgment.from_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={acknowledgment.from_avatar || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {acknowledgment.from_username ? (
              <Link to={`/dna/connect/profile/${acknowledgment.from_username}`} className="hover:text-primary">
                {acknowledgment.from_name}
              </Link>
            ) : (
              acknowledgment.from_name
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(acknowledgment.created_at).toLocaleDateString()}
          </p>
        </div>

        {acknowledgment.rating && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= acknowledgment.rating! ? 'fill-[#B87333] text-[#B87333]' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-foreground">{acknowledgment.message}</p>

      {acknowledgment.opportunity_title && (
        <p className="text-xs text-muted-foreground">
          For: {acknowledgment.opportunity_title}
        </p>
      )}
    </div>
  );
}
