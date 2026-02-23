/**
 * ContributorRanking — Shows top contributors in a space based on task completion.
 *
 * Displays ranked list of members by tasks completed, with contribution streaks.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Loader2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { cn } from '@/lib/utils';

interface ContributorRankingProps {
  spaceId: string;
  limit?: number;
}

interface ContributorData {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  tasks_completed: number;
  tasks_total: number;
}

export function ContributorRanking({ spaceId, limit = 5 }: ContributorRankingProps) {
  const { data: contributors = [], isLoading } = useQuery({
    queryKey: ['contributor-ranking', spaceId],
    queryFn: async () => {
      // Get all tasks with assignees for this space
      const { data: tasks, error } = await supabaseClient
        .from('space_tasks')
        .select(`
          id,
          status,
          assigned_to,
          assignee:profiles!assignee_id (
            full_name,
            avatar_url
          )
        `)
        .eq('space_id', spaceId)
        .not('assigned_to', 'is', null);

      if (error || !tasks) return [];

      // Aggregate by user
      const userMap = new Map<string, ContributorData>();

      for (const task of tasks) {
        const userId = task.assigned_to as string;
        if (!userId) continue;

        const existing = userMap.get(userId);
        const assignee = task.assignee as { full_name: string; avatar_url: string | null } | null;

        if (existing) {
          existing.tasks_total += 1;
          if (task.status === 'done') existing.tasks_completed += 1;
        } else {
          userMap.set(userId, {
            user_id: userId,
            full_name: assignee?.full_name || 'Unknown',
            avatar_url: assignee?.avatar_url || null,
            tasks_completed: task.status === 'done' ? 1 : 0,
            tasks_total: 1,
          });
        }
      }

      // Sort by tasks completed descending
      return Array.from(userMap.values())
        .sort((a, b) => b.tasks_completed - a.tasks_completed)
        .slice(0, limit);
    },
    enabled: !!spaceId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (contributors.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.user_id}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
          >
            <span
              className={cn(
                'text-sm font-bold w-5 text-center',
                index === 0 && 'text-amber-500',
                index === 1 && 'text-slate-400',
                index === 2 && 'text-amber-700',
                index > 2 && 'text-muted-foreground'
              )}
            >
              {index + 1}
            </span>

            <Avatar className="h-8 w-8">
              <AvatarImage src={contributor.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {contributor.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {contributor.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {contributor.tasks_completed} task{contributor.tasks_completed !== 1 ? 's' : ''} completed
              </p>
            </div>

            {index === 0 && contributor.tasks_completed > 0 && (
              <Star className="h-4 w-4 text-amber-500" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
