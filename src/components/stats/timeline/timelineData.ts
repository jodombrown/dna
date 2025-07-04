export interface TimelineDataItem {
  year: string;
  events: string[];
  expandedContent: {
    title: string;
    description: string;
  };
}

export const timelineData: TimelineDataItem[] = [
  {
    year: '2014',
    events: ['Remittances: $71B', 'Digital banking emergence', 'First diaspora investment funds'],
    expandedContent: {
      title: 'The Foundation Year',
      description: 'In 2014, the diaspora landscape was undergoing a quiet revolution. With $71 billion flowing through remittance channels, families across developing nations were receiving lifelines from loved ones abroad. This was the year digital banking began its emergence from the shadows of traditional money transfer systems, while pioneering communities established the first diaspora investment funds. These early funds represented more than financial instruments, they were symbols of collective ambition, diaspora communities pooling resources to invest in their homelands\' futures.'
    }
  },
  {
    year: '2016',
    events: ['Remittances: $80B', 'Mobile money expansion', '100+ diaspora organizations'],
    expandedContent: {
      title: 'The Mobile Money Revolution',
      description: 'Two years later, remittances had grown to $80 billion, but the real story was happening in the palm of people\'s hands. Mobile money was expanding rapidly across continents, transforming how a farmer in rural Kenya could receive money from a son working in London, or how a domestic worker in Dubai could instantly support her family in the Philippines. Over 100 diaspora organizations had sprouted worldwide, creating networks of support that extended far beyond financial transfers to encompass cultural preservation, advocacy, and community building.'
    }
  },
  {
    year: '2018',
    events: ['Remittances: $90B', '250+ organizations', 'Tech startup boom begins'],
    expandedContent: {
      title: 'The Tech Startup Boom',
      description: 'By 2018, with $90 billion in remittances flowing globally, the sector was experiencing its own Silicon Valley moment. Over 250 organizations were now operating in this space, and tech startups were beginning to boom with innovative solutions. Young entrepreneurs, many from diaspora communities themselves, were building apps and platforms that promised to make sending money home faster, cheaper, and more transparent. This wasn\'t just about technology, it was about dignity, ensuring that hard-earned money reached families without excessive fees or delays.'
    }
  },
  {
    year: '2020',
    events: ['COVID-19 resilience', 'Digital transformation', 'Virtual collaboration tools'],
    expandedContent: {
      title: 'Resilience in Crisis',
      description: 'The year 2020 tested everything. As COVID-19 swept across the globe, economists predicted remittance flows would collapse. Instead, they demonstrated remarkable resilience. Diaspora communities, even while facing their own economic uncertainties, continued supporting families back home who were often in even more precarious situations. Digital transformation accelerated out of necessity, virtual collaboration tools became lifelines not just for business meetings, but for maintaining the emotional and financial connections that bind diaspora communities to their origins.'
    }
  },
  {
    year: '2022',
    events: ['Remittances: $95B', 'Fintech revolution', '1000+ active projects'],
    expandedContent: {
      title: 'The Fintech Revolution Matures',
      description: 'With remittances reaching $95 billion, 2022 marked the maturation of the fintech revolution in this space. Over 1,000 active projects were now operating, creating an ecosystem where sending money internationally was becoming as simple as sending a text message. Blockchain technology and cryptocurrency solutions were gaining traction, promising even greater efficiency and lower costs. The diaspora had become early adopters of financial technology, driven by necessity and enabled by innovation.'
    }
  },
  {
    year: '2024',
    events: ['Remittances: $100B+', '40% return migration increase', 'AI-powered platforms'],
    expandedContent: {
      title: 'The AI-Powered Future',
      description: 'As remittances surpassed $100 billion, 2024 brought artificial intelligence into the equation. AI-powered platforms began optimizing transfer routes, predicting the best times to send money based on exchange rate fluctuations, and improving compliance with international regulations. Perhaps most significantly, there was a 40% increase in return migration patterns. Diaspora members were beginning to move back to their countries of origin, armed with skills, capital, and networks developed abroad. The story had come full circle: from leaving home to send money back, to returning home to build the future directly.'
    }
  }
];