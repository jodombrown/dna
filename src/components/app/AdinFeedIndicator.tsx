import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingUp } from 'lucide-react';

interface AdinFeedIndicatorProps {
  isActive: boolean;
  score?: number;
  signals?: string[];
  className?: string;
}

const AdinFeedIndicator = ({ isActive, score, signals = [], className = "" }: AdinFeedIndicatorProps) => {
  if (!isActive) return null;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-dna-emerald bg-dna-emerald/10';
    if (score >= 0.6) return 'text-dna-copper bg-dna-copper/10';
    return 'text-gray-500 bg-gray-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return TrendingUp;
    if (score >= 0.6) return Zap;
    return Brain;
  };

  if (score !== undefined) {
    const ScoreIcon = getScoreIcon(score);
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          variant="secondary" 
          className={`text-xs ${getScoreColor(score)} border-0 animate-pulse`}
        >
          <ScoreIcon className="h-3 w-3 mr-1" />
          ADIN {Math.round(score * 100)}%
        </Badge>
        {signals.length > 0 && (
          <span className="text-xs text-gray-400 italic">
            via {signals.slice(0, 2).join(', ')}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs text-dna-emerald bg-dna-emerald/10 border-0">
      <Brain className="h-3 w-3 mr-1" />
      ADIN Powered
    </Badge>
  );
};

export default AdinFeedIndicator;