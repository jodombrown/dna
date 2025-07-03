
export const publicNavItems = [
  { name: 'About Us', path: '/about' },
  { name: 'Connect', path: '/connect-example' },
  { name: 'Collaborate', path: '/collaborate-example' },
  { name: 'Contribute', path: '/contribute-example' },
  { name: 'Contact', path: '/contact' },
];

// Main navigation for authenticated users (feed-focused like LinkedIn)
export const mainNavItems = [
  { name: 'Feed', path: '/feed', icon: 'MessageSquare' },
  { name: 'Connect', path: '/connect', icon: 'Users' },
  { name: 'Communities', path: '/communities', icon: 'Users2' },
  { name: 'Messages', path: '/messages', icon: 'MessageCircle' },
  { name: 'Notifications', path: '/notifications', icon: 'Bell' },
];

export const phases = [
  { name: 'Market Research', path: '/phase/market-research', phase: 1, timeline: 'Jun - Sep 2025' },
  { name: 'Prototyping', path: '/phase/prototyping', phase: 2, timeline: 'Oct - Dec 2025' },
  { name: 'Customer Discovery', path: '/phase/customer-discovery', phase: 3, timeline: 'Jan - Feb 2026' },
  { name: 'MVP Build', path: '/phase/mvp', phase: 4, timeline: 'Mar - Jul 2026' },
  { name: 'Beta Validation', path: '/phase/beta-validation', phase: 5, timeline: 'Aug 2026' },
  { name: 'Go-to-Market', path: '/phase/go-to-market', phase: 6, timeline: 'Sep 2026+' },
];

// Example pages for landing page showcase
export const examplePages = [
  { name: 'Connect Example', path: '/connect-example' },
  { name: 'Collaborate Example', path: '/collaborate-example' },
  { name: 'Contribute Example', path: '/contribute-example' },
];
