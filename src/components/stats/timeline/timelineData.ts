export interface TimelineDataItem {
  year: string;
  events: string[];
  expandedContent: {
    title: string;
    description: string;
    sources: { label: string; url: string }[];
  };
}

export const timelineData: TimelineDataItem[] = [
  {
    year: '2014',
    events: ['Remittances to SSA: $33B', 'Digital banking emergence', 'First diaspora investment funds'],
    expandedContent: {
      title: 'The Foundation Year',
      description: 'In 2014, remittances to sub-Saharan Africa reached approximately $33 billion, serving as a vital lifeline for millions of families across the continent. This was the year digital banking began its emergence from the shadows of traditional money transfer systems, while pioneering communities established the first diaspora investment funds — symbols of collective ambition, pooling resources to invest in their homelands\' futures.',
      sources: [
        { label: 'World Bank — Remittances to Developing Countries 2014', url: 'https://www.worldbank.org/en/news/press-release/2014/10/06/remittances-developing-countries-five-percent-conflict-related-migration-all-time-high-wb-report' },
        { label: 'World Bank — Personal Remittances Data (SSA)', url: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT?locations=ZG' },
      ],
    },
  },
  {
    year: '2016',
    events: ['Remittances to SSA: $38B', 'Mobile money expansion', '100+ diaspora organizations'],
    expandedContent: {
      title: 'The Mobile Money Revolution',
      description: 'By 2016, remittances to sub-Saharan Africa had grown to approximately $38 billion. The real revolution was happening in the palm of people\'s hands — mobile money was expanding rapidly, transforming how families across Africa could receive money instantly from loved ones abroad. Over 100 diaspora organizations had sprouted worldwide, creating networks of support that extended far beyond financial transfers to encompass cultural preservation, advocacy, and community building.',
      sources: [
        { label: 'World Bank — Personal Remittances Data (SSA)', url: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT?locations=ZG' },
        { label: 'Pew Research — Record Remittances to Sub-Saharan Africa', url: 'https://www.pewresearch.org/short-reads/2019/04/03/immigrants-sent-a-record-amount-of-money-home-to-sub-saharan-african-countries-in-2017/' },
      ],
    },
  },
  {
    year: '2018',
    events: ['Remittances to SSA: $46B', '250+ organizations', 'Tech startup boom begins'],
    expandedContent: {
      title: 'The Tech Startup Boom',
      description: 'By 2018, remittances to sub-Saharan Africa surged to approximately $46 billion, according to World Bank estimates. Over 250 organizations were now operating in the diaspora engagement space, and tech startups were booming with innovative solutions. Young entrepreneurs, many from diaspora communities themselves, were building apps and platforms to make sending money home faster, cheaper, and more transparent — driven not just by technology, but by dignity.',
      sources: [
        { label: 'Pew Research — Record Remittances to Sub-Saharan Africa (2017 data)', url: 'https://www.pewresearch.org/short-reads/2019/04/03/immigrants-sent-a-record-amount-of-money-home-to-sub-saharan-african-countries-in-2017/' },
        { label: 'World Bank — Personal Remittances Data (SSA)', url: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT?locations=ZG' },
      ],
    },
  },
  {
    year: '2020',
    events: ['COVID-19 resilience', 'Remittances to SSA: $44B', 'Virtual collaboration tools'],
    expandedContent: {
      title: 'Resilience in Crisis',
      description: 'The year 2020 tested everything. As COVID-19 swept across the globe, economists predicted remittance flows would collapse. Instead, remittances to sub-Saharan Africa proved remarkably resilient at approximately $44 billion — dipping only modestly. Diaspora communities, even while facing their own economic uncertainties, continued supporting families back home. Digital transformation accelerated out of necessity, and virtual collaboration tools became lifelines for maintaining the financial and emotional connections that bind communities to their origins.',
      sources: [
        { label: 'World Bank — KNOMAD Migration & Development Brief', url: 'https://www.worldbank.org/en/topic/migration/brief/remittances-knomad' },
        { label: 'World Bank — Personal Remittances Data (SSA)', url: 'https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT?locations=ZG' },
      ],
    },
  },
  {
    year: '2022',
    events: ['Remittances to SSA: $53B', 'Fintech revolution', '1000+ active projects'],
    expandedContent: {
      title: 'The Fintech Revolution Matures',
      description: 'Remittances to sub-Saharan Africa reached approximately $53 billion in 2022, according to the World Bank. Over 1,000 active projects were now operating across the diaspora ecosystem. Blockchain technology and cryptocurrency solutions were gaining traction, promising even greater efficiency and lower costs. The diaspora had become early adopters of financial technology, driven by necessity and enabled by innovation.',
      sources: [
        { label: 'World Bank — Remittances Data Overview', url: 'https://www.worldbank.org/en/topic/migration/brief/remittances-knomad' },
        { label: 'KNOMAD — Migration and Development Brief 39', url: 'https://knomad.org/publication/migration-and-development-brief-39' },
      ],
    },
  },
  {
    year: '2024',
    events: ['Remittances to Africa: $100B+', 'Return migration rising', 'AI-powered platforms'],
    expandedContent: {
      title: 'The $100 Billion Milestone',
      description: 'In 2024, total remittance flows to Africa surpassed $100 billion, a historic milestone. Globally, remittances to low- and middle-income countries reached $685 billion — larger than FDI and ODA combined. AI-powered platforms began optimizing transfer routes and exchange rate timing. Return migration patterns were rising as diaspora members moved back to their countries of origin, armed with skills, capital, and networks developed abroad.',
      sources: [
        { label: 'World Bank — Remittances Reach $685B in 2024', url: 'https://blogs.worldbank.org/en/peoplemove/in-2024--remittance-flows-to-low--and-middle-income-countries-ar' },
        { label: 'Afridigest — Diaspora Remittances: A $100B Opportunity', url: 'https://afridigest.com/diaspora-remittances-africa-100-billion-opportunity/' },
      ],
    },
  },
  {
    year: '2026',
    events: ['Diaspora fintech frontier', 'AI-driven coordination', 'Beyond remittances era'],
    expandedContent: {
      title: 'The Coordination Era',
      description: 'By 2026, the African diaspora has become fintech\'s next growth frontier — moving beyond remittances into wealth management, diaspora banking, and cross-border business services at global scale. AI is compressing returns to labor in high-income economies, accelerating diaspora reconnection with Africa. Platforms like DNA are transforming scattered individual efforts into coordinated collective power — turning the $100 billion remittance flow into strategic partnerships, shared knowledge, and investment that unlocks Africa\'s full potential.',
      sources: [
        { label: 'Africa Fintech Summit — 2026 Diaspora Growth Frontier', url: 'https://www.facebook.com/AfricaFintechSummit/posts/2026-the-african-diaspora-becomes-fintechs-next-growth-frontierbeyond-remittance/1182989164006000/' },
        { label: 'Canary Compass — The 2026 Inflection', url: 'https://canarycompass.substack.com/p/the-2026-inflection' },
        { label: 'TransUnion Africa — Succeeding in FinTech in Africa 2026', url: 'https://www.transunionafrica.com/lp/succeeding-in-fintech-in-africa-2026' },
      ],
    },
  },
];
