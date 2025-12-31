export type DiaPillar = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey' | 'dashboard' | 'dia-page';

export type NetworkMatchType = 'profiles' | 'stories' | 'projects' | 'hashtags' | 'events' | 'opportunities';

export interface PillarDiaConfig {
  pillar: string;
  title: string;
  description: string;
  placeholder: string;
  suggestions: string[];
  systemPromptAddition: string;
  networkMatchPriority: NetworkMatchType[];
  maxResults: {
    profiles: number;
    stories: number;
    projects: number;
    hashtags: number;
    events: number;
    opportunities: number;
  };
}

export const pillarDiaConfigs: Record<string, PillarDiaConfig> = {
  connect: {
    pillar: 'connect',
    title: 'Find Professionals',
    description: 'Find the right connections in the diaspora network',
    placeholder: 'Find professionals, skills, or expertise...',
    suggestions: [
      'Fintech founders in West Africa',
      'Diaspora investors in tech',
      'Software engineers from Nigeria',
      'Healthcare professionals in the diaspora',
      'Tech entrepreneurs in the US with Ghana experience',
      'Investment professionals focused on East Africa',
    ],
    systemPromptAddition: 'Focus on professional connections, expertise areas, and diaspora professional communities. Prioritize matching users with relevant professionals in the network.',
    networkMatchPriority: ['profiles', 'projects', 'events', 'stories', 'opportunities'],
    maxResults: { profiles: 6, stories: 1, projects: 2, hashtags: 0, events: 2, opportunities: 2 },
  },
  convene: {
    pillar: 'convene',
    title: 'Discover Events',
    description: 'Find relevant events, conferences, and gatherings',
    placeholder: 'What events are happening for...',
    suggestions: [
      'Upcoming African tech conferences in 2025',
      'Diaspora investment summits this quarter',
      'Networking events for African entrepreneurs',
      'Cultural festivals celebrating African heritage',
    ],
    systemPromptAddition: 'Focus on events, conferences, meetups, and gatherings relevant to the African diaspora.',
    networkMatchPriority: ['events', 'profiles', 'projects', 'stories', 'opportunities'],
    maxResults: { profiles: 2, stories: 1, projects: 2, hashtags: 2, events: 6, opportunities: 1 },
  },
  collaborate: {
    pillar: 'collaborate',
    title: 'Research Opportunities',
    description: 'Get market intelligence for your projects and ideas',
    placeholder: 'Research opportunities in...',
    suggestions: [
      'Market size for mobile payments in West Africa',
      'Regulatory landscape for fintech in Kenya',
      'Partnership opportunities in renewable energy',
      'Funding trends for African startups',
    ],
    systemPromptAddition: 'Focus on market research, business opportunities, partnerships, and project feasibility.',
    networkMatchPriority: ['projects', 'opportunities', 'profiles', 'events', 'stories'],
    maxResults: { profiles: 3, stories: 2, projects: 4, hashtags: 2, events: 2, opportunities: 3 },
  },
  contribute: {
    pillar: 'contribute',
    title: 'Contribution Opportunities',
    description: 'Find ways to contribute - funding, skills, time, and access',
    placeholder: 'Find contribution opportunities in...',
    suggestions: [
      'Projects needing funding in West Africa',
      'Volunteer opportunities for tech skills',
      'Mentorship opportunities in fintech',
      'Ways to contribute to diaspora initiatives',
      'Open needs for skills sharing',
      'How can I help African startups?',
    ],
    systemPromptAddition: 'Focus on contribution opportunities including funding needs, skill-sharing opportunities, volunteer time, access/networking, and resource sharing. Help users find meaningful ways to contribute to African development and diaspora projects.',
    networkMatchPriority: ['opportunities', 'projects', 'profiles', 'stories', 'events'],
    maxResults: { profiles: 2, stories: 1, projects: 3, hashtags: 2, events: 1, opportunities: 5 },
  },
  convey: {
    pillar: 'convey',
    title: 'Stories & Content',
    description: 'Discover stories, content, and trending topics',
    placeholder: 'Discover stories, content, or trending topics...',
    suggestions: [
      'Trending stories this week',
      'Popular hashtags in African tech',
      'Founder journey stories',
      'Content about diaspora investment',
      'What are people saying about fintech?',
      'Stories from East African founders',
    ],
    systemPromptAddition: 'Focus on trending topics, content themes, viral stories, and thought leadership in the African diaspora space. Prioritize content discovery and storytelling.',
    networkMatchPriority: ['stories', 'hashtags', 'profiles', 'events', 'opportunities'],
    maxResults: { profiles: 2, stories: 4, projects: 0, hashtags: 4, events: 1, opportunities: 1 },
  },
  dashboard: {
    pillar: 'dashboard',
    title: 'DIA',
    description: 'Your AI assistant for Africa and its global diaspora',
    placeholder: 'Ask DIA anything about Africa and the diaspora...',
    suggestions: [
      'Fintech opportunities in Nigeria',
      'Trending diaspora stories',
      'Find tech professionals',
      'Investment trends in East Africa',
      'Ways to contribute to African projects',
    ],
    systemPromptAddition: 'Provide comprehensive intelligence about African opportunities, markets, and the global diaspora network. Include contribution opportunities when relevant.',
    networkMatchPriority: ['profiles', 'stories', 'projects', 'opportunities', 'hashtags', 'events'],
    maxResults: { profiles: 3, stories: 2, projects: 2, hashtags: 3, events: 2, opportunities: 2 },
  },
  'dia-page': {
    pillar: 'dia-page',
    title: 'DIA',
    description: 'Diaspora Intelligence Agent',
    placeholder: 'Ask DIA anything about Africa, the diaspora, or opportunities...',
    suggestions: [
      'What fintech opportunities exist in Kenya?',
      'Find diaspora professionals in renewable energy',
      'Trending stories about African startups',
      'Investment landscape in West Africa',
      'Contribution opportunities matching my skills',
    ],
    systemPromptAddition: 'Provide comprehensive intelligence about African opportunities, markets, and the global diaspora network. You have access to the full range of network data including contribution opportunities.',
    networkMatchPriority: ['profiles', 'stories', 'opportunities', 'projects', 'hashtags', 'events'],
    maxResults: { profiles: 4, stories: 3, projects: 2, hashtags: 4, events: 3, opportunities: 3 },
  },
};

export const getDiaPillarConfig = (pillar: DiaPillar): PillarDiaConfig => {
  return pillarDiaConfigs[pillar] || pillarDiaConfigs.dashboard;
};

// Legacy export for backward compatibility
export type { PillarDiaConfig as DiaPillarConfig };
