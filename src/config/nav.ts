import {
  Home, Compass, Users, MessageSquare, Calendar, Puzzle, Briefcase,
  LayoutGrid, Bookmark, HandHeart, BookOpen, HandCoins, Medal, Bell,
  UserCircle, Settings, LifeBuoy, ShieldPlus, Plus
} from "lucide-react";

export type Role = "user" | "moderator" | "admin" | "curator";

export type NavItem = {
  key: string;
  label: string;
  icon?: any;
  path?: string;
  badgeKey?: "notifications" | "messages" | "opportunities" | "projects";
  roles?: Role[];               // if omitted => visible to all
  children?: NavItem[];         // nested pages
  pillar?: "connect" | "collaborate" | "contribute";
};

export const NAV: NavItem[] = [
  { key: "home", label: "Home", icon: Home, path: "/dna" },
  { key: "discover", label: "Discover", icon: Compass, path: "/discover" },

  {
    key: "connect", label: "Connect", icon: Users, pillar: "connect",
    children: [
      { key: "people", label: "People", icon: Users, path: "/connect/people" },
      { key: "communities", label: "Communities", icon: LayoutGrid, path: "/connect/communities" },
      { key: "messages", label: "Messages", icon: MessageSquare, path: "/connect/messages", badgeKey: "messages" },
      { key: "events", label: "Events", icon: Calendar, path: "/connect/events" },
    ]
  },

  {
    key: "collaborate", label: "Collaborate", icon: Puzzle, pillar: "collaborate",
    children: [
      { key: "projects", label: "Projects", icon: Briefcase, path: "/collaborate/projects", badgeKey: "projects" },
      { key: "opportunities", label: "Opportunities", icon: HandHeart, path: "/collaborate/opportunities", badgeKey: "opportunities" },
      { key: "workspaces", label: "Workspaces", icon: LayoutGrid, path: "/collaborate/workspaces" },
      { key: "saved", label: "Saved", icon: Bookmark, path: "/collaborate/saved" },
    ]
  },

  {
    key: "contribute", label: "Contribute", icon: HandHeart, pillar: "contribute",
    children: [
      { key: "resources", label: "Resources", icon: BookOpen, path: "/contribute/resources" },
      { key: "funding", label: "Funding", icon: HandCoins, path: "/contribute/funding" },
      { key: "impact", label: "Impact Log", icon: Medal, path: "/contribute/impact" },
    ]
  },

  { key: "notifications", label: "Notifications", icon: Bell, path: "/notifications", badgeKey: "notifications" },
  { key: "profile", label: "Profile", icon: UserCircle, path: "/me" },
  { key: "settings", label: "Settings", icon: Settings, path: "/settings" },
  { key: "help", label: "Help & Feedback", icon: LifeBuoy, path: "/help" },

  {
    key: "admin", label: "Admin", icon: ShieldPlus, roles: ["admin", "moderator", "curator"],
    children: [
      { key: "moderation", label: "Moderation", path: "/admin/moderation" },
      { key: "spotlight", label: "Spotlight & Curation", path: "/admin/spotlight" },
      { key: "analytics", label: "Analytics", path: "/admin/analytics" },
      { key: "cms", label: "CMS / Content", path: "/admin/cms" },
    ]
  },
];

// Primary CTA (global)
export const PRIMARY_CTA = { key: "create", label: "Create", icon: Plus, actions: [
  { key: "post", label: "Post", path: "/create/post" },
  { key: "opportunity", label: "Opportunity", path: "/create/opportunity" },
  { key: "event", label: "Event", path: "/create/event" },
  { key: "project", label: "Project", path: "/create/project" },
]};