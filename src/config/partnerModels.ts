export type PartnershipModel = {
  id: string;
  name: string;
  purpose: string;
  partnerProvides: string[];
  dnaProvides: string[];
  useCases: string[];
  timeHorizon: string;
};

export const partnershipModels: PartnershipModel[] = [
  {
    id: 'national-city-partner',
    name: 'National / City DNA Partner',
    purpose: 'Mobilize diaspora talent, investment, and collaboration for your city or country using shared digital infrastructure that turns scattered networks into coordinated action.',
    partnerProvides: [
      'Policy frameworks and regulatory alignment',
      'Government convening power and institutional credibility',
      'Co-funding for strategic programs and initiatives',
      'Access to domestic institutions, markets, and stakeholders'
    ],
    dnaProvides: [
      'Platform infrastructure and 5C mobilization engine',
      'Access to verified diaspora talent and capital networks',
      'Program design, execution support, and capacity building',
      'Impact measurement, storytelling, and global visibility'
    ],
    useCases: [
      'National diaspora engagement strategy implementation',
      'Diaspora bond programs and investment attraction',
      'City-based innovation hubs and talent pipelines',
      'Skills transfer, mentorship, and capacity building initiatives'
    ],
    timeHorizon: '12–36 months'
  },
  {
    id: 'corporate-innovation-partner',
    name: 'Corporate Innovation Partner',
    purpose: 'Access diaspora talent, innovation pipelines, and market insights through a multi-year partnership that drives business growth and delivers measurable social impact.',
    partnerProvides: [
      'Capital to sponsor innovation programs, challenges, and events',
      'Market access, distribution networks, and customer channels',
      'Technical expertise, mentorship, and industry knowledge',
      'Brand visibility and corporate credibility'
    ],
    dnaProvides: [
      'Direct access to global diaspora talent and innovation networks',
      'End-to-end design and execution of innovation challenges',
      'Strategic guidance for market entry and expansion',
      'ESG/CSR impact measurement and authentic storytelling'
    ],
    useCases: [
      'Diaspora talent recruitment and executive pipeline development',
      'Corporate-sponsored innovation challenges and accelerators',
      'Market entry strategies for African and diaspora markets',
      'Co-creation labs with diaspora entrepreneurs and innovators'
    ],
    timeHorizon: '24–48 months'
  },
  {
    id: 'hbcu-anchor-partner',
    name: 'HBCU Anchor Partner',
    purpose: 'Deepen the HBCU-Africa connection through structured student exchange, collaborative research, and lifelong alumni engagement, anchored in the broader diaspora mobilization engine.',
    partnerProvides: [
      'Academic infrastructure, credibility, and institutional legacy',
      'Student and faculty talent ready for global engagement',
      'Research capacity and knowledge creation',
      'Alumni networks eager to connect with Africa and the diaspora'
    ],
    dnaProvides: [
      'Global network for seamless student and faculty exchange',
      'Research partnerships with African institutions and diaspora scholars',
      'Alumni engagement platform with built-in mobilization tools',
      'Visibility and storytelling across the diaspora ecosystem'
    ],
    useCases: [
      'Student study abroad and faculty exchange programs',
      'Collaborative research on diaspora development and Africa',
      'Alumni mentorship and professional network activation',
      'Curriculum co-creation on diaspora entrepreneurship and innovation'
    ],
    timeHorizon: '18–36 months'
  },
  {
    id: 'hub-network-partner',
    name: 'Hub Network Partner',
    purpose: 'Link innovation hubs, accelerators, and startup ecosystems across the diaspora and the continent, creating pathways for deal flow, mentorship, capital, and market access.',
    partnerProvides: [
      'Pipeline of high-potential ventures and entrepreneurs',
      'Acceleration, incubation, and ecosystem support infrastructure',
      'Local market knowledge, networks, and on-ground access',
      'Community building and ecosystem development expertise'
    ],
    dnaProvides: [
      'Direct access to diaspora investors, mentors, and advisors',
      'Cross-hub collaboration, deal flow sharing, and co-investment',
      'Market expansion strategies and partnership facilitation',
      'Global visibility, storytelling, and ecosystem amplification'
    ],
    useCases: [
      'Cross-border accelerator programs and cohort collaboration',
      'Mentor and advisor matching across diaspora networks',
      'Investor network access and pitch event coordination',
      'Bi-directional market entry programs (Africa ↔ Diaspora)'
    ],
    timeHorizon: '12–24 months'
  },
  {
    id: 'capital-network-partner',
    name: 'Capital Network Partner',
    purpose: 'Deploy capital efficiently through curated deal flow, co-investment networks, and portfolio acceleration, backed by a mobilization engine that supports ventures from connection to scale.',
    partnerProvides: [
      'Investment capital and flexible deployment capacity',
      'Due diligence expertise and investment decision-making',
      'Portfolio support services and value-add resources',
      'Co-investment networks and syndication power'
    ],
    dnaProvides: [
      'Curated, vetted deal flow aligned with your investment thesis',
      'Co-investment syndication and investor network coordination',
      'Portfolio company acceleration through the DNA platform',
      'Impact measurement, reporting, and storytelling infrastructure'
    ],
    useCases: [
      'Investor circle membership with exclusive deal access',
      'Portfolio acceleration programs leveraging the DNA network',
      'Thematic investment fund co-creation and management',
      'Impact investing framework development and measurement'
    ],
    timeHorizon: '24–60 months'
  },
  {
    id: 'sdg-catalyst-partner',
    name: 'SDG Catalyst Partner',
    purpose: 'Leverage diaspora networks as a strategic asset for achieving Sustainable Development Goals, turning global frameworks into locally-rooted, diaspora-mobilized action.',
    partnerProvides: [
      'Global development frameworks, goals, and priority areas',
      'Funding, technical assistance, and programmatic resources',
      'Convening power and access to government stakeholders',
      'Measurement, reporting, and accountability infrastructure'
    ],
    dnaProvides: [
      'Mobilized diaspora as a development implementation actor',
      'Scalable execution capacity across borders and sectors',
      'Private sector engagement and innovation partnerships',
      'Grassroots legitimacy, community trust, and local knowledge'
    ],
    useCases: [
      'Diaspora-led programs targeting specific SDG outcomes',
      'Development finance innovation and blended capital models',
      'South-South cooperation and knowledge exchange facilitation',
      'Climate action, green economy, and just transition initiatives'
    ],
    timeHorizon: '18–48 months'
  }
];

export const getModelById = (id: string): PartnershipModel | undefined => {
  return partnershipModels.find(model => model.id === id);
};
