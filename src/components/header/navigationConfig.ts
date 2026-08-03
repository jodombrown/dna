import { MESSAGING_ENABLED } from '@/config/featureFlags';

export type PublicNavItem = {
  name: string;
  path: string;
  featured?: boolean;
  badge?: string;
};

// Five C's marketing pages temporarily removed from public nav pending redesign.
export const publicNavItems: PublicNavItem[] = [];

export const aboutUsDropdown = [
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

// Main navigation for authenticated users - Pillar-based structure (5 C's)
export const mainNavItems = [
  { name: 'Home', path: '/dna/feed', icon: 'Home' },
  { name: 'Discover', path: '/dna/connect/discover', icon: 'Search' },
  { name: 'Connect', path: '/dna/connect/network', icon: 'Users2' },
  { name: 'Convene', path: '/dna/convene/events', icon: 'Calendar' },
  // BD063 hide-and-freeze: Messages hidden while DM/group messaging is OUT at v0.0.
  ...(MESSAGING_ENABLED
    ? [{ name: 'Messages', path: '/dna/connect/messages', icon: 'MessageCircle' }]
    : []),
  { name: 'Contribute', path: '/dna/contribute', icon: 'Briefcase' },
];

// Pillar-based navigation structure
export const pillarNavigation = {
  discover: {
    label: 'Discover',
    icon: 'Compass',
    items: [
      { name: 'Members', path: '/dna/connect/discover' },
      { name: 'Feed', path: '/dna/feed' },
    ],
  },
  connect: {
    label: 'Connect',
    icon: 'Users',
    items: [
      { name: 'Network', path: '/dna/connect/network' },
      { name: 'Diaspora Map', path: '/dna/connect/map' },
      { name: 'Feed', path: '/dna/feed' },
      // BD063 hide-and-freeze: Messages hidden while DM/group messaging is OUT at v0.0.
      ...(MESSAGING_ENABLED ? [{ name: 'Messages', path: '/dna/messages' }] : []),
    ],
  },
  convene: {
    label: 'Convene',
    icon: 'Calendar',
    items: [
      { name: 'Events', path: '/dna/convene/events' },
    ],
  },
  contribute: {
    label: 'Contribute',
    icon: 'Heart',
    items: [
      { name: 'Marketplace', path: '/dna/contribute' },
    ],
  },
  convey: {
    label: 'Convey',
    icon: 'BookOpen',
    items: [
      { name: 'Stories', path: '/dna/convey' },
    ],
  },
};

// Example pages for landing page showcase (Five C's marketing pages temporarily hidden).
export const examplePages: { name: string; path: string }[] = [];
