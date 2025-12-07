/**
 * DNA | FEED - Universal Feed Item Router
 * 
 * Routes each feed item to the appropriate card component based on its type.
 * This is the single entry point for rendering any feed content.
 */

import React from 'react';
import { UniversalFeedItem as UniversalFeedItemType } from '@/types/feed';
import { PostCard } from '@/components/posts/PostCard';
import { EventCard } from './cards/EventCard';
import { SpaceCard } from './cards/SpaceCard';
import { NeedCard } from './cards/NeedCard';
import { StoryCard } from './cards/StoryCard';

interface UniversalFeedItemProps {
  item: UniversalFeedItemType;
  currentUserId: string;
  onUpdate: () => void;
}

export const UniversalFeedItemComponent: React.FC<UniversalFeedItemProps> = ({
  item,
  currentUserId,
  onUpdate,
}) => {
  // Defensive guards
  if (!item || !item.post_id || !item.author_id) {
    console.warn('Invalid feed item:', item);
    return null;
  }

  // For linked entities, we might want to show them differently
  // For MVP, we route based on post_type
  
  switch (item.post_type) {
    case 'story':
      return (
        <StoryCard
          item={item}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      );

    case 'event':
      return (
        <EventCard
          item={item}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      );
    
    case 'space':
      return (
        <SpaceCard
          item={item}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      );
    
    case 'need':
      return (
        <NeedCard
          item={item}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
        />
      );
    
    case 'post':
    case 'community_post':
    default:
      // Use existing PostCard for standard posts
      const mappedPostType = item.post_type === 'post' || item.post_type === 'community_post' 
        ? 'text' 
        : 'text';
      
      return (
        <PostCard
          post={{
            post_id: item.post_id,
            author_id: item.author_id,
            author_username: item.author_username || 'unknown',
            author_full_name: item.author_display_name || 'Unknown User',
            author_avatar_url: item.author_avatar_url || undefined,
            content: item.content || '',
            post_type: mappedPostType as any,
            privacy_level: item.privacy_level as any,
            image_url: item.media_url || undefined,
            created_at: item.created_at,
            likes_count: item.like_count || 0,
            comments_count: item.comment_count || 0,
            user_has_liked: item.has_liked || false,
            is_connection: false,
          }}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          showComments={false}
          feedItem={item}
        />
      );
    
    case 'reshare':
      // Reshares are handled specially by PostCard
      return (
        <PostCard
          post={{
            post_id: item.post_id,
            author_id: item.author_id,
            author_username: item.author_username,
            author_full_name: item.author_display_name,
            author_avatar_url: item.author_avatar_url || undefined,
            content: item.content,
            post_type: 'text' as any,
            privacy_level: item.privacy_level as any,
            image_url: item.media_url || undefined,
            created_at: item.created_at,
            likes_count: item.like_count,
            comments_count: item.comment_count,
            user_has_liked: item.has_liked,
            is_connection: false,
          }}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          showComments={false}
          feedItem={item}
          isReshare={true}
        />
      );
  }
};

// Named export for backwards compatibility
export { UniversalFeedItemComponent as UniversalFeedItem };