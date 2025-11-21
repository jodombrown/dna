export type SectorConfig = {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  iconImageUrl?: string;
  iconAlt?: string;
  shortDescription: string;
  fiveCsBullets: {
    connect: string;
    convene: string;
    collaborate: string;
    contribute: string;
    convey: string;
  };
  roles: string[];
  brings: string[];
  receives: string[];
  partnershipModels: { name: string; shortDescription: string }[];
  programs: { name: string; shortDescription: string }[];
  ctaLabel: string;
  ctaLink: string;
};

export const partnerSectors: SectorConfig[] = [
  {
    slug: 'public-sector',
    name: 'Public Sector & Economic Development',
    shortDescription: 'Partner with governments and development agencies to mobilize diaspora talent and capital for national development.',
    heroTitle: 'Public Sector & Economic Development',
    heroSubtitle: 'Mobilize diaspora expertise, capital, and networks to accelerate national development priorities.',
    // TODO: Replace with AI-generated image representing government buildings and economic development
    heroImageUrl: undefined,
    heroImageAlt: 'Public sector and economic development partnership',
    iconImageUrl: undefined,
    iconAlt: 'Public sector icon',
    fiveCsBullets: {
      connect: 'Link diaspora professionals with government initiatives and local talent pools',
      convene: 'Host policy dialogues, investment forums, and stakeholder convenings',
      collaborate: 'Co-design national diaspora strategies and sector-specific programs',
      contribute: 'Channel diaspora investment, expertise, and advocacy toward development goals',
      convey: 'Amplify success stories and communicate progress to global diaspora communities'
    },
    roles: [
      'Set national diaspora engagement priorities',
      'Provide regulatory clarity and investment frameworks',
      'Host convenings and validation events',
      'Co-fund strategic initiatives'
    ],
    brings: [
      'Policy alignment and government mandate',
      'Access to domestic institutions and resources',
      'Legitimacy and credibility for diaspora engagement',
      'Convening power across sectors'
    ],
    receives: [
      'Ready-to-deploy diaspora network and platform',
      'Cross-sector coordination and program support',
      'Global visibility and storytelling',
      'Impact measurement and reporting'
    ],
    partnershipModels: [
      { name: 'National DNA Partner', shortDescription: 'Country-level partnership to build a national diaspora mobilization hub' },
      { name: 'City DNA Partner', shortDescription: 'City-level partnership for urban innovation and diaspora engagement' }
    ],
    programs: [
      { name: 'National Diaspora Strategy Co-Design', shortDescription: 'Collaborative development of comprehensive diaspora engagement frameworks' },
      { name: 'Diaspora Investment Attraction Program', shortDescription: 'Structured initiatives to channel diaspora capital into priority sectors' },
      { name: 'Skills Transfer & Mentorship Initiatives', shortDescription: 'Programs connecting diaspora expertise with local talent development' }
    ],
    ctaLabel: 'Start a Conversation',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'private-industry',
    name: 'Private Industry',
    shortDescription: 'Unlock diaspora markets, talent pipelines, and innovation partnerships for corporate growth.',
    heroTitle: 'Private Industry & Corporate Partners',
    heroSubtitle: 'Access diaspora talent, markets, and innovation networks to drive business growth and social impact.',
    // TODO: Replace with AI-generated image representing corporate innovation and partnership
    heroImageUrl: undefined,
    heroImageAlt: 'Private industry corporate partnership',
    iconImageUrl: undefined,
    iconAlt: 'Private industry icon',
    fiveCsBullets: {
      connect: 'Access skilled diaspora talent pools and executive networks',
      convene: 'Host corporate-sponsored innovation challenges and showcase events',
      collaborate: 'Co-create products, services, and market entry strategies',
      contribute: 'Provide capital, expertise, and technology to diaspora-led ventures',
      convey: 'Build brand affinity through authentic diaspora storytelling'
    },
    roles: [
      'Sponsor innovation programs and events',
      'Provide market access and distribution channels',
      'Offer technical expertise and mentorship',
      'Co-invest in diaspora ventures'
    ],
    brings: [
      'Capital and resources',
      'Market access and distribution networks',
      'Technical expertise and innovation capabilities',
      'Brand credibility and reach'
    ],
    receives: [
      'Access to global diaspora talent and consumers',
      'Innovation pipeline and market insights',
      'ESG/CSR impact and storytelling',
      'Network effects across sectors and geographies'
    ],
    partnershipModels: [
      { name: 'Corporate Innovation Partner', shortDescription: 'Multi-year partnership to build innovation pipelines and talent access' }
    ],
    programs: [
      { name: 'Diaspora Talent Pipeline Program', shortDescription: 'Structured recruitment and development of diaspora professionals' },
      { name: 'Corporate Innovation Challenges', shortDescription: 'Sponsored competitions to solve business challenges with diaspora innovators' },
      { name: 'Market Entry Acceleration', shortDescription: 'Collaborative programs to enter African markets with diaspora guidance' }
    ],
    ctaLabel: 'Explore Corporate Partnership',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'hbcus',
    name: 'HBCUs',
    shortDescription: 'Build Africa-diaspora bridges through student exchange, research collaboration, and alumni engagement.',
    heroTitle: 'Historically Black Colleges & Universities',
    heroSubtitle: 'Strengthen the HBCU-Africa connection through student mobility, research, and lifelong alumni engagement.',
    // TODO: Replace with AI-generated image representing HBCU campus and student collaboration
    heroImageUrl: undefined,
    heroImageAlt: 'HBCU partnership and student collaboration',
    iconImageUrl: undefined,
    iconAlt: 'HBCU icon',
    fiveCsBullets: {
      connect: 'Link HBCU students and faculty with African counterparts and diaspora networks',
      convene: 'Host exchange programs, research symposia, and alumni gatherings',
      collaborate: 'Co-design curricula, research projects, and career pathways',
      contribute: 'Channel alumni expertise and resources toward institutional development',
      convey: 'Tell the HBCU story as part of the broader African diaspora narrative'
    },
    roles: [
      'Provide academic infrastructure and credibility',
      'Host student and faculty exchanges',
      'Conduct research and knowledge creation',
      'Mobilize alumni networks'
    ],
    brings: [
      'Academic excellence and institutional legacy',
      'Student and faculty talent pools',
      'Research capacity and knowledge production',
      'Powerful alumni networks'
    ],
    receives: [
      'Global network for students and faculty',
      'Research collaboration opportunities',
      'Alumni engagement platform',
      'Visibility in diaspora and African ecosystems'
    ],
    partnershipModels: [
      { name: 'HBCU Anchor Partner', shortDescription: 'Institutional partnership to build sustained Africa-HBCU connections' }
    ],
    programs: [
      { name: 'Student Exchange & Study Abroad', shortDescription: 'Structured programs connecting HBCU students with African institutions' },
      { name: 'Joint Research Initiatives', shortDescription: 'Collaborative research projects addressing Africa-diaspora priorities' },
      { name: 'Alumni Network Activation', shortDescription: 'Programs to engage HBCU alumni in diaspora mobilization' }
    ],
    ctaLabel: 'Build HBCU Partnership',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'global-universities',
    name: 'Global Universities & Education Systems',
    shortDescription: 'Connect research, curriculum, and student opportunities to the global African diaspora ecosystem.',
    heroTitle: 'Global Universities & Education Systems',
    heroSubtitle: 'Integrate diaspora studies, research collaboration, and global talent mobility into your institutional strategy.',
    // TODO: Replace with AI-generated image representing global university campus and international collaboration
    heroImageUrl: undefined,
    heroImageAlt: 'Global university partnership',
    iconImageUrl: undefined,
    iconAlt: 'Global university icon',
    fiveCsBullets: {
      connect: 'Link students and faculty with diaspora professionals and African institutions',
      convene: 'Host global convenings on diaspora and Africa-related research',
      collaborate: 'Co-create curricula, research agendas, and student experiences',
      contribute: 'Provide research, expertise, and platforms for knowledge exchange',
      convey: 'Amplify research findings and institutional thought leadership'
    },
    roles: [
      'Conduct research on diaspora and development',
      'Educate the next generation of global leaders',
      'Provide platforms for knowledge exchange',
      'Validate and credential diaspora expertise'
    ],
    brings: [
      'Research excellence and academic credibility',
      'Global student and faculty networks',
      'Institutional infrastructure and resources',
      'Knowledge creation and dissemination capacity'
    ],
    receives: [
      'Access to global diaspora research networks',
      'Real-world application of academic work',
      'Student recruitment and engagement opportunities',
      'Visibility in diaspora and African ecosystems'
    ],
    partnershipModels: [
      { name: 'Research Network Partner', shortDescription: 'Multi-institution partnership for diaspora-focused research collaboration' }
    ],
    programs: [
      { name: 'Diaspora Studies Programs', shortDescription: 'Academic programs focused on African diaspora history, culture, and impact' },
      { name: 'Global Research Collaborations', shortDescription: 'Joint research initiatives with African and diaspora institutions' },
      { name: 'Student Mobility & Exchange', shortDescription: 'Programs facilitating student movement across diaspora networks' }
    ],
    ctaLabel: 'Partner With Us',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'ngos-civil-society',
    name: 'NGOs & Civil Society',
    shortDescription: 'Scale your impact by mobilizing diaspora networks for advocacy, funding, and program delivery.',
    heroTitle: 'NGOs & Civil Society Organizations',
    heroSubtitle: 'Amplify your mission by connecting with diaspora advocates, funders, and implementers worldwide.',
    // TODO: Replace with AI-generated image representing NGO community work and civil society
    heroImageUrl: undefined,
    heroImageAlt: 'NGO and civil society partnership',
    iconImageUrl: undefined,
    iconAlt: 'NGO icon',
    fiveCsBullets: {
      connect: 'Link your organization with diaspora volunteers, donors, and partners',
      convene: 'Host advocacy campaigns, fundraising events, and community dialogues',
      collaborate: 'Co-design programs that leverage diaspora networks and resources',
      contribute: 'Channel diaspora funding, expertise, and advocacy toward your mission',
      convey: 'Tell your story to global diaspora audiences and amplify your impact'
    },
    roles: [
      'Define program priorities and impact areas',
      'Provide on-ground implementation capacity',
      'Mobilize local communities and stakeholders',
      'Measure and report program outcomes'
    ],
    brings: [
      'Deep local knowledge and community trust',
      'Implementation capacity and program expertise',
      'Issue-specific credibility and networks',
      'Advocacy platforms and mobilization capability'
    ],
    receives: [
      'Access to global diaspora networks and resources',
      'Funding and partnership opportunities',
      'Volunteer and expertise pipelines',
      'Platform for visibility and storytelling'
    ],
    partnershipModels: [
      { name: 'Program Collaboration Partner', shortDescription: 'Joint program design and delivery with diaspora network support' }
    ],
    programs: [
      { name: 'Diaspora Volunteer Mobilization', shortDescription: 'Programs connecting diaspora volunteers with on-ground initiatives' },
      { name: 'Funding Network Access', shortDescription: 'Connecting NGOs with diaspora donors and funding networks' },
      { name: 'Advocacy Campaign Amplification', shortDescription: 'Leveraging diaspora networks to scale advocacy efforts' }
    ],
    ctaLabel: 'Amplify Your Impact',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'innovation-ecosystems',
    name: 'Innovation Ecosystems',
    shortDescription: 'Connect startups, accelerators, and innovation hubs to diaspora talent, capital, and markets.',
    heroTitle: 'Innovation Ecosystems & Entrepreneurship',
    heroSubtitle: 'Build bridges between diaspora innovators and Africa\'s fastest-growing startup ecosystems.',
    // TODO: Replace with AI-generated image representing startup ecosystem and innovation hub
    heroImageUrl: undefined,
    heroImageAlt: 'Innovation ecosystem partnership',
    iconImageUrl: undefined,
    iconAlt: 'Innovation ecosystem icon',
    fiveCsBullets: {
      connect: 'Link African startups with diaspora mentors, investors, and customers',
      convene: 'Host pitch events, demo days, and innovation showcases',
      collaborate: 'Co-create accelerator programs and market entry strategies',
      contribute: 'Channel diaspora investment and expertise into venture pipelines',
      convey: 'Tell startup success stories to global diaspora audiences'
    },
    roles: [
      'Identify and support high-potential ventures',
      'Provide acceleration and incubation services',
      'Connect startups with local markets and resources',
      'Build vibrant innovation communities'
    ],
    brings: [
      'Pipeline of innovative ventures',
      'Acceleration and support infrastructure',
      'Local market knowledge and access',
      'Community building and ecosystem development'
    ],
    receives: [
      'Access to diaspora investors and mentors',
      'Market expansion opportunities',
      'Technical expertise and advisory support',
      'Global visibility and network effects'
    ],
    partnershipModels: [
      { name: 'Hub Network Partner', shortDescription: 'Multi-hub partnership to connect innovation ecosystems across the diaspora' }
    ],
    programs: [
      { name: 'Diaspora Mentor Network', shortDescription: 'Connecting African startups with diaspora mentors and advisors' },
      { name: 'Investor Access Programs', shortDescription: 'Structured pathways to diaspora angel and VC networks' },
      { name: 'Market Entry Acceleration', shortDescription: 'Programs helping diaspora startups enter African markets and vice versa' }
    ],
    ctaLabel: 'Connect Your Ecosystem',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'investors',
    name: 'Investors',
    shortDescription: 'Access high-quality deal flow and co-investment opportunities across the African diaspora.',
    heroTitle: 'Investors & Capital Networks',
    heroSubtitle: 'Deploy capital efficiently through curated deal flow, co-investment networks, and impact measurement.',
    // TODO: Replace with AI-generated image representing investment and capital networks
    heroImageUrl: undefined,
    heroImageAlt: 'Investor partnership',
    iconImageUrl: undefined,
    iconAlt: 'Investor icon',
    fiveCsBullets: {
      connect: 'Access vetted entrepreneurs, co-investors, and portfolio support networks',
      convene: 'Participate in investor forums, demo days, and diligence circles',
      collaborate: 'Co-design investment theses and portfolio acceleration programs',
      contribute: 'Deploy capital, expertise, and networks to high-potential ventures',
      convey: 'Share success stories and thought leadership with global audiences'
    },
    roles: [
      'Provide risk capital and investment expertise',
      'Support portfolio companies with networks and resources',
      'Co-create investment frameworks and standards',
      'Measure and communicate impact'
    ],
    brings: [
      'Investment capital and deployment capacity',
      'Due diligence and investment expertise',
      'Portfolio support and value-add services',
      'Network effects and co-investment opportunities'
    ],
    receives: [
      'Curated deal flow and investment opportunities',
      'Co-investment networks and syndication',
      'Portfolio acceleration support',
      'Impact measurement and storytelling'
    ],
    partnershipModels: [
      { name: 'Capital Network Partner', shortDescription: 'Structured partnership for deal flow access and co-investment' }
    ],
    programs: [
      { name: 'Investor Circle Membership', shortDescription: 'Exclusive access to curated deal flow and co-investment opportunities' },
      { name: 'Portfolio Acceleration Program', shortDescription: 'Support services for portfolio companies leveraging DNA network' },
      { name: 'Impact Investment Framework', shortDescription: 'Collaborative development of diaspora-focused impact measurement' }
    ],
    ctaLabel: 'Join Our Network',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'multilaterals-sdg',
    name: 'UN / SDG & Multilaterals',
    shortDescription: 'Mobilize diaspora as a strategic asset for achieving Sustainable Development Goals in Africa.',
    heroTitle: 'UN, SDG & Multilateral Organizations',
    heroSubtitle: 'Leverage diaspora networks as a force multiplier for sustainable development and global goal achievement.',
    // TODO: Replace with AI-generated image representing UN and multilateral partnership
    heroImageUrl: undefined,
    heroImageAlt: 'Multilateral organization partnership',
    iconImageUrl: undefined,
    iconAlt: 'Multilateral icon',
    fiveCsBullets: {
      connect: 'Link development priorities with diaspora expertise and implementation capacity',
      convene: 'Host global forums on diaspora and sustainable development',
      collaborate: 'Co-design programs that mobilize diaspora for SDG achievement',
      contribute: 'Channel diaspora resources toward development priorities',
      convey: 'Amplify success stories and development progress to global audiences'
    },
    roles: [
      'Set global development frameworks and priorities',
      'Provide funding and technical assistance',
      'Convene stakeholders and validate approaches',
      'Measure and report on development progress'
    ],
    brings: [
      'Global legitimacy and convening power',
      'Development expertise and frameworks',
      'Funding and resource mobilization capacity',
      'Measurement and reporting infrastructure'
    ],
    receives: [
      'Mobilized diaspora as development actor',
      'Scalable implementation capacity',
      'Innovation and private sector engagement',
      'Grassroots legitimacy and community trust'
    ],
    partnershipModels: [
      { name: 'SDG Catalyst Partner', shortDescription: 'Strategic partnership to mobilize diaspora for specific SDG targets' }
    ],
    programs: [
      { name: 'Diaspora SDG Mobilization Program', shortDescription: 'Structured initiatives linking diaspora with SDG achievement' },
      { name: 'Development Finance Innovation', shortDescription: 'Programs to channel diaspora capital toward development priorities' },
      { name: 'Knowledge Exchange & South-South Cooperation', shortDescription: 'Facilitating diaspora-led knowledge transfer and collaboration' }
    ],
    ctaLabel: 'Partner for Impact',
    ctaLink: '/partner-with-dna/start'
  }
];

export const getSectorBySlug = (slug: string): SectorConfig | undefined => {
  return partnerSectors.find(sector => sector.slug === slug);
};
