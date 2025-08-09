
export const publicNavItems = [
  { name: 'About Us', path: '/about' },
  { name: 'Connect', path: '/connect' },
  { name: 'Collaborate', path: '/collaborate' },
  { name: 'Contribute', path: '/contribute' },
  { name: 'Contact', path: '/contact' },
];

// Main navigation for authenticated users (feed-focused like LinkedIn)
export const mainNavItems = [
  { name: 'Feed', path: '/feed', icon: 'MessageSquare' },
  { name: 'Connect', path: '/connect', icon: 'Users' },
  { name: 'Messages', path: '/messages', icon: 'MessageCircle' },
  { name: 'Notifications', path: '/notifications', icon: 'Bell' },
];

export const phases = [
  { name: 'Market Research', path: '/phase-1/market-research', phase: 1, timeline: 'Jun - Sep 2025' },
  { name: 'Prototyping', path: '/phase-2/prototyping', phase: 2, timeline: 'Oct - Dec 2025' },
  { name: 'Customer Discovery', path: '/phase-3/customer-discovery', phase: 3, timeline: 'Jan - Feb 2026' },
  { name: 'MVP Build', path: '/phase-4/mvp', phase: 4, timeline: 'Mar - Jul 2026' },
  { name: 'Beta Validation', path: '/phase-5/beta-validation', phase: 5, timeline: 'Aug 2026' },
  { name: 'Go-to-Market', path: '/phase-6/go-to-market', phase: 6, timeline: 'Sep 2026+' },
];

// Example pages for landing page showcase
export const examplePages = [
  { name: 'Connect', path: '/connect' },
  { name: 'Collaborate', path: '/collaborate' },
  { name: 'Contribute', path: '/contribute' },
];
