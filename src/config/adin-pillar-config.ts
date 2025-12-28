export interface PillarAdinConfig {
  pillar: string;
  title: string;
  description: string;
  placeholder: string;
  suggestions: string[];
  systemPromptAddition: string;
}

export const pillarAdinConfigs: Record<string, PillarAdinConfig> = {
  connect: {
    pillar: 'connect',
    title: 'Find Professionals',
    description: 'Discover diaspora professionals by expertise, location, or industry',
    placeholder: 'Find diaspora professionals in...',
    suggestions: [
      'Fintech professionals in London with Nigeria connections',
      'Healthcare experts from the Kenyan diaspora',
      'Tech entrepreneurs in the US with Ghana experience',
      'Investment professionals focused on East Africa',
    ],
    systemPromptAddition: 'Focus on professional connections, expertise areas, and diaspora professional communities.',
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
  },
  contribute: {
    pillar: 'contribute',
    title: 'Investment Intelligence',
    description: 'Research investment opportunities and market trends',
    placeholder: 'Investment opportunities in...',
    suggestions: [
      'Real estate investment opportunities in Lagos',
      'Venture capital trends in African tech',
      'Impact investment funds focused on Africa',
      'Diaspora bond programs across Africa',
    ],
    systemPromptAddition: 'Focus on investment opportunities, financial trends, ROI data, and wealth building strategies for diaspora investors.',
  },
  convey: {
    pillar: 'convey',
    title: 'Content & Trends',
    description: 'Discover trending topics and content ideas',
    placeholder: "What's trending in...",
    suggestions: [
      'Trending topics in African tech Twitter',
      'Popular content themes for diaspora audiences',
      'Viral stories about African innovation',
      'Emerging thought leaders in Pan-African discourse',
    ],
    systemPromptAddition: 'Focus on trending topics, content themes, viral stories, and thought leadership in the African diaspora space.',
  },
};
