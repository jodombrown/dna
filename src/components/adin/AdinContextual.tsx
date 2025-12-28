import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { pillarAdinConfigs, PillarAdinConfig } from '@/config/adin-pillar-config';
import AdinSearch from './AdinSearch';

interface AdinContextualProps {
  pillar: 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  collapsed?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function AdinContextual({
  pillar,
  collapsed = true,
  onToggle
}: AdinContextualProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const config = pillarAdinConfigs[pillar];

  if (!config) return null;

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>ADIN: {config.title}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <AdinSearch
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

export default AdinContextual;
