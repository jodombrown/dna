import { Users, Calendar, FolderKanban, HandHeart, FileText, MessageSquare, UserPlus, Plus, type LucideIcon } from 'lucide-react';

export interface CrossAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  route: (context?: Record<string, string>) => string;
  pillar: 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';
  requiresAuth: boolean;
}

export const CROSS_ACTIONS = {
  event: [
    {
      id: 'event_connect_attendees',
      label: 'Connect with Attendees',
      description: 'Meet people attending this event',
      icon: Users,
      route: (context) => `/dna/connect/discover?event=${context?.eventId}`,
      pillar: 'connect' as const,
      requiresAuth: false,
    },
    {
      id: 'event_join_space',
      label: 'Join Organizing Space',
      description: 'Get involved with the team behind this event',
      icon: FolderKanban,
      route: (context) => context?.spaceId ? `/dna/collaborate/spaces/${context.spaceId}` : '/dna/collaborate',
      pillar: 'collaborate' as const,
      requiresAuth: false,
    },
    {
      id: 'event_offer_help',
      label: 'Offer Help',
      description: 'Support this event or create a need',
      icon: HandHeart,
      route: (context) => context?.spaceId ? `/dna/contribute/needs?space=${context.spaceId}` : '/dna/contribute',
      pillar: 'contribute' as const,
      requiresAuth: false,
    },
    {
      id: 'event_share_story',
      label: 'Share Your Experience',
      description: 'Write about this event',
      icon: FileText,
      route: () => '/dna/convey?type=story',
      pillar: 'convey' as const,
      requiresAuth: true,
    },
  ],
  
  space: [
    {
      id: 'space_post_need',
      label: 'Post a Need',
      description: 'Create a contribution opportunity',
      icon: Plus,
      route: (context) => `/dna/contribute/needs/new?space=${context?.spaceId}`,
      pillar: 'contribute' as const,
      requiresAuth: true,
    },
    {
      id: 'space_invite_connections',
      label: 'Invite Your Network',
      description: 'Bring people you know to this space',
      icon: UserPlus,
      route: (context) => `/dna/connect?invite_to=${context?.spaceId}`,
      pillar: 'connect' as const,
      requiresAuth: true,
    },
    {
      id: 'space_view_events',
      label: 'View Related Events',
      description: 'See events from this space',
      icon: Calendar,
      route: (context) => `/dna/convene?space=${context?.spaceId}`,
      pillar: 'convene' as const,
      requiresAuth: false,
    },
    {
      id: 'space_share_story',
      label: 'Share a Story',
      description: 'Tell people about this project',
      icon: FileText,
      route: (context) => `/dna/convey?type=story&space=${context?.spaceId}`,
      pillar: 'convey' as const,
      requiresAuth: true,
    },
  ],
  
  need: [
    {
      id: 'need_join_space',
      label: 'Join the Space',
      description: 'Get involved with this project',
      icon: FolderKanban,
      route: (context) => context?.spaceId ? `/dna/collaborate/spaces/${context.spaceId}` : '/dna/collaborate',
      pillar: 'collaborate' as const,
      requiresAuth: false,
    },
    {
      id: 'need_view_events',
      label: 'See Related Events',
      description: 'Find events from this space',
      icon: Calendar,
      route: (context) => `/dna/convene?space=${context?.spaceId}`,
      pillar: 'convene' as const,
      requiresAuth: false,
    },
    {
      id: 'need_message_organizer',
      label: 'Message Organizer',
      description: 'Ask questions or offer help',
      icon: MessageSquare,
      route: (context) => `/dna/messages?user=${context?.creatorId}`,
      pillar: 'connect' as const,
      requiresAuth: true,
    },
    {
      id: 'need_share_contribution',
      label: 'Share Your Contribution',
      description: 'Write about how you helped',
      icon: FileText,
      route: (context) => `/dna/convey?type=story&need=${context?.needId}`,
      pillar: 'convey' as const,
      requiresAuth: true,
    },
  ],
  
  story: [
    {
      id: 'story_connect_author',
      label: 'Connect with Author',
      description: 'Build your network',
      icon: Users,
      route: (context) => `/dna/${context?.authorUsername}`,
      pillar: 'connect' as const,
      requiresAuth: false,
    },
    {
      id: 'story_explore_spaces',
      label: 'Explore Related Spaces',
      description: 'Find projects mentioned in this story',
      icon: FolderKanban,
      route: (context) => context?.spaceId ? `/dna/collaborate/spaces/${context.spaceId}` : '/dna/collaborate',
      pillar: 'collaborate' as const,
      requiresAuth: false,
    },
    {
      id: 'story_join_events',
      label: 'Join Related Events',
      description: 'Attend events from this story',
      icon: Calendar,
      route: (context) => `/dna/convene?space=${context?.spaceId}`,
      pillar: 'convene' as const,
      requiresAuth: false,
    },
    {
      id: 'story_offer_help',
      label: 'Offer Support',
      description: 'See how you can contribute',
      icon: HandHeart,
      route: (context) => `/dna/contribute?space=${context?.spaceId}`,
      pillar: 'contribute' as const,
      requiresAuth: false,
    },
  ],
  
  profile: [
    {
      id: 'profile_message',
      label: 'Send Message',
      description: 'Start a conversation',
      icon: MessageSquare,
      route: (context) => `/dna/messages?user=${context?.userId}`,
      pillar: 'connect' as const,
      requiresAuth: true,
    },
    {
      id: 'profile_view_events',
      label: 'View Their Events',
      description: 'See events they organize or attend',
      icon: Calendar,
      route: (context) => `/dna/convene?user=${context?.userId}`,
      pillar: 'convene' as const,
      requiresAuth: false,
    },
    {
      id: 'profile_view_spaces',
      label: 'View Shared Projects',
      description: "Explore spaces they're in",
      icon: FolderKanban,
      route: (context) => `/dna/collaborate?user=${context?.userId}`,
      pillar: 'collaborate' as const,
      requiresAuth: false,
    },
    {
      id: 'profile_view_stories',
      label: 'Read Their Stories',
      description: "See what they've shared",
      icon: FileText,
      route: (context) => `/dna/convey?user=${context?.userId}`,
      pillar: 'convey' as const,
      requiresAuth: false,
    },
  ],
} as const satisfies Record<string, CrossAction[]>;

export type CrossActionType = keyof typeof CROSS_ACTIONS;
