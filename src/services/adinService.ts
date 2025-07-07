import { supabase } from '@/integrations/supabase/client';

// ADIN (African Diaspora Intelligence Network) Service
// Handles intelligent post classification and engagement tracking

interface PostAnalysis {
  pillar: 'connect' | 'collaborate' | 'contribute';
  confidence: number;
  keywords: string[];
  reasoning: string;
}

interface UserContext {
  interests: string[];
  industries: string[];
  skills: string[];
  engagement_pillars: string[];
}

export class AdinService {
  // Keyword patterns for pillar classification
  private static pillarKeywords = {
    connect: [
      'networking', 'meet', 'connection', 'introduce', 'relationship', 'community',
      'gathering', 'event', 'meetup', 'conference', 'discussion', 'conversation',
      'social', 'friends', 'network', 'circle', 'diaspora', 'african', 'culture'
    ],
    collaborate: [
      'partnership', 'collaborate', 'project', 'team', 'work together', 'join forces',
      'startup', 'business', 'venture', 'opportunity', 'skill', 'expertise',
      'mentor', 'mentorship', 'guidance', 'advice', 'experience', 'knowledge',
      'career', 'professional', 'industry', 'innovation', 'technology'
    ],
    contribute: [
      'donation', 'volunteer', 'help', 'support', 'contribute', 'charity', 'cause',
      'fundraising', 'impact', 'change', 'difference', 'give back', 'community service',
      'education', 'scholarship', 'development', 'africa', 'motherland', 'heritage',
      'empowerment', 'uplift', 'social good', 'humanitarian', 'activism'
    ]
  };

  /**
   * Analyze post content and classify it by engagement pillar
   */
  static analyzePost(content: string, hashtags: string[] = [], userContext?: UserContext): PostAnalysis {
    const normalizedContent = content.toLowerCase();
    const allText = [normalizedContent, ...hashtags.map(h => h.toLowerCase())].join(' ');
    
    const scores = {
      connect: 0,
      collaborate: 0,
      contribute: 0
    };

    const foundKeywords: string[] = [];

    // Analyze keywords for each pillar
    Object.entries(this.pillarKeywords).forEach(([pillar, keywords]) => {
      keywords.forEach(keyword => {
        if (allText.includes(keyword.toLowerCase())) {
          scores[pillar as keyof typeof scores] += 1;
          foundKeywords.push(keyword);
        }
      });
    });

    // Boost scores based on user context
    if (userContext) {
      if (userContext.engagement_pillars.includes('connect')) scores.connect += 0.5;
      if (userContext.engagement_pillars.includes('collaborate')) scores.collaborate += 0.5;
      if (userContext.engagement_pillars.includes('contribute')) scores.contribute += 0.5;
    }

    // Determine winning pillar
    const maxScore = Math.max(scores.connect, scores.collaborate, scores.contribute);
    let pillar: 'connect' | 'collaborate' | 'contribute' = 'connect'; // default
    
    if (maxScore === 0) {
      // If no keywords match, use simple heuristics
      if (allText.includes('?') || allText.includes('thoughts')) {
        pillar = 'connect';
      } else if (allText.includes('project') || allText.includes('work')) {
        pillar = 'collaborate';
      } else {
        pillar = 'contribute';
      }
    } else {
      if (scores.collaborate === maxScore) pillar = 'collaborate';
      else if (scores.contribute === maxScore) pillar = 'contribute';
      else pillar = 'connect';
    }

    const confidence = maxScore > 0 ? Math.min(0.9, 0.3 + (maxScore * 0.15)) : 0.3;

    return {
      pillar,
      confidence,
      keywords: foundKeywords,
      reasoning: this.generateReasoning(pillar, foundKeywords, maxScore)
    };
  }

  /**
   * Generate human-readable reasoning for the classification
   */
  private static generateReasoning(pillar: string, keywords: string[], score: number): string {
    if (score === 0) {
      return `Classified as ${pillar} based on general content patterns`;
    }

    const keywordText = keywords.slice(0, 3).join(', ');
    return `Detected ${pillar} intent from keywords: ${keywordText}`;
  }

  /**
   * Extract hashtags from post content
   */
  static extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }

  /**
   * Extract mentions from post content
   */
  static extractMentions(content: string): string[] {
    const mentionRegex = /@[\w]+/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1)) : [];
  }

  /**
   * Update user's ADIN profile with new engagement data
   */
  static async updateUserProfile(userId: string, pillar: string, keywords: string[]) {
    try {
      // Update last active and add engagement pillar if not present
      const { error } = await supabase.rpc('update_adin_last_active', { 
        target_user_id: userId 
      });

      if (error) {
        console.error('Error updating ADIN profile:', error);
      }

      // Update engagement pillars array
      const { data: profile } = await supabase
        .from('user_adin_profile')
        .select('engagement_pillars')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const currentPillars = profile.engagement_pillars || [];
        if (!currentPillars.includes(pillar)) {
          const updatedPillars = [...currentPillars, pillar];
          
          await supabase
            .from('user_adin_profile')
            .update({ engagement_pillars: updatedPillars })
            .eq('user_id', userId);
        }
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  }

  /**
   * Create connection signals between users based on post interactions
   */
  static async createConnectionSignal(
    sourceUserId: string, 
    targetUserId: string, 
    reason: string, 
    score: number, 
    context: any = {}
  ) {
    try {
      await supabase
        .from('adin_connection_signals')
        .insert({
          source_user: sourceUserId,
          target_user: targetUserId,
          reason,
          score,
          context
        });
    } catch (error) {
      console.error('Error creating connection signal:', error);
    }
  }

  /**
   * Get user's ADIN profile context for better classification
   */
  static async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      const { data, error } = await supabase
        .from('user_adin_profile')
        .select('interests, industries, skills, engagement_pillars')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        interests: data.interests || [],
        industries: data.industries || [],
        skills: data.skills || [],
        engagement_pillars: data.engagement_pillars || []
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  }
}