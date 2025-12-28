import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Loader2 } from 'lucide-react';

interface DiaInsightOfDayProps {
  onExplore?: (query: string) => void;
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  query_prompt: string;
}

export function DiaInsightOfDay({ onExplore }: DiaInsightOfDayProps) {
  const { data: insight, isLoading } = useQuery({
    queryKey: ['dia-insight-of-day'],
    queryFn: async (): Promise<InsightData | null> => {
      // Get a featured insight, rotating daily based on date
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );

      // Type assertion needed as dia_insights table was added after types generation
      const { data, error } = await (supabase
        .from('dia_insights' as any)
        .select('id, title, description, query_prompt')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true }) as any);

      if (error || !data || data.length === 0) return null;

      // Rotate through featured insights based on day of year
      const index = dayOfYear % data.length;
      return data[index] as InsightData;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/20">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  if (!insight) return null;

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/20 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Lightbulb className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-600 mb-1">
              DIA Insight of the Day
            </p>
            <h4 className="font-medium mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {insight.description}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => onExplore?.(insight.query_prompt)}
            >
              Ask DIA more
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiaInsightOfDay;
