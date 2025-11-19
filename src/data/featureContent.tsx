import { Users2, Calendar, FolderOpen, Heart, Megaphone } from "lucide-react";

export interface FeatureContent {
  hero: {
    title: string;
    oneLiner: string;
    whoItsFor: string;
  };
  whatItIs: string;
  whatYouCanDo: string[];
  howItWorks: string[];
  stepByStep: {
    title: string;
    steps: string[];
  }[];
  examples: {
    title: string;
    description: string;
  }[];
  relatedFeatures: {
    name: string;
    description: string;
    icon: any;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const featureContentBySlug: Record<string, FeatureContent> = {
  connect: {
    hero: {
      title: "DNA | CONNECT",
      oneLiner:
        "CONNECT is the part of DNA that helps you find people across the African world — and turn those connections into real conversations, collaborations, and opportunities.",
      whoItsFor:
        "Members of the global African diaspora and allies who want to meet others who share their story, skills, or commitment to African futures.",
    },
    whatItIs:
      "CONNECT is DNA's relationship layer. It's where you tell your story through your profile, discover people with shared heritage, interests, and focus areas, and build a network that can activate around projects, events, and contributions. If DNA is a mobilization engine, CONNECT is 'who's in the engine with you' — and how you start building trust.",
    whatYouCanDo: [
      "Create a rich profile so people know who you are, where you're from, and what you care about.",
      "Discover members based on location, heritage, skills, and focus areas.",
      "Send connection requests and start conversations with people you want to know.",
      "Follow network activity through the CONNECT feed as people join spaces, attend events, and contribute.",
      "Stay safe and intentional with blocking and privacy controls that respect your boundaries.",
    ],
    howItWorks: [
      "Profiles first: We prioritize members who have filled out key parts of their profile, so you're more likely to meet people who are actually here to connect.",
      "Relevance over randomness: As you join spaces, attend events, and contribute, CONNECT surfaces people whose paths overlap with yours.",
      "Safety by design: You will never see people you've blocked, and we respect privacy settings across the platform.",
      "Diaspora-aware: CONNECT takes into account diaspora locations, heritage, and focus areas so you can see both local and cross-border possibilities.",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA:",
        steps: [
          "Complete at least 40% of your profile. Add your name, location, heritage, skills, and focus areas.",
          "Browse the CONNECT feed. Get a feel for who's here and what people are doing.",
          "Search for members in your city, region, or focus area — for example, 'Lagos', 'climate', or 'creative industries'.",
          "Send a few intentional connection requests with a short note about why you're reaching out.",
        ],
      },
      {
        title: "If you already know people in the diaspora:",
        steps: [
          "Connect with people you already collaborate with so your existing network has a home on DNA.",
          "Invite them into relevant spaces or events, so your network can plug into live opportunities.",
          "Use CONNECT to bridge regions — for example, introduce a founder in Nairobi to a mentor in London.",
        ],
      },
      {
        title: "If you're building something (a project, space, or company):",
        steps: [
          "Clarify what you're looking for in your profile headline and focus areas (e.g. 'Kenyan founder building a fintech product' or 'Ghanaian designer supporting climate projects').",
          "Search for people with complementary skills (e.g. engineers, organizers, investors).",
          "Follow up through messages and spaces so your connections turn into working relationships.",
        ],
      },
    ],
    examples: [
      {
        title: "You join DNA from Accra",
        description:
          "You set up your profile, mark 'Ghanaian' and 'Creative Industries' as focus areas, and follow the CONNECT feed. You spot a community organizer in London working on an arts exchange program. You connect, join their space, and eventually help co-design a Ghana–UK creative residency.",
      },
      {
        title: "You're in Atlanta looking to support founders in Lagos",
        description:
          "You search for 'Lagos' and 'startups', filter by 'Entrepreneurs & Builders', and discover a few early-stage founders. You connect, attend an online convening they're hosting, and end up mentoring one of the teams.",
      },
      {
        title: "You're already part of a DNA space and want to meet more people around that topic",
        description:
          "From your space, you click into member profiles, see shared skills and focus areas, and use CONNECT to deepen those relationships beyond one project.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT Feed",
        description: "Your activity homebase, showing what your network is doing across the 5Cs.",
        icon: Users2,
      },
      {
        name: "Discover",
        description: "A focused way to explore members and spaces aligned with your interests.",
        icon: Users2,
      },
      {
        name: "Messages",
        description: "Where 1:1 and small group conversations happen.",
        icon: Users2,
      },
      {
        name: "Spaces",
        description: "The communities and project hubs where your connections take shape.",
        icon: FolderOpen,
      },
      {
        name: "Events (CONVENE)",
        description: "Gatherings you can attend with people you've connected with.",
        icon: Calendar,
      },
      {
        name: "Contributions (CONTRIBUTE)",
        description: "Where your network turns into support for real needs.",
        icon: Heart,
      },
    ],
    faqs: [
      {
        question: "Is CONNECT like LinkedIn?",
        answer:
          "CONNECT is inspired by professional networks, but it's built specifically for the global African diaspora and allies. It's less about generic networking and more about mobilizing around African futures — through spaces, events, projects, and contributions.",
      },
      {
        question: "Who can see my profile?",
        answer:
          "By default, members of DNA can see the core parts of your profile needed for connection and collaboration. You can adjust what you share, and you can always block users if you ever feel uncomfortable.",
      },
      {
        question: "Why can't I send connection requests yet?",
        answer:
          "To keep the network meaningful, we may require your profile to reach a minimum completeness (for example, 40%) before you can send connection requests. This helps everyone know who they're connecting with.",
      },
      {
        question: "How does DNA keep connections safe and respectful?",
        answer:
          "We combine community guidelines, blocking tools, and activity monitoring to reduce harmful behavior. Members who abuse the platform can be restricted or removed.",
      },
      {
        question: "Do I have to connect with people in my country only?",
        answer:
          "No. CONNECT is built for cross-border connections — you can connect locally, regionally, and globally across the African world.",
      },
    ],
  },
};
