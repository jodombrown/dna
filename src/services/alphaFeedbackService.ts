import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type FeedbackCategory = 'bug' | 'feature_idea' | 'confusion' | 'love';

export type FeedbackArea =
  | 'feed'
  | 'composer'
  | 'events'
  | 'spaces'
  | 'marketplace'
  | 'messages'
  | 'dia'
  | 'navigation'
  | 'other';

export interface AlphaFeedback {
  category: FeedbackCategory;
  area?: FeedbackArea;
  content: string;
  pageUrl: string;
  viewport: string;
  deviceType: 'mobile' | 'desktop';
}

export interface AlphaFeedbackRow {
  id: string;
  user_id: string;
  category: FeedbackCategory;
  area: string | null;
  content: string;
  page_url: string | null;
  viewport: string | null;
  device_type: string | null;
  created_at: string;
}

export interface FeedbackStats {
  total: number;
  byCategory: Record<string, number>;
  byArea: Record<string, number>;
}

export const alphaFeedbackService = {
  async submitFeedback(feedback: AlphaFeedback): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      logger.warn('AlphaFeedback', 'Cannot submit feedback: user not authenticated');
      return false;
    }

    const db = supabase as any;
    const { error } = await db.from('alpha_feedback').insert({
      user_id: userData.user.id,
      category: feedback.category,
      area: feedback.area ?? null,
      content: feedback.content,
      page_url: feedback.pageUrl,
      viewport: feedback.viewport,
      device_type: feedback.deviceType,
    });

    if (error) {
      logger.error('AlphaFeedback', 'Failed to submit feedback', error);
      return false;
    }

    return true;
  },

  async getFeedbackForAdmin(): Promise<AlphaFeedbackRow[]> {
    const db = supabase as any;
    const { data, error } = await db
      .from('alpha_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('AlphaFeedback', 'Failed to fetch feedback', error);
      return [];
    }

    return (data ?? []) as AlphaFeedbackRow[];
  },

  async getFeedbackStats(): Promise<FeedbackStats> {
    const feedback = await this.getFeedbackForAdmin();

    const byCategory: Record<string, number> = {};
    const byArea: Record<string, number> = {};

    for (const item of feedback) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
      if (item.area) {
        byArea[item.area] = (byArea[item.area] ?? 0) + 1;
      }
    }

    return {
      total: feedback.length,
      byCategory,
      byArea,
    };
  },
};
