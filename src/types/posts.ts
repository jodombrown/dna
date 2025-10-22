export type PostType = 'update' | 'article' | 'question' | 'celebration' | 'text' | 'image' | 'video' | 'link' | 'poll' | 'opportunity' | 'spotlight';
export type PrivacyLevel = 'public' | 'connections';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  privacy_level: PrivacyLevel;
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface PostWithAuthor {
  post_id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url?: string;
  author_headline?: string;
  content: string;
  post_type: PostType;
  privacy_level: PrivacyLevel;
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  is_connection: boolean;
}

export interface PostComment {
  comment_id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostLiker {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  liked_at: string;
}

export interface CreatePostInput {
  content: string;
  post_type: PostType;
  privacy_level: PrivacyLevel;
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
}
