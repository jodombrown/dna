export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'support' | 'curious';

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: ReactionType;
  created_at: string;
}

export interface ReactionCount {
  emoji: ReactionType;
  count: number;
  users: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  }[];
}

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-500' },
  love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  celebrate: { emoji: '🎉', label: 'Celebrate', color: 'text-yellow-500' },
  insightful: { emoji: '💡', label: 'Insightful', color: 'text-purple-500' },
  support: { emoji: '🤝', label: 'Support', color: 'text-green-500' },
  curious: { emoji: '🤔', label: 'Curious', color: 'text-orange-500' },
};
