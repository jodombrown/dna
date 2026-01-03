export type PostType = 
  | 'story' 
  | 'event' 
  | 'project' 
  | 'opportunity' 
  | 'post' 
  | 'connection';

export const POST_TYPE_COLORS: Record<PostType, { border: string; bg: string; label: string }> = {
  story: {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    label: 'Story'
  },
  event: {
    border: 'border-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Event'
  },
  project: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    label: 'Project'
  },
  opportunity: {
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    label: 'Opportunity'
  },
  post: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    label: 'Post'
  },
  connection: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    label: 'Network'
  }
};

export const getPostTypeStyles = (type: PostType) => POST_TYPE_COLORS[type] || POST_TYPE_COLORS.post;
