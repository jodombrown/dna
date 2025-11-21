export type FiveCContent = {
  id: string;
  title: string;
  description: string;
};

export const fiveCsContent: FiveCContent[] = [
  {
    id: 'connect',
    title: 'CONNECT',
    description: 'Discover and engage with diaspora professionals, investors, and organizations aligned with your mission.'
  },
  {
    id: 'convene',
    title: 'CONVENE',
    description: 'Host events, forums, and convenings that bring stakeholders together around shared priorities.'
  },
  {
    id: 'collaborate',
    title: 'COLLABORATE',
    description: 'Co-create programs, initiatives, and ventures with partners across sectors and geographies.'
  },
  {
    id: 'contribute',
    title: 'CONTRIBUTE',
    description: 'Channel resources—capital, expertise, advocacy—toward high-impact opportunities and needs.'
  },
  {
    id: 'convey',
    title: 'CONVEY',
    description: 'Share stories, insights, and progress to inspire action and build the narrative of diaspora impact.'
  }
];

export const partnerPageContent = {
  hero: {
    headline: 'Partner With DNA — Build What\'s Possible for Africa and the Diaspora',
    subheadline: 'Across continents and sectors, leaders want to create impact. DNA gives everyone a home to connect, co-create, and mobilize — powered by a 5C engine built for the African world.',
    // TODO: Replace with AI-generated image representing global African diaspora network with connected hubs
    heroImageUrl: undefined,
    heroImageAlt: 'Global African diaspora network visualization'
  },
  whyPartner: {
    title: 'Why Partner With DNA?',
    problem: 'Leaders across sectors—governments, corporations, universities, NGOs—want to engage the African diaspora. But fragmented networks, unclear pathways, and limited coordination make it hard to create sustained impact.',
    solution: 'DNA provides a shared platform where partners can mobilize diaspora talent, capital, and networks—without building infrastructure from scratch.',
    values: [
      {
        title: 'Global Network',
        description: 'Access a curated community of diaspora professionals, investors, and organizations across continents.'
      },
      {
        title: 'Shared Platform',
        description: 'No need to build your own infrastructure—leverage DNA\'s proven tools and systems.'
      },
      {
        title: '5C Mobilization Engine',
        description: 'Use our framework to CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, and CONVEY.'
      },
      {
        title: 'Coordination Layer',
        description: 'We help you design, launch, and scale programs that work across sectors and geographies.'
      },
      {
        title: 'Narrative Layer',
        description: 'Your partnership becomes part of the larger story of diaspora-Africa collaboration.'
      }
    ],
    // TODO: Replace with AI-generated image illustrating the 5C mobilization engine loop
    imageUrl: undefined,
    imageAlt: '5C Mobilization Engine visual diagram'
  },
  advantage: {
    title: 'The DNA Partnership Advantage',
    items: [
      {
        title: 'Shared Infrastructure',
        description: 'Don\'t build a diaspora platform from scratch—leverage ours. We provide the digital backbone, community management, and program tools so you can focus on impact.'
      },
      {
        title: 'Cross-Sector Mobilization',
        description: 'Partner with governments, corporations, universities, NGOs, and investors—all working together on a single platform.'
      },
      {
        title: 'Execution Support',
        description: 'From program design to event production to storytelling, our team helps you launch and scale initiatives that work.'
      },
      {
        title: 'Global Visibility',
        description: 'Your partnership gets amplified across our network and through our content—building your brand while driving impact.'
      }
    ]
  }
};

export const onboardingSteps = [
  {
    number: 1,
    title: 'Explore Your Sector',
    description: 'Review how DNA works with partners in your sector—from governments to corporations to universities.'
  },
  {
    number: 2,
    title: 'Review Partnership Models',
    description: 'Understand the different ways to partner with DNA, from national hubs to innovation ecosystems.'
  },
  {
    number: 3,
    title: 'Submit a Partnership Form',
    description: 'Tell us about your organization, goals, and what you\'re hoping to accomplish together.'
  },
  {
    number: 4,
    title: 'Join DNA',
    description: 'Create your account and start connecting with the diaspora network immediately.'
  },
  {
    number: 5,
    title: 'Co-Design an Initiative',
    description: 'Work with our team to design a pilot program, event, or long-term partnership.'
  }
];
