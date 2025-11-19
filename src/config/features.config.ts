export type FeatureStatus = "live" | "beta" | "coming-soon";

export type FeaturePillar =
  | "Connect"
  | "Convene"
  | "Collaborate"
  | "Contribute"
  | "Convey"
  | "Platform";

export interface FeatureSummary {
  slug: string;
  name: string;
  pillar: FeaturePillar;
  category: "Pillar" | "Feature" | "System";
  status: FeatureStatus;
  shortTagline: string;
  oneLiner: string;
  audience: string[];
  overviewOrder: number;
}

export const features: FeatureSummary[] = [
  {
    slug: "connect",
    name: "DNA | CONNECT",
    pillar: "Connect",
    category: "Pillar",
    status: "live",
    shortTagline: "Find your people across the global African diaspora.",
    oneLiner:
      "CONNECT helps you discover, connect, and build with people who share your heritage, skills, and commitment to African futures.",
    audience: ["Members", "Partners", "Ecosystem Builders"],
    overviewOrder: 1,
  },
  {
    slug: "connect-feed",
    name: "CONNECT Feed",
    pillar: "Connect",
    category: "Feature",
    status: "live",
    shortTagline: "Your multi-pillar activity home.",
    oneLiner:
      "The CONNECT Feed is where updates, events, spaces, contributions, and stories come together in one view.",
    audience: ["Members"],
    overviewOrder: 2,
  },
  {
    slug: "convene",
    name: "DNA | CONVENE",
    pillar: "Convene",
    category: "Pillar",
    status: "live",
    shortTagline: "Host and discover gatherings that move the diaspora from talk to action.",
    oneLiner:
      "CONVENE helps you create and promote events for your community or project, and helps people find convenings by theme, format, and location.",
    audience: ["Members", "Event Organizers", "Community Leaders"],
    overviewOrder: 3,
  },
  {
    slug: "collaborate",
    name: "DNA | COLLABORATE",
    pillar: "Collaborate",
    category: "Pillar",
    status: "beta",
    shortTagline: "Turn ideas into organized, trackable projects.",
    oneLiner:
      "COLLABORATE lets you create projects, tasks, and workspaces for your initiatives, keeping teams aligned with shared boards, updates, and milestones.",
    audience: ["Members", "Project Leaders", "Teams"],
    overviewOrder: 4,
  },
  {
    slug: "contribute",
    name: "DNA | CONTRIBUTE",
    pillar: "Contribute",
    category: "Pillar",
    status: "beta",
    shortTagline: "Match resources to real needs on the continent and across the diaspora.",
    oneLiner:
      "CONTRIBUTE helps you post needs for skills, funding, and support, and offer what you have to see where you've made a difference.",
    audience: ["Members", "Funders", "Organizations"],
    overviewOrder: 5,
  },
  {
    slug: "convey",
    name: "DNA | CONVEY",
    pillar: "Convey",
    category: "Pillar",
    status: "live",
    shortTagline: "Turn activity into stories that inspire more action.",
    oneLiner:
      "CONVEY helps you share updates, highlights, and wins from across DNA, showing the network what's working and where to plug in.",
    audience: ["Members", "Storytellers", "Community Leaders"],
    overviewOrder: 6,
  },
  {
    slug: "onboarding",
    name: "New Member Onboarding",
    pillar: "Platform",
    category: "System",
    status: "live",
    shortTagline: "Welcome to DNA — your guided first steps.",
    oneLiner:
      "Onboarding helps new members feel at home immediately — guiding them to complete their profile, join their first spaces, make their first connections, and discover where they belong.",
    audience: ["New Members", "All Users"],
    overviewOrder: 20,
  },
];
