import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, Users, Clock, Key, Package, Target } from 'lucide-react';
import type { ContributionNeedType } from '@/types/contributeTypes';

// Icon mapping for contribution types
const typeIcons: Record<ContributionNeedType, React.ElementType> = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

// Colors for match score badges
function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

interface DiaOpportunityCardProps {
  id: string;
  title: string;
  type: ContributionNeedType;
  spaceName?: string;
  region?: string;
  focusAreas?: string[];
  relevance?: string;
  matchScore?: number;
  compact?: boolean;
}

export default function DiaOpportunityCard({
  id,
  title,
  type,
  spaceName,
  region,
  focusAreas,
  relevance,
  matchScore,
  compact = false,
}: DiaOpportunityCardProps) {
  const navigate = useNavigate();
  const Icon = typeIcons[type] || Target;

  const handleClick = () => {
    navigate(`/dna/contribute/needs/${id}`);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm flex items-center gap-1 truncate">
              {title}
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </p>
            {spaceName && (
              <p className="text-xs text-muted-foreground truncate">{spaceName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {matchScore !== undefined && (
            <Badge className={`${getMatchScoreColor(matchScore)} border-0 text-xs`}>
              {matchScore}%
            </Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {type}
          </Badge>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer text-left group h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {type}
          </Badge>
        </div>
        {matchScore !== undefined && (
          <Badge className={`${getMatchScoreColor(matchScore)} border-0 text-xs font-medium`}>
            {matchScore}% match
          </Badge>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
        {title}
        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </h4>

      {/* Space name */}
      {spaceName && (
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{spaceName}</p>
      )}

      {/* Focus areas / Region */}
      <div className="flex flex-wrap gap-1 mt-auto">
        {region && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            {region}
          </Badge>
        )}
        {focusAreas?.slice(0, 2).map((area, idx) => (
          <Badge key={idx} variant="secondary" className="text-[10px] font-normal">
            {area}
          </Badge>
        ))}
      </div>

      {/* Relevance */}
      {relevance && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{relevance}</p>
      )}
    </button>
  );
}
