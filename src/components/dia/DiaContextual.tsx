import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { pillarDiaConfigs, PillarDiaConfig } from '@/config/dia-pillar-config';
import DiaSearch from './DiaSearch';

interface DiaContextualProps {
  pillar: 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  collapsed?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function DiaContextual({
  pillar,
  collapsed = true,
  onToggle
}: DiaContextualProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const config = pillarDiaConfigs[pillar];

  if (!config) return null;

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="truncate">DIA: {config.title}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-9 w-9 p-0 min-h-[44px] min-w-[44px]"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {config.description}
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-3 sm:px-6">
          <DiaSearch
            source={pillar}
            placeholder={config.placeholder}
            compact
            suggestions={config.suggestions}
          />
        </CardContent>
      )}
    </Card>
  );
}

export default DiaContextual;
