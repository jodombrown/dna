/**
 * DNA | DIA Unique Insight — Sprint 13B
 *
 * Displays a DIA-generated personalized insight on the profile.
 * Pro feature with teaser for Free users.
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrGenerateInsight, generateUniquenessInsight } from '@/services/dia-uniqueness-service';

interface DiaUniqueInsightProps {
  userId: string;
  isOwner: boolean;
  isPro?: boolean;
}

const DiaUniqueInsight: React.FC<DiaUniqueInsightProps> = ({
  userId,
  isOwner,
  isPro = false,
}) => {
  // DIA insights are private — only visible to profile owner
  if (!isOwner) return null;
  const queryClient = useQueryClient();

  const { data: insight, isLoading } = useQuery({
    queryKey: ['dia-insight', userId],
    queryFn: () => getOrGenerateInsight(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => generateUniquenessInsight(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia-insight', userId] });
    },
  });

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-[#4A8D77]">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!insight) return null;

  // Non-Pro teaser
  if (!isPro && isOwner) {
    return (
      <Card className="border-l-4 border-l-[#4A8D77] relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-[#4A8D77]" />
            <span className="text-xs font-medium text-[#4A8D77]">DIA Insight</span>
          </div>
          <div className="relative">
            <p className="text-sm italic text-muted-foreground blur-sm select-none">
              {insight}
            </p>
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-4 h-4" />
                Unlock with Pro
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-[#4A8D77]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#4A8D77]" />
            <span className="text-xs font-medium text-[#4A8D77]">DIA says</span>
          </div>
          {isOwner && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="h-7 text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          )}
        </div>
        <p className="text-sm italic text-foreground/80">
          {insight}
        </p>
      </CardContent>
    </Card>
  );
};

export default DiaUniqueInsight;
