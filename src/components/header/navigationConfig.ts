
export const publicNavItems = [
  { name: 'About Us', path: '/about' },
  { name: 'Connect', path: '/connect' },
  { name: 'Convene', path: '/convene' },
  { name: 'Collaborate', path: '/collaborate' },
  { name: 'Contribute', path: '/contribute' },
  { name: 'Convey', path: '/convey' },
  { name: 'Contact', path: '/contact' },
];

// Main navigation for authenticated users (feed-focused like LinkedIn)
export const mainNavItems = [
  { name: 'Feed', path: '/dna/feed', icon: 'Home' },
  { name: 'My DNA', path: '/dna/me', icon: 'User' },
  { name: 'Connect', path: '/dna/connect', icon: 'Users' },
  { name: 'Network', path: '/dna/network', icon: 'Users2' },
  { name: 'Events', path: '/dna/events', icon: 'Calendar' },
  { name: 'Messages', path: '/dna/messages', icon: 'MessageCircle' },
  { name: 'Impact', path: '/dna/impact', icon: 'Briefcase' },
];

export const phases = [
  { name: 'Market Research', path: '/phase-1/market-research' },
  { name: 'Prototyping', path: '/phase-2/prototyping' },
  { name: 'Customer Discovery', path: '/phase-3/customer-discovery' },
  { name: 'MVP Build', path: '/phase-4/mvp' },
  { name: 'Beta Validation', path: '/phase-5/beta-validation' },
  { name: 'Go-to-Market', path: '/phase-6/go-to-market' },
] as const;

// Example pages for landing page showcase
export const examplePages = [
  { name: 'Connect', path: '/connect' },
  { name: 'Collaborate', path: '/collaborate' },
  { name: 'Contribute', path: '/contribute' },
];
