import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, Verified } from 'lucide-react';

interface VerifiedContributorBadgeProps {
  isVerified: boolean;
  impactType?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const VerifiedContributorBadge = ({ 
  isVerified, 
  impactType, 
  size = 'sm', 
  showTooltip = true,
  className = '' 
}: VerifiedContributorBadgeProps) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const badge = (
    <Badge 
      variant="outline"
      className={`
        bg-dna-gold/20 text-dna-gold border-dna-gold/40 
        hover:bg-dna-gold/30 transition-colors
        ${sizeClasses[size]} ${className}
      `}
    >
      <Crown className={`${iconSizes[size]} mr-1`} />
      Verified
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">Verified Contributor</p>
            <p className="text-xs text-gray-600">
              This user has been verified for meaningful contributions to African progress through the DNA platform.
            </p>
            {impactType && (
              <p className="text-xs text-dna-gold mt-1">
                Impact Area: {impactType.charAt(0).toUpperCase() + impactType.slice(1)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedContributorBadge;