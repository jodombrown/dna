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
    purpose: 'Build a country or city-level hub for diaspora mobilization, co-designed with government and anchored in local ecosystems.',
    partnerProvides: [
      'Policy alignment and regulatory support',
      'Government convening power and legitimacy',
      'Co-funding for strategic initiatives',
      'Access to domestic institutions and resources'
    ],
    dnaProvides: [
      'Platform infrastructure and 5C mobilization engine',
      'Global diaspora network access',
      'Program design and implementation support',
      'Measurement, storytelling, and visibility'
    ],
    useCases: [
      'National diaspora strategy implementation',
      'Diaspora investment attraction programs',
      'City-level innovation and talent hubs',
      'Skills transfer and mentorship initiatives'
    ],
    timeHorizon: '12–36 months'
  },
  {
    id: 'corporate-innovation-partner',
    name: 'Corporate Innovation Partner',
    purpose: 'Multi-year partnership to access diaspora talent, innovation pipelines, and market opportunities while delivering corporate social impact.',
    partnerProvides: [
      'Capital for innovation programs and events',
      'Market access and distribution channels',
      'Technical expertise and mentorship',
      'Brand credibility and reach'
    ],
    dnaProvides: [
      'Access to global diaspora talent pools',
      'Innovation challenge design and execution',
      'Market entry strategies and guidance',
      'ESG/CSR storytelling and impact measurement'
    ],
    useCases: [
      'Diaspora talent recruitment programs',
      'Corporate-sponsored innovation challenges',
      'Market entry into African ecosystems',
      'Product co-creation with diaspora innovators'
    ],
    timeHorizon: '24–48 months'
  },
  {
    id: 'hbcu-anchor-partner',
    name: 'HBCU Anchor Partner',
    purpose: 'Institutional partnership to strengthen HBCU-Africa connections through student exchange, research, and lifelong alumni engagement.',
    partnerProvides: [
      'Academic infrastructure and credibility',
      'Student and faculty talent pools',
      'Research capacity and knowledge production',
      'Alumni network mobilization'
    ],
    dnaProvides: [
      'Global network for student and faculty exchange',
      'Research collaboration opportunities',
      'Alumni engagement platform and tools',
      'Visibility in diaspora ecosystems'
    ],
    useCases: [
      'Student study abroad and exchange programs',
      'Joint research on diaspora and development',
      'Alumni network activation for mentorship',
      'Curriculum development on Africa-diaspora topics'
    ],
    timeHorizon: '18–36 months'
  },
  {
    id: 'hub-network-partner',
    name: 'Hub Network Partner',
    purpose: 'Connect innovation hubs, accelerators, and entrepreneurship ecosystems across the diaspora for deal flow, mentorship, and market access.',
    partnerProvides: [
      'Pipeline of innovative ventures',
      'Acceleration and incubation infrastructure',
      'Local market knowledge and access',
      'Ecosystem development expertise'
    ],
    dnaProvides: [
      'Access to diaspora investors and mentors',
      'Cross-hub collaboration and deal flow',
      'Market expansion support',
      'Global visibility and storytelling'
    ],
    useCases: [
      'Cross-border accelerator programs',
      'Diaspora mentor matching',
      'Investor network access for startups',
      'Market entry programs (Africa ↔ Diaspora)'
    ],
    timeHorizon: '12–24 months'
  },
  {
    id: 'capital-network-partner',
    name: 'Capital Network Partner',
    purpose: 'Structured partnership for investors to access curated deal flow, co-investment opportunities, and portfolio acceleration support.',
    partnerProvides: [
      'Investment capital and deployment capacity',
      'Due diligence and investment expertise',
      'Portfolio support services',
      'Co-investment network effects'
    ],
    dnaProvides: [
      'Curated deal flow and investment opportunities',
      'Co-investment syndication and networks',
      'Portfolio company acceleration support',
      'Impact measurement and reporting'
    ],
    useCases: [
      'Investor circle membership',
      'Portfolio acceleration programs',
      'Thematic investment fund development',
      'Impact investing framework co-creation'
    ],
    timeHorizon: '24–60 months'
  },
  {
    id: 'sdg-catalyst-partner',
    name: 'SDG Catalyst Partner',
    purpose: 'Strategic partnership with multilateral organizations to mobilize diaspora resources for achieving specific Sustainable Development Goals.',
    partnerProvides: [
      'Global development frameworks and priorities',
      'Funding and technical assistance',
      'Convening power and stakeholder access',
      'Measurement and reporting infrastructure'
    ],
    dnaProvides: [
      'Mobilized diaspora as development actor',
      'Scalable implementation capacity',
      'Private sector and innovation engagement',
      'Grassroots legitimacy and community trust'
    ],
    useCases: [
      'Diaspora-led SDG achievement programs',
      'Development finance innovation',
      'South-South cooperation facilitation',
      'Climate action and green economy initiatives'
    ],
    timeHorizon: '18–48 months'
  }
];

export const getModelById = (id: string): PartnershipModel | undefined => {
  return partnershipModels.find(model => model.id === id);
};
