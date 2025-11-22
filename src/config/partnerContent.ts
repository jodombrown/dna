export type FiveCContent = {
  id: string;
  title: string;
  description: string;
};

export const fiveCsContent: FiveCContent[] = [
  {
    id: 'connect',
    title: 'CONNECT',
    description: 'Map your people, partners, talent, and opportunities across the diaspora and the continent, then build the relationships that make everything else possible.'
  },
  {
    id: 'convene',
    title: 'CONVENE',
    description: 'Host gatherings, missions, workshops, roundtables, and events that activate participation and spark collaboration.'
  },
  {
    id: 'collaborate',
    title: 'COLLABORATE',
    description: 'Co-create programs, pilots, policy labs, pipelines, and impact projects with a structured workspace designed for execution.'
  },
  {
    id: 'contribute',
    title: 'CONTRIBUTE',
    description: 'Mobilize capital, mentorship, skills, research, data, access, and community support where they are needed most.'
  },
  {
    id: 'convey',
    title: 'CONVEY',
    description: 'Tell the story. Showcase outcomes, document lessons, and inspire the next wave of diaspora action.'
  }
];

export const partnerPageContent = {
  hero: {
    headline: 'Partner With DNA: Mobilize What\'s Possible for Africa and the Diaspora',
    subheadline: 'Every sector wants to unlock impact across the African world, but no single institution can do it alone. DNA gives leaders a shared home to connect people, align efforts, and turn good intentions into coordinated action through a 5C engine built for our global community.',
    // TODO: Replace with AI-generated image representing global African diaspora network with connected hubs
    heroImageUrl: undefined,
    heroImageAlt: 'Global African diaspora network visualization'
  },
  whyPartner: {
    title: 'Why Partner With DNA?',
    problem: 'Every leader who cares about Africa feels the same pressure: the talent is scattered, the opportunities are fragmented, and the systems to bring people together simply aren\'t built yet. Governments, companies, universities, investors, and NGOs all see the potential, but coordinating across borders, time zones, and institutions is exhausting.',
    solution: 'DNA solves the coordination problem. We connect the diaspora and the continent through one mobilization engine, giving partners a shared platform to map talent, run programs, launch initiatives, mobilize resources, and tell the story of what\'s being built. No need to create infrastructure from scratch. No more working in silos.',
    values: [
      {
        title: 'Access to a Global African Network',
        description: 'Verified talent, institutions, and partners across the diaspora and the continent, all discoverable in one place.'
      },
      {
        title: 'A Shared Platform for Cross-Sector Alignment',
        description: 'Bring together government, private sector, education, NGOs, and communities around clear pathways for collaboration.'
      },
      {
        title: 'A 5C Engine That Turns Ideas Into Action',
        description: 'Move from connection → gathering → collaboration → contribution → storytelling in one continuous loop.'
      },
      {
        title: 'Execution Infrastructure You Can Plug Into',
        description: 'Programs, spaces, pipelines, and tools that reduce friction and accelerate implementation.'
      },
      {
        title: 'A Narrative Layer That Showcases Your Impact',
        description: 'Share your progress, outcomes, and lessons with a global audience inspired to build alongside you.'
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
        description: 'Use DNA\'s platform, spaces, pipelines, and tools instead of building your own from scratch.'
      },
      {
        title: 'Cross-Sector Mobilization',
        description: 'Engage talent and institutions across government, industry, academia, civil society, and the diaspora.'
      },
      {
        title: 'Execution Support',
        description: 'Co-design programs, run initiatives, and manage collaborations with guidance from the DNA team.'
      },
      {
        title: 'Global Visibility',
        description: 'Your work becomes part of a global narrative about Africa\'s progress, shared across the diaspora and the world.'
      }
    ]
  }
};

export const onboardingSteps = [
  {
    number: 1,
    title: 'Explore Your Sector',
    description: 'See how organizations like yours use DNA to mobilize their communities and create impact across the 5Cs.'
  },
  {
    number: 2,
    title: 'Review Partnership Models',
    description: 'Choose a structure that matches your goals, capacity, and timeline, from city partnerships to innovation pipelines.'
  },
  {
    number: 3,
    title: 'Submit a Partnership Form',
    description: 'Share your priorities, challenges, and the outcomes you want to unlock. This helps us understand where to begin.'
  },
  {
    number: 4,
    title: 'Join DNA',
    description: 'Create your DNA account so your team can connect, convene, collaborate, and contribute inside the platform.'
  },
  {
    number: 5,
    title: 'Co-Design an Initiative',
    description: 'Work with our team to shape a program, project, or pathway that aligns your objectives with the broader diaspora ecosystem.'
  }
];
