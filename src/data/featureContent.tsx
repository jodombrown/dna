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
  spaces: {
    hero: {
      title: "DNA | Spaces",
      oneLiner: "Spaces are the home for communities, projects, and initiatives on DNA — where people gather, work, contribute, and grow together.",
      whoItsFor: "Members, organizers, founders, project leads, community builders, programs, and teams across the global African diaspora."
    },
    whatItIs: `Most platforms treat groups or communities as isolated islands.
But in DNA, Spaces are something deeper:

**Spaces are living hubs where the 5Cs come together** — Connect, Convene, Collaborate, Contribute, and Convey.

A Space can be:
- A community
- A project
- A venture
- A program
- A cause
- A creative collective
- A research group
- A diaspora-interest hub
- A local chapter or global network

Whatever the form, a Space gives people a place to belong, build, and mobilize.`,
    whatYouCanDo: [
      "Build community with people who share your interests, heritage, or mission",
      "Create and manage projects through COLLABORATE",
      "Post needs and offers through CONTRIBUTE",
      "Host events through CONVENE",
      "Share updates and tell stories through CONVEY",
      "Create recurring routines (weekly standups, monthly gatherings, project sprints)",
      "Invite members who can help or contribute",
      "Track progress through tasks, analytics, and updates",
      "Organize your ecosystem across regions, industries, and causes",
      "Make your work visible to the broader diaspora"
    ],
    howItWorks: [
      "Each Space has roles: Lead, Contributor, Member, Follower",
      "Permissions adapt — Leads create events, tasks, and needs; Contributors support; Members participate",
      "Privacy settings determine visibility: Public / Private / Invite-only",
      "Activities inside a Space flow out into the CONNECT Feed and CONVEY",
      "ADIN uses Space activity to personalize recommendations",
      "Spaces integrate all 5Cs, so members don't have to jump between tools",
      "Tasks, events, needs, and updates are all tied back to a Space, so context is always clear",
      "Spaces grow naturally as more collaborators join or contribute"
    ],
    stepByStep: [
      {
        title: "If you're starting a new Space",
        steps: [
          "Choose a clear name that shows purpose ('Diaspora Creators Hub', 'Ghana Climate Tech', etc.)",
          "Add a strong description — what the Space is for, who it's for, and what success looks like",
          "Set the right visibility: Public for open communities, Private for focused teams, Invite-only for premium or sensitive groups",
          "Create your first project or event to give members something to engage with",
          "Post a welcome update to set the tone",
          "Invite your first ten people — enough to create momentum"
        ]
      },
      {
        title: "If you're joining a Space",
        steps: [
          "Introduce yourself or react to the latest update",
          "Look at open tasks or needs",
          "Follow other members you find interesting",
          "Join upcoming events or working sessions",
          "Share something — even a small insight or resource"
        ]
      },
      {
        title: "If you're running an active Space",
        steps: [
          "Use events and updates to keep people engaged",
          "Post regular progress summaries",
          "Validate contributions to recognize your supporters",
          "Create a healthy mix of tasks: easy wins + core milestones",
          "Use analytics to see what's working"
        ]
      }
    ],
    examples: [
      {
        title: "You start a Space for African EdTech builders",
        description: "You create the Space, add a description, post your first update, and create three tasks. Members from Ghana, Kenya, and the UK join within a week. Soon you're hosting monthly virtual meetups and shipping early prototypes."
      },
      {
        title: "You join a Space for African creatives in the diaspora",
        description: "You skim the updates, react to a story, and join the next meetup. A filmmaker in Joburg messages you, and you end up collaborating on a project. Your Space becomes the home for your creative journey."
      },
      {
        title: "You run a community project in Lagos",
        description: "Your Space organizes volunteers, posts event updates, and manages contributions. Members from abroad offer mentorship and funding. Progress is visible, and your initiative grows beyond your neighborhood."
      }
    ],
    relatedFeatures: [
      { name: "COLLABORATE", description: "Tasks, projects, boards, attachments", icon: FolderOpen },
      { name: "CONVENE", description: "Events tied to the Space", icon: Calendar },
      { name: "CONTRIBUTE", description: "Needs and offers connected to your mission", icon: Heart },
      { name: "CONVEY", description: "Updates, stories, and highlights", icon: Megaphone },
      { name: "CONNECT", description: "Members and collaborators inside the Space", icon: Users2 },
      { name: "CONNECT Feed", description: "Activity flows to your followers", icon: Users2 }
    ],
    faqs: [
      {
        question: "Are Spaces free to create?",
        answer: "Yes — any member can create a Space once their profile meets the basic completeness threshold."
      },
      {
        question: "What types of Spaces work best on DNA?",
        answer: "Communities, projects, initiatives, collectives, startups, diaspora groups, chapters, and thematic hubs."
      },
      {
        question: "Can Spaces be private?",
        answer: "Yes — Spaces can be Public, Private, or Invite-Only."
      },
      {
        question: "Can I run multiple projects inside one Space?",
        answer: "Absolutely. Spaces can have multiple projects, tasks, and events running simultaneously."
      },
      {
        question: "How do people discover my Space?",
        answer: "Through CONNECT recommendations, feed activity, search, events, and featured stories."
      },
      {
        question: "Can Spaces have multiple leads?",
        answer: "Yes — Leads can be shared for balanced governance."
      },
      {
        question: "Do Spaces support multimedia?",
        answer: "Yes — attachments, images, links, and more."
      }
    ]
  },
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
  convene: {
    hero: {
      title: "DNA | CONVENE",
      oneLiner:
        "CONVENE is where the diaspora comes together — online and in person — to learn, build, share, and activate.",
      whoItsFor:
        "Members, organizers, community builders, founders, and partners who want to bring people together around ideas, projects, opportunities, or cultural moments.",
    },
    whatItIs:
      "Sometimes people are ready, inspired, or curious… but they don't know where to show up. CONVENE solves that by giving the global African diaspora a place to gather at scale. CONVENE helps you host and discover gatherings that move people from interest → action. Whether it's a virtual meetup, a workshop, a panel, a festival, or a project sprint, you can create the space — and the network will find it. These gatherings become the beats of momentum inside DNA's mobilization engine. Every event is fuel for connection, collaboration, and contribution.",
    whatYouCanDo: [
      "Host gatherings for your Space, project, or community",
      "Discover events across regions, industries, and interests",
      "Use filters to find what matters: Virtual, In-Person, Hybrid",
      "Explore categories and themes like climate, creativity, startups, culture",
      "RSVP and check in, making your participation visible",
      "Follow organizers so you don't miss new events",
      "Join working sessions tied to COLLABORATE tasks",
      "Share recaps and highlights through CONVEY",
    ],
    howItWorks: [
      "All events belong to a Space, so context and community are always clear",
      "Organizers choose visibility: Public, Private, or Invite-Only",
      "ADIN personalizes recommendations, showing you events aligned to your interests",
      "Event activity flows into the CONNECT Feed, increasing visibility",
      "Event tags and focus areas help discovery, especially across regions",
      "Recaps push into CONVEY, keeping momentum going",
      "Check-ins matter — they help ADIN improve recommendations over time",
    ],
    stepByStep: [
      {
        title: "If you're attending",
        steps: [
          "Scroll the Events Hub to see what's happening this week",
          "Filter by 'Virtual' if you want global access",
          "RSVP to at least one event — movement starts with showing up",
          "Engage during the event or follow up with organizers",
          "Check out related Spaces or projects afterward",
          "Look for recap stories in CONVEY",
        ],
      },
      {
        title: "If you're organizing",
        steps: [
          "Choose a Space to host your event",
          "Create a clear title and purpose — 'What should people expect to leave with?'",
          "Select the right format: Virtual, In-Person, Hybrid",
          "Tag the event with topics so the right people find it",
          "Post a short pre-event update or invitation",
          "Host with intention — and post highlights afterward",
          "Turn attendees into members, contributors, or collaborators",
        ],
      },
      {
        title: "If you're running a community or program",
        steps: [
          "Create recurring events — monthly check-ins, weekly sprints, learning circles",
          "Use events as engagement anchors",
          "Post highlights in CONVEY",
          "Encourage attendees to introduce themselves in the Space",
          "Use events to direct people toward tasks, needs, or opportunities",
        ],
      },
    ],
    examples: [
      {
        title: "You're in London exploring African creative communities",
        description:
          "You browse the Events Hub and find a virtual 'AfroCreative Meetup.' You join, meet a filmmaker from Dakar, and follow their Space. That Space becomes your creative home on DNA.",
      },
      {
        title: "You're co-leading a tech project in Nairobi",
        description:
          "You host weekly design sprints using Events. Contributors from Lagos, Berlin, and Johannesburg join. Your event recaps in CONVEY spark new interest and grow your team.",
      },
      {
        title: "You're a community builder in Toronto",
        description:
          "You create a diaspora book club. Monthly meetups lead to friendships, collaborations, and new Spaces. Your consistent events build a vibrant little ecosystem inside DNA.",
      },
    ],
    relatedFeatures: [
      {
        name: "Spaces",
        description: "Every event belongs somewhere",
        icon: FolderOpen,
      },
      {
        name: "CONVENE Hub",
        description: "The global directory of gatherings",
        icon: Calendar,
      },
      {
        name: "CONNECT Feed",
        description: "Where event activity is surfaced",
        icon: Users2,
      },
      {
        name: "CONTRIBUTE",
        description: "Events often create opportunities for support",
        icon: Heart,
      },
      {
        name: "COLLABORATE",
        description: "Project working sessions live as events",
        icon: FolderOpen,
      },
      {
        name: "CONVEY",
        description: "Recaps and highlights keep the story alive",
        icon: Megaphone,
      },
      {
        name: "ADIN",
        description: "Personalization and relevance engine",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Can anyone create an event?",
        answer:
          "Yes — once your profile meets the integrity requirements and you are a Space Lead.",
      },
      {
        question: "Are events always public?",
        answer:
          "No. Organizers choose visibility: Public, Private, or Invite-Only.",
      },
      {
        question: "Do events support virtual links?",
        answer:
          "Yes — you can add Zoom, Google Meet, or custom links.",
      },
      {
        question: "How do people discover events?",
        answer:
          "Through: The Events Hub, CONNECT Feed, Space pages, Recommendations, and Filters and tags.",
      },
      {
        question: "Can events be recurring?",
        answer:
          "Yes — weekly, monthly, quarterly, or custom.",
      },
      {
        question: "Do events have analytics?",
        answer:
          "Leads can see RSVPs, check-ins, and general engagement.",
      },
      {
        question: "Are recordings supported?",
        answer:
          "Not yet — but you can link external recordings.",
      },
    ],
  },
  collaborate: {
    hero: {
      title: "DNA | COLLABORATE",
      oneLiner:
        "COLLABORATE turns ideas, teams, and projects into organized execution — with the tools to move from intention to impact.",
      whoItsFor:
        "Project leads, founders, community organizers, innovators, students, and anyone building something that needs structure and teamwork across the diaspora.",
    },
    whatItIs:
      "It's easy to get inspired. The hard part is bringing people together around the work — and keeping everything organized so momentum doesn't fade. COLLABORATE solves that. COLLABORATE is DNA's project engine. It gives you a place to create a project, gather people, break down tasks, track progress, share updates, and move real work forward — across borders, time zones, and communities. Whether you're building a startup, running a community initiative, managing a research project, or organizing a creative collaboration, this is where the work lives.",
    whatYouCanDo: [
      "Create project spaces for teams, programs, or initiatives.",
      "Break work into tasks with deadlines, owners, attachments, and statuses.",
      "Track progress visually with lists, boards, or milestones.",
      "Post updates, share context, and keep everyone aligned.",
      "Manage roles (Leads, Contributors, Members).",
      "Share resources and files through attachments.",
      "Use project analytics to see activity, bottlenecks, and team engagement.",
      "Connect team members with relevant skills, regions, or backgrounds using CONNECT.",
      "Run working sessions via CONVENE events linked to your project.",
    ],
    howItWorks: [
      "Projects live inside Spaces, which gives them structure and community support.",
      "Tasks can be assigned or unassigned, so new contributors can jump in anytime.",
      "Your activity influences recommendations, helping ADIN surface relevant collaborators.",
      "Contributions (skills, time, resources) inside a project can unlock badges and recognition.",
      "Progress is transparent, meaning anyone in your space can see where help is needed.",
      "Updates flow into CONVEY, turning your project's work into a story the network can follow.",
    ],
    stepByStep: [
      {
        title: "If you're starting a new project:",
        steps: [
          "Create a Space with a clear name, description, and purpose.",
          "Add collaborators or invite people through CONNECT.",
          "List out your first 5–10 tasks — small, clear, and easy to start.",
          "Assign owners or leave some tasks open for volunteers.",
          "Share an update so your team knows what's happening next.",
        ],
      },
      {
        title: "If you're joining someone else's project:",
        steps: [
          "Introduce yourself in the space or message the lead directly.",
          "Check the tasks board to find where you can add value.",
          "Join a working session if events are linked to the project.",
          "Share updates on what you're taking on or finishing.",
        ],
      },
      {
        title: "If you're running a growing team:",
        steps: [
          "Use dashboards or boards to keep work organized.",
          "Post regular updates so the team stays aligned.",
          "Host recurring check-ins using CONVENE.",
          "Celebrate wins and share progress through CONVEY.",
          "Invite contributors from CONNECT who have skills your project needs.",
        ],
      },
    ],
    examples: [
      {
        title: "You're building a pan-African storytelling project",
        description:
          "You create a space, add a few passionate writers, and drop your first set of tasks. A designer from Kigali sees your updates on the CONNECT feed and joins. Soon you're hosting weekly writing sessions through CONVENE — and pushing out stories through CONVEY.",
      },
      {
        title: "You're a founder in Nairobi prototyping an app",
        description:
          "You set up a project space, post your design tasks, and add your first collaborators. A UX designer in Stockholm jumps in after discovering your project. A developer from Accra contributes to key tasks, and within weeks, your MVP starts taking shape.",
      },
      {
        title: "You're organizing a community initiative in D.C.",
        description:
          "You create tasks for outreach, partnerships, and logistics. Contributors self-assign tasks as they join the space. You host weekly meetings, track everything inside COLLABORATE, and share recaps through CONVEY.",
      },
    ],
    relatedFeatures: [
      {
        name: "Spaces",
        description: "The home for projects and community build-outs.",
        icon: FolderOpen,
      },
      {
        name: "Tasks",
        description: "Your building blocks for execution.",
        icon: FolderOpen,
      },
      {
        name: "Updates & Highlights (CONVEY)",
        description: "Turn your work into visibility.",
        icon: Megaphone,
      },
      {
        name: "Contributions (CONTRIBUTE)",
        description: "Offer or request skills/resources tied to your project.",
        icon: Heart,
      },
      {
        name: "Events (CONVENE)",
        description: "Host working sessions, project kickoffs, and milestone reviews.",
        icon: Calendar,
      },
      {
        name: "CONNECT",
        description: "Meet potential contributors and collaborators.",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Do I need to be a project lead to use COLLABORATE?",
        answer:
          "No. Anyone can join a space, volunteer for tasks, or contribute to ongoing projects.",
      },
      {
        question: "What's the difference between a Space and a Project?",
        answer:
          "A Space is the community or container. A Project is the specific initiative inside that space. COLLABORATE sits inside Spaces to help those projects move.",
      },
      {
        question: "Can I invite collaborators who aren't on DNA?",
        answer:
          "Right now, they need a DNA account — but public collaboration options are planned.",
      },
      {
        question: "Can I manage private projects?",
        answer:
          "Yes. Spaces and projects can be public, private, or invite-only.",
      },
      {
        question: "Do tasks send notifications?",
        answer:
          "Owners receive notifications when tasks are assigned, updated, or completed.",
      },
      {
        question: "Does COLLABORATE include Kanban boards or analytics?",
        answer:
          "Yes — boards, lists, attachments, dependencies, and analytics are part of COLLABORATE's advanced toolset.",
      },
    ],
  },
  contribute: {
    hero: {
      title: "DNA | CONTRIBUTE",
      oneLiner:
        "CONTRIBUTE matches skills, resources, and support to real needs across the diaspora — turning goodwill into meaningful action.",
      whoItsFor:
        "Members, supporters, experts, partners, funders, and anyone who wants to offer something — time, knowledge, resources, or access — toward real opportunities and challenges.",
    },
    whatItIs:
      "People are eager to help. Organizations have needs. Projects get stuck because the right support isn't visible or accessible. CONTRIBUTE fixes that. CONTRIBUTE is DNA's matching layer — where needs are posted, offers are made, and contributions turn into momentum. Whether someone needs design help for a pitch deck, mentorship for a founder, support for a community event, or resources for a project, CONTRIBUTE creates the pathway. Every contribution leads to progress. Every offer builds trust. Every need shared strengthens the ecosystem.",
    whatYouCanDo: [
      "Post needs for skills, mentorship, funding, tools, partnerships, or support.",
      "Offer what they have — expertise, time, resources, introductions, or access.",
      "Respond to needs inside spaces and across the platform.",
      "Track and validate contributions, earning recognition and badges.",
      "See where they've made an impact through contribution history.",
      "Find opportunities aligned with their skills, experience, or interests.",
      "Activate Projects & Spaces by linking needs to specific initiatives.",
      "Mobilize support during events, launches, or community moments.",
    ],
    howItWorks: [
      "Needs are attached to Spaces, so context is clear and organized.",
      "Offers can be made by anyone, with safety checks and rate limits to keep things respectful.",
      "Validation unlocks badges, giving contributors recognition from Project Leads.",
      "ADIN will personalize needs and opportunities, surfacing relevant ways to help.",
      "Safety rules protect against spam, misuse, or overwhelming creators with offers.",
      "Impact is visible, helping contributors build reputation and helping Projects stay resourced.",
    ],
    stepByStep: [
      {
        title: "If you're looking to offer value:",
        steps: [
          "Browse needs across spaces or check recommended opportunities.",
          "Use filters like 'skills,' 'location,' or 'project type.'",
          "Make an offer that clearly describes how you can help.",
          "If accepted, follow up with the project lead via messages or a working session.",
        ],
      },
      {
        title: "If you're leading a project and need support:",
        steps: [
          "Post a clear need inside your space — short, specific, actionable.",
          "Tag it with the right categories so the right contributors find it.",
          "Review offers and accept the ones that match your priorities.",
          "Validate contributions when completed so supporters earn recognition.",
          "Share the story of what their contribution helped unlock.",
        ],
      },
      {
        title: "If you want to build long-term contribution habits:",
        steps: [
          "Complete your profile, especially skills and focus areas.",
          "Follow spaces or topics that matter to you.",
          "Check CONTRIBUTE weekly for new needs that match your strengths.",
          "Build a streak — consistent contributions earn badges and visibility.",
        ],
      },
    ],
    examples: [
      {
        title: "You're a UX designer in Johannesburg",
        description:
          "You browse 'Design' needs and find a Kenyan founder needing help with onboarding screens. You offer support, jump on a quick call, deliver a mockup, and receive a validated contribution badge. Your contribution gets featured in CONVEY, inspiring others to help too.",
      },
      {
        title: "You're running a community project in Accra",
        description:
          "You need volunteers for a youth workshop. You post three needs: facilitator, photographer, and logistics support. Within days, diaspora members from the UK and Ghana offer help. The event runs smoothly — and contributors get recognized inside your space.",
      },
      {
        title: "You're a mentor in Atlanta",
        description:
          "You filter needs by 'Mentorship' and 'Startups.' You find a team in Kigali preparing for a pitch competition. Your one-hour coaching session leads to major improvements — and the team wins second place.",
      },
    ],
    relatedFeatures: [
      {
        name: "Spaces",
        description: "Needs and offers live inside communities and project hubs.",
        icon: FolderOpen,
      },
      {
        name: "Tasks (COLLABORATE)",
        description: "Some contributions can become tasks.",
        icon: FolderOpen,
      },
      {
        name: "Stories (CONVEY)",
        description: "Showcasing contributions creates network-wide momentum.",
        icon: Megaphone,
      },
      {
        name: "CONNECT",
        description: "Helps identify people who may be the right match for your need.",
        icon: Users2,
      },
      {
        name: "Events (CONVENE)",
        description: "Events often generate opportunities for contributions or volunteering.",
        icon: Calendar,
      },
    ],
    faqs: [
      {
        question: "What counts as a 'need'?",
        answer:
          "Anything a project or space genuinely requires — skills, mentorship, resources, volunteers, or support.",
      },
      {
        question: "Can anyone post a need?",
        answer:
          "Only Space Leads or authorized project members. This keeps things organized and reduces spam.",
      },
      {
        question: "Can anyone offer support?",
        answer:
          "Yes — as long as they follow community guidelines.",
      },
      {
        question: "What is a validated contribution?",
        answer:
          "When a project lead confirms that a contributor's offer was completed, creating a badge and recording the moment in your contribution history.",
      },
      {
        question: "What about financial contributions or payments?",
        answer:
          "This is coming in a future phase. The current version focuses on skills, time, and resource support.",
      },
      {
        question: "How do I track my impact?",
        answer:
          "Your profile shows all past contributions, badges, and validated support you've offered.",
      },
    ],
  },
  convey: {
    hero: {
      title: "DNA | CONVEY",
      oneLiner:
        "CONVEY turns activity across DNA into stories, updates, and highlights that inspire people — and help the whole network see what's possible.",
      whoItsFor:
        "Members, project leads, organizers, media partners, and anyone who wants to share progress, celebrate wins, or help the network learn from what's happening.",
    },
    whatItIs:
      "People don't mobilize around silence. They mobilize around stories. CONVEY gives the diaspora a shared narrative — one built from updates, highlights, progress, and real examples of people doing meaningful work. CONVEY is the storytelling layer of DNA — turning raw activity into visible momentum. It helps members see which spaces are active, what progress projects are making, how contributions are making a difference, what events are happening and what came out of them, and how people across the diaspora are building, solving, and showing up. CONVEY brings the heartbeat of the platform to life.",
    whatYouCanDo: [
      "Post updates about work happening inside spaces or projects.",
      "Share highlights from events, collaborations, or contributions.",
      "Tell your story so others understand your journey and mission.",
      "Document wins and progress — even the small ones.",
      "Spotlight contributors and elevate community effort.",
      "Learn from other builders, organizers, and spaces.",
      "Follow updates from your network inside the CONNECT feed.",
      "Build visibility for projects, initiatives, and impact stories.",
    ],
    howItWorks: [
      "Updates flow from spaces, events, tasks, and contributions into a unified storytelling layer.",
      "Stories show up in CONNECT feeds, helping people discover new opportunities.",
      "Project activity creates automatic narrative moments, so members don't have to manually document everything.",
      "ADIN tailors what you see, showing updates most relevant to your interests and history.",
      "Safety rules prevent harmful or misleading content, while reporting tools keep things respectful.",
      "Every update fuels discovery, inspiring members to join spaces, contribute skills, or attend events.",
    ],
    stepByStep: [
      {
        title: "If you're part of a space or project:",
        steps: [
          "Post short updates after meetings, milestones, or breakthroughs.",
          "Share context, even if small — 'we drafted the outline,' 'met for the first time,' 'completed a design.'",
          "Tag relevant themes so others can find it easily.",
          "Highlight contributors to build trust and encourage participation.",
          "Share outcomes — what changed because of the work?",
        ],
      },
      {
        title: "If you're a project lead or organizer:",
        steps: [
          "Use weekly or monthly updates to keep your community aligned.",
          "Post event recaps — photos, insights, recordings, next steps.",
          "Celebrate progress publicly to attract collaborators or supporters.",
          "Document impact so partners and funders understand the work.",
          "Link updates back to tasks, contributions, or events for clarity.",
        ],
      },
      {
        title: "If you're a member looking to follow the pulse:",
        steps: [
          "Browse CONVEY for stories across the diaspora.",
          "Follow spaces, people, and topics you care about.",
          "Use stories as jumping-off points — join the space, show up to the event, make a contribution.",
          "Share stories that inspire you to help others discover them too.",
        ],
      },
    ],
    examples: [
      {
        title: "You're part of a creative collective in Accra",
        description:
          "After a workshop, you post a recap with photos and key insights. Members from London and Lagos respond, leading to a cross-border collab. Your update inspires a new group of creatives to join your space.",
      },
      {
        title: "You're running a climate tech project",
        description:
          "You share weekly updates documenting design progress, field tests, and stakeholder meetings. An engineer in Nairobi sees your story, reaches out, and joins as a contributor. Your updates become a living archive of the project's growth.",
      },
      {
        title: "You're a mentor in Atlanta",
        description:
          "You spotlight a founder you've supported, telling the story of their pitch improvements. CONVEY surfaces it in CONNECT feeds across the diaspora. Several new mentors volunteer for other founders — momentum multiplies.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT Feed",
        description: "Distributes your updates to your network and followers.",
        icon: Users2,
      },
      {
        name: "Spaces",
        description: "Most stories emerge from community and project hubs.",
        icon: FolderOpen,
      },
      {
        name: "COLLABORATE Tasks & Boards",
        description: "Work progress turns into updates.",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Validated support becomes visible stories.",
        icon: Heart,
      },
      {
        name: "CONVENE",
        description: "Event recaps amplify engagement.",
        icon: Calendar,
      },
      {
        name: "ADIN",
        description: "Helps surface relevant stories, learning, and insights.",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "What counts as a 'story' on DNA?",
        answer:
          "Anything that captures progress, learning, or impact — especially things that help others understand what's happening behind the scenes.",
      },
      {
        question: "Who can post updates?",
        answer:
          "Members with access to a space or project can post. Leads can highlight or pin key updates.",
      },
      {
        question: "Are stories public?",
        answer:
          "It depends on the space's visibility settings. Public spaces → public stories; private spaces → internal only.",
      },
      {
        question: "Where do CONVEY stories show up?",
        answer:
          "Primarily in: The CONNECT feed, The CONVEY hub page, Space activity streams, and Project timelines.",
      },
      {
        question: "How do stories help with mobilization?",
        answer:
          "Visibility inspires action. Stories help people find where to plug in, see what's working, join events or spaces, offer contributions, and celebrate progress.",
      },
      {
        question: "Is multimedia supported?",
        answer:
          "Yes — photos, links, attachments, and video (depending on your build phase).",
      },
    ],
  },
  "connect-feed": {
    hero: {
      title: "CONNECT Feed",
      oneLiner:
        "Your personalized home feed showing activity from your network, spaces, events, and contributions across DNA.",
      whoItsFor:
        "Every member. Whether you're new, exploring, or deeply active — the CONNECT Feed helps you see what's happening and where to plug in next.",
    },
    whatItIs:
      "Most people arrive on DNA with a simple question: 'Where should I focus? What's happening right now?' The CONNECT Feed answers that instantly. It gathers activity from people you follow, spaces you've joined, events related to your interests, projects and tasks you're connected to, contributions across your network, stories from CONVEY, and updates from ADIN recommendations. It's your personalized doorway into opportunity, community, and momentum. If CONNECT is 'who's in the network,' the CONNECT Feed is 'what your network is doing.'",
    whatYouCanDo: [
      "See what your network is up to — new connections, updates, events, stories.",
      "Browse recommended content based on interests, skills, and activity.",
      "Jump into events directly from the feed.",
      "Join spaces you discover through posts.",
      "Respond to contributions or needs you see.",
      "Follow new members, organizers, and builders.",
      "Share updates through the Universal Composer.",
      "React and comment, building relationships and visibility.",
    ],
    howItWorks: [
      "ADIN curates what you see based on your profile, history, and behavior.",
      "Content from spaces/events you follow is boosted, so you don't miss key moments.",
      "Posts from people you've connected with float to the top.",
      "New member introductions are shown sparingly, so the feed doesn't become noisy.",
      "Stories, contributions, and events all flow into one consistent timeline.",
      "Safety filters remove blocked-content visibility, keeping the environment healthy.",
      "Activity you engage with teaches the system what to show more of.",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA:",
        steps: [
          "Scroll your feed for a few minutes — get a feel for the rhythm.",
          "Tap into a story that interests you.",
          "Follow the person or space behind it.",
          "Join one event or space — just one is enough to start momentum.",
          "Post your introduction or your first update.",
        ],
      },
      {
        title: "If you're building a project:",
        steps: [
          "Share weekly updates through the feed.",
          "Highlight tasks completed or progress made.",
          "Post calls for contributors and volunteers.",
          "Engage with other builders to grow your visibility.",
          "Use reactions and comments to spark conversations.",
        ],
      },
      {
        title: "If you're exploring opportunities:",
        steps: [
          "Follow people and spaces that match your skills or heritage.",
          "Browse recommended events and join at least one.",
          "Look for needs posted in CONTRIBUTE and see where you can plug in.",
          "Use your feed daily — it keeps your finger on the pulse.",
        ],
      },
    ],
    examples: [
      {
        title: "You're a data analyst in Paris",
        description:
          "Your feed shows a story from a diaspora health-tech space. You follow the organizer, see their upcoming working session, and join. One comment leads to a conversation — and eventually to a role as a volunteer data advisor.",
      },
      {
        title: "You're a founder in Nairobi",
        description:
          "Your updates about your prototype show up in the feed. A UX designer in Lagos comments with suggestions. A mentor in London reaches out. Within days, you have a micro-team supporting your next milestone.",
      },
      {
        title: "You're exploring creative communities",
        description:
          "You see event recaps in your feed — photos, quotes, highlights. You follow the space, join the next meetup, and meet collaborators. Your feed slowly becomes curated around your creative journey.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONVEY",
        description: "Stories and updates appear directly in the feed.",
        icon: Megaphone,
      },
      {
        name: "CONVENE Events",
        description: "Events you follow, join, or might like.",
        icon: Calendar,
      },
      {
        name: "COLLABORATE Spaces & Projects",
        description: "Small wins and big milestones.",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Needs and validated contributions.",
        icon: Heart,
      },
      {
        name: "CONNECT",
        description: "New members, connection activity, recommendations.",
        icon: Users2,
      },
      {
        name: "ADIN",
        description: "Personalization in the background.",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Is my feed the same as everyone else's?",
        answer:
          "No — your feed is completely personalized based on your activity, profile, and network.",
      },
      {
        question: "Can I control what I see?",
        answer:
          "You can follow or unfollow people and spaces at any time. ADIN will adjust what you see.",
      },
      {
        question: "How often does the feed update?",
        answer:
          "Real-time or near real-time, depending on the activity.",
      },
      {
        question: "Can I post directly from the feed?",
        answer:
          "Yes — the Universal Composer lets you share updates, stories, or links in seconds.",
      },
      {
        question: "What if I only want to see updates from my spaces?",
        answer:
          "You can filter your feed by 'Spaces,' 'Events,' 'Stories,' or 'All.'",
      },
      {
        question: "Is the feed public?",
        answer:
          "No — your feed is personalized, and visibility respects space privacy settings.",
      },
    ],
  },
  "universal-composer": {
    hero: {
      title: "Universal Composer",
      oneLiner:
        "The Universal Composer lets you create anything on DNA — updates, stories, events, tasks, needs, offers, and more — all from one simple tool.",
      whoItsFor:
        "Every member. Builders, organizers, contributors, space leads, event hosts, community members, and newcomers who want to share or take action instantly.",
    },
    whatItIs: `People often feel overwhelmed by platforms with too many creation tools.
Multiple modals.
Different buttons.
Confusing options.

DNA avoids that.

**The Universal Composer is one simple, adaptive entry point for everything you can create on DNA.**

Depending on where you are and what you're trying to do, the Composer transforms itself to let you:
- Post an update
- Create a story
- Start a conversation
- Add a task
- Post a need
- Make an offer
- Create an event
- Share progress from a Space
- Add resources or attachments
- Or write something simple — a thought, insight, or idea

One tool. Many possibilities. Always intuitive.`,
    whatYouCanDo: [
      "Share updates in the CONNECT Feed",
      "Tell stories that flow into CONVEY",
      "Create events for CONVENE",
      "Add tasks or milestones to COLLABORATE",
      "Post needs for CONTRIBUTE",
      "Offer support where needed",
      "Upload files and resources",
      "Tag spaces and people",
      "Add categories and focus areas",
      "Attach links, images, or media",
      "Preview the post before publishing",
      "Choose visibility settings (public, private, space-only)",
    ],
    howItWorks: [
      "It adapts based on context — If you're in a Space → it suggests space-specific items; If you're on an Event → it suggests posting an update or recap; If you're on a Task → it offers progress or attachments",
      "It pulls from ADIN — The Composer suggests what type of content you might want to create based on your recent actions",
      "It connects to every pillar — One tool powering content across CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, and CONVEY",
      "It supports safe posting — Visibility controls, content guidelines, and reporting",
      "It uses templates — For needs, events, tasks, and updates — making creation faster",
    ],
    stepByStep: [
      {
        title: "If you're posting an update",
        steps: [
          "Click 'What's happening?'",
          "Share progress, thoughts, photos, or insights",
          "Choose where it belongs — your profile, a Space, or public view",
          "Tag collaborators if relevant",
          "Post and let the feed amplify your voice",
        ],
      },
      {
        title: "If you're creating an event",
        steps: [
          "Select 'Create Event' in the Composer",
          "Add title, description, date/time, and format (virtual/in-person/hybrid)",
          "Choose the Space it belongs to",
          "Publish and invite members",
        ],
      },
      {
        title: "If you're adding a task to a project",
        steps: [
          "Select 'Add Task'",
          "Write a clear title and description",
          "Assign an owner or leave it unassigned",
          "Add due dates or attachments",
          "Save it inside the project Space",
        ],
      },
      {
        title: "If you're posting a need",
        steps: [
          "Select 'Post a Need'",
          "Describe what you need and why",
          "Tag relevant categories (skills, resources, mentorship)",
          "Add context through the Space",
          "Publish so contributors can offer support",
        ],
      },
      {
        title: "If you're offering support",
        steps: [
          "Tap 'Offer Support'",
          "Share your skills, resources, or availability",
          "Wait for project leads to accept or follow up",
          "Track your contribution as it evolves",
        ],
      },
    ],
    examples: [
      {
        title: "You're a founder in Accra",
        description:
          "You use the Composer to post a 'Progress Update' about your prototype. It shows up in the CONNECT Feed. An engineer in Ghana and a designer in Europe follow up — your team grows overnight.",
      },
      {
        title: "You're organizing a meetup in D.C.",
        description:
          "You create a virtual + in-person hybrid event using the Composer. You attach the location, tags, and a cover image. Members discover it and RSVP through the feed.",
      },
      {
        title: "You're a mentor in Nairobi",
        description:
          "You use the Composer to make an offer: '1-hour mentorship for early-stage founders.' A project lead sees it, reaches out, and validates your contribution after the session. You earn a badge and build your reputation.",
      },
      {
        title: "You're part of a community collective",
        description:
          "You share a weekly 'week-in-review' in your Space through the Composer. This becomes a ritual that brings your team closer and keeps members aligned.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT Feed",
        description: "Posts appear immediately",
        icon: Users2,
      },
      {
        name: "CONVEY",
        description: "Turns updates into stories",
        icon: Megaphone,
      },
      {
        name: "COLLABORATE",
        description: "Creates tasks, project updates, attachments",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Posts needs/offers directly",
        icon: Heart,
      },
      {
        name: "CONVENE",
        description: "Event creation and promotion",
        icon: Calendar,
      },
      {
        name: "Spaces",
        description: "Contextual posting to hubs and projects",
        icon: FolderOpen,
      },
      {
        name: "ADIN",
        description: "Learns from your actions to optimize suggestions",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Is the Composer available everywhere?",
        answer:
          "Yes — it's always available at the top of the Feed and inside key Spaces.",
      },
      {
        question: "Why does the Composer look different depending on where I am?",
        answer:
          "It adapts based on context — making creation simpler and faster.",
      },
      {
        question: "Can I schedule posts?",
        answer: "Scheduling will come in future versions.",
      },
      {
        question: "Can I create tasks without being a Space Lead?",
        answer:
          "You need Contributor access to add tasks inside a Space or Project.",
      },
      {
        question: "Are there limits on posting?",
        answer:
          "Normal members can post freely. Needs/offers have rate limits for quality control.",
      },
      {
        question: "Can I attach files or media?",
        answer: "Yes — attachments, images, and links are supported.",
      },
    ],
  },
  "needs-and-offers": {
    hero: {
      title: "Needs & Offers (DNA | CONTRIBUTE)",
      oneLiner:
        "Needs & Offers is the matching system that connects people who need support with those who have the skills, time, resources, or access to help.",
      whoItsFor:
        "Project leads, space organizers, community builders, founders, volunteers, mentors, supporters — everyone who wants to ask for help or offer it.",
    },
    whatItIs: `Almost every project — no matter how magical — gets stuck at the same question:

"What do you need right now?"

Most communities struggle because needs remain invisible. People want to support, but they don't know how or where.

**Needs & Offers solve that.**

- **A Need** = a clear request for support
- **An Offer** = someone stepping up with skills, time, resources, or help
- **A Validated Contribution** = recognition for completed support

Together, they power DNA's contribution engine — simple, transparent, and action-driven.`,
    whatYouCanDo: [
      "Post Needs — Skills (design, engineering, writing, research), Time (mentorship, coaching, support), Resources (tools, assets, access, space), Partnerships and opportunities, Volunteers for events or projects, Feedback, testing, or user insights",
      "Make Offers — Quickly respond to needs, Share expertise, Offer time or mentorship, Offer resources, space, tools, or access, Support teams and communities",
      "Track Progress — Leads manage offers, Contributors follow their submissions, Conversations happen through CONNECT or Messages, Updates flow into CONVEY",
      "Validate Contributions — When complete, Leads validate, Contributors receive badges, Contribution counts grow, Stories can be created to celebrate impact",
    ],
    howItWorks: [
      "Needs live inside Spaces, so context is always clear",
      "ADIN recommends contributors, based on skills, interests, or past contributions",
      "Rate limits prevent spam, keeping the system high-quality",
      "Validation triggers badges, creating reputation and recognition",
      "Needs flow into CONNECT Feed, increasing discovery",
      "Story prompts encourage users to post highlights, fueling CONVEY",
      "Offers are private at first, until accepted by a lead",
    ],
    stepByStep: [
      {
        title: "If you're posting a need",
        steps: [
          "Click 'Post a Need' in the Universal Composer",
          "Describe what you need in one clear sentence",
          "Add context in the description",
          "Tag skills, topics, and urgency",
          "Publish it inside the right Space",
          "Review offers and choose the best fit",
          "Validate once complete — celebrate your contributor!",
        ],
      },
      {
        title: "If you're offering help",
        steps: [
          "Browse needs posted across DNA",
          "Filter by skills, region, or Space",
          "Click 'Offer Support'",
          "Add a short note explaining how you can help",
          "Wait for acceptance and follow up with the lead",
          "Complete the contribution",
          "Earn your badge!",
        ],
      },
      {
        title: "If you're leading a team or community",
        steps: [
          "Post needs early — don't wait",
          "Keep needs small and actionable",
          "Consider creating multiple small needs",
          "Encourage members to post offers",
          "Validate contributions promptly",
          "Share updates on progress in your Space or via CONVEY",
          "Use needs to regularly energize your community",
        ],
      },
    ],
    examples: [
      {
        title: "You're a founder in Lagos",
        description:
          "You post a need for 'Pitch deck design help.' Within hours, a designer in London offers support. You jump on a call, redesign the deck, and validate the contribution. The story gets shared through CONVEY — inspiring more offers.",
      },
      {
        title: "You're supporting a community project in Accra",
        description:
          "You post a need for volunteers to help with logistics. Two diaspora members traveling home see it and step in. The event runs smoothly — and your contributors feel deeply connected.",
      },
      {
        title: "You're a mentor in Atlanta",
        description:
          "You see a 'Need: 30-minute pitch feedback' in your feed. You offer help. The founder grows stronger, and your mentorship becomes a badge on your profile.",
      },
      {
        title: "You're in a creative Space",
        description:
          "Someone posts a need for help editing a short film. A member in Nairobi offers their editing skills. The project gets completed and screened at an event.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONTRIBUTE Hub",
        description: "All contribution activity",
        icon: Heart,
      },
      {
        name: "Spaces",
        description: "Context and community for each need",
        icon: FolderOpen,
      },
      {
        name: "COLLABORATE",
        description: "Tasks, progress, attachments",
        icon: FolderOpen,
      },
      {
        name: "CONNECT Feed",
        description: "Visibility and discovery",
        icon: Users2,
      },
      {
        name: "CONVEY",
        description: "Storytelling and highlights",
        icon: Megaphone,
      },
      {
        name: "ADIN",
        description: "Matching and relevance suggestions",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Who can post needs?",
        answer:
          "Space Leads and authorized contributors — depending on Space settings.",
      },
      {
        question: "Can anyone make an offer?",
        answer: "Yes — any DNA member can offer support.",
      },
      {
        question: "What happens when I make an offer?",
        answer:
          "The project or space lead will review and respond. You might get a follow-up message.",
      },
      {
        question: "Are offers visible to everyone?",
        answer:
          "Not initially — only after acceptance (depending on settings).",
      },
      {
        question: "Can needs be closed or updated?",
        answer:
          "Absolutely — leads can update, pause, or close needs anytime.",
      },
      {
        question: "How do I track my contributions?",
        answer:
          "Your profile displays your badges and validated contributions.",
      },
      {
        question: "Do contributions expire?",
        answer:
          "No — they remain part of your permanent impact history.",
      },
    ],
  },
  "tasks-and-projects": {
    hero: {
      title: "Tasks & Projects (DNA | COLLABORATE)",
      oneLiner:
        "Tasks & Projects help you turn ideas into organized, trackable execution — with clear steps, shared ownership, and visible progress.",
      whoItsFor:
        "Project leads, contributors, organizers, founders, teams, and anyone moving from early ideas to real action.",
    },
    whatItIs: `Every great initiative — no matter how inspiring — only moves when someone takes the next step.

But people often feel stuck because work feels too big, too unclear, or too scattered.

**Tasks & Projects solve that.**

- **A Project** is a focused initiative inside a Space
- **Tasks** are the small steps that move the project forward
- **Boards & Lists** help you see progress at a glance

Together, they help teams collaborate with clarity and momentum.

Projects become the organizing brain. Tasks become the heartbeat.`,
    whatYouCanDo: [
      "Create Projects — Set a clear purpose, Define goals or outcomes, Add contributors or collaborators, Attach events or milestones, Share updates and progress",
      "Break Work into Tasks — Create task lists, Add descriptions and attachments, Assign owners or leave unassigned, Set due dates and priority, Add dependencies, Track status with one click",
      "Organize Work Visually — Switch between list view and Kanban board, Drag and drop tasks, Organize tasks by stage, priority, or theme, Check off tasks as they're completed",
      "Keep Everyone in Sync — Post project updates, Tag teammates, Host working sessions from task boards, Use analytics to track activity and momentum, Turn key updates into stories through CONVEY",
    ],
    howItWorks: [
      "Projects live inside Spaces, keeping work organized by community or initiative",
      "Tasks can belong to a Space or directly to a Project",
      "Boards update instantly for all team members",
      "ADIN learns your working patterns, helping recommend collaborators",
      "Task dependencies prevent misalignment",
      "Analytics help leads see what's moving and what's stuck",
      "Updates flow into the CONNECT Feed, making progress visible",
      "Completion can feed into contributions, allowing validated support",
    ],
    stepByStep: [
      {
        title: "If you're starting a new project",
        steps: [
          "Open or create a Space",
          "Click 'Create Project'",
          "Add a title, purpose, and description",
          "Add your first 5–10 tasks",
          "Assign owners — or keep tasks open for contributors",
          "Share an update to invite people to participate",
          "Host your first working session",
        ],
      },
      {
        title: "If you're contributing to someone else's project",
        steps: [
          "Join the Space where the project lives",
          "Browse the task board",
          "Choose one unassigned task",
          "Introduce yourself in the comments or messages",
          "Complete the task and post a progress update",
          "Keep an eye on new tasks as the project grows",
        ],
      },
      {
        title: "If you're a project lead",
        steps: [
          "Use tasks to break big goals into small steps",
          "Keep your board simple — 3–5 columns max",
          "Review progress weekly",
          "Validate completed work",
          "Convert completed tasks into CONVEY stories",
          "Post monthly progress summaries",
          "Use events for sprint reviews or working sessions",
        ],
      },
    ],
    examples: [
      {
        title: "You're a founder in Nairobi",
        description:
          "You create a project for your MVP. Design tasks go in one column, testing tasks in another. A designer in Lagos takes two tasks; a developer in Accra takes another. Within weeks, your prototype is real.",
      },
      {
        title: "You're running a climate initiative",
        description:
          "Your project board has tasks for outreach, fieldwork, and communications. Contributors self-assign tasks. You track progress with Kanban and use monthly working sessions to stay aligned. CONVEY stories share your impact across the platform.",
      },
      {
        title: "You're organizing a community festival",
        description:
          "Tasks include logistics, promotions, partnerships, and volunteers. Offers come in from CONTRIBUTE. Validation creates badges. Your festival becomes a cross-diaspora collaboration.",
      },
    ],
    relatedFeatures: [
      {
        name: "Spaces",
        description: "Home for all collaboration",
        icon: FolderOpen,
      },
      {
        name: "COLLABORATE",
        description: "Project management at the core",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Needs and offers support tasks",
        icon: Heart,
      },
      {
        name: "CONVENE",
        description: "Events become project working sessions",
        icon: Calendar,
      },
      {
        name: "CONVEY",
        description: "Stories and updates document progress",
        icon: Megaphone,
      },
      {
        name: "CONNECT Feed",
        description: "Surface visible activity",
        icon: Users2,
      },
      {
        name: "ADIN",
        description: "Relevance and recommendations",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Do I need to be a Space Lead to create a project?",
        answer:
          "Usually yes, but contributors may be allowed depending on settings.",
      },
      {
        question: "Can I assign multiple owners to a task?",
        answer:
          "Tasks typically have one owner for clarity, but teams can coordinate in comments.",
      },
      {
        question: "Do tasks have notifications?",
        answer:
          "Yes — owners get updates for assignments, changes, and completions.",
      },
      {
        question: "Can I attach files or resources?",
        answer: "Yes — tasks support attachments, links, and media.",
      },
      {
        question: "Can tasks be private?",
        answer: "Tasks respect Space and project visibility settings.",
      },
      {
        question: "Is there analytics for tasks and projects?",
        answer:
          "Yes — activity charts, completion trends, and contributor stats.",
      },
    ],
  },
  "profile-and-identity": {
    hero: {
      title: "Profile & Identity (DNA | CONNECT)",
      oneLiner:
        "Your DNA profile tells your story — your heritage, your skills, your interests, and the journey that brought you here — so the right people and opportunities can find you.",
      whoItsFor:
        "Every member on DNA. Community builders, founders, creators, organizers, professionals, students, mentors, and supporters.",
    },
    whatItIs: `When people join DNA, they bring a history, a culture, a skillset, and a purpose. Your profile is the home for all of that.

**Your profile is your identity inside the global African world** — helping people understand your background, your voice, your talents, and your intentions.

Unlike traditional platforms, DNA profiles aren't just résumés. They're cultural, personal, relational, and purpose-driven.

A profile includes:
- Name & username
- Location
- Diaspora / heritage roots
- Skills & expertise
- Focus areas & interests
- Professional background
- Social links
- Spaces you belong to
- Projects you contribute to
- Events you attend
- Contributions you've made
- Stories you've shared

Each part helps the network understand who you are and where you belong.`,
    whatYouCanDo: [
      "Share their identity — who they are, where they're from, what they care about",
      "Highlight skills & experience so the right opportunities find them",
      "Showcase cultural and diaspora roots",
      "Join communities (Spaces) aligned with their purpose",
      "Document contributions and impact",
      "Display badges earned through validated support",
      "Track events and collaborations",
      "Show created projects or leadership roles",
      "Control privacy settings",
      "Edit profile fields anytime",
      "Grow their credibility through meaningful activity",
    ],
    howItWorks: [
      "Profile completeness unlocks features (Example: you need 40% to send connection requests)",
      "ADIN uses your profile to personalize: Connection recommendations, Event suggestions, Space discovery, Needs & contribution opportunities, Content relevance in your feed",
      "Profile views generate insight — You can see who's looked at your profile",
      "Username history is tracked — You have limited changes to maintain identity consistency",
      "Safety tools apply here — You can block users or hide select information",
      "Your contributions and activity are automatically reflected — Tasks, validated contributions, stories, and events appear on your profile timeline",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA",
        steps: [
          "Add your name, photo, and location",
          "Add your heritage or diaspora roots",
          "Fill out your skills and focus areas",
          "Add a short bio that shares who you are",
          "Join one Space that matches your interests",
          "Make one connection or post one update",
        ],
      },
      {
        title: "If you're looking to build opportunities",
        steps: [
          "Highlight your projects or experience",
          "Add detailed skills and past work",
          "Join Spaces where your abilities matter",
          "Follow people with overlapping goals",
          "Create or contribute to tasks",
          "Share stories or updates",
          "Post your availability through CONTRIBUTE",
        ],
      },
      {
        title: "If you're building your reputation",
        steps: [
          "Complete your profile",
          "Contribute to Spaces",
          "Get contributions validated",
          "Participate in Events",
          "Share consistent updates",
          "Add your wins and outcomes",
        ],
      },
    ],
    examples: [
      {
        title: "You're a software engineer in Lagos",
        description:
          "You list your skills (React, Node, API design), join a Startup Space, and share your background. A founder in Nairobi finds your profile, reaches out, and you start collaborating on tasks.",
      },
      {
        title: "You're a creative in New York",
        description:
          "You list heritage (Ghanaian), focus areas (art, culture, storytelling), and join a creative collective. Someone sees your work in your profile and invites you to contribute to a project.",
      },
      {
        title: "You're a community builder in Accra",
        description:
          "Your profile highlights the Spaces you lead, events you host, and contributions you've validated. People begin following your work — your reach multiplies.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT",
        description: "Discovery, introductions, recommendations",
        icon: Users2,
      },
      {
        name: "CONNECT Feed",
        description: "Activity tied to your identity",
        icon: Users2,
      },
      {
        name: "CONVENE",
        description: "Events you've attended or created",
        icon: Calendar,
      },
      {
        name: "COLLABORATE",
        description: "Tasks and projects you own",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Needs you've posted, offers you've made",
        icon: Heart,
      },
      {
        name: "CONVEY",
        description: "Stories you've shared",
        icon: Megaphone,
      },
      {
        name: "Spaces",
        description: "Membership and leadership roles",
        icon: FolderOpen,
      },
      {
        name: "ADIN",
        description: "Personalization engine",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Why do I need a complete profile?",
        answer:
          "It increases your visibility, improves recommendations, and unlocks features.",
      },
      {
        question: "Can I change my username?",
        answer: "Yes, but only a limited number of times.",
      },
      {
        question: "Who can see my profile?",
        answer:
          "Your profile is visible to DNA members, with respect to privacy settings.",
      },
      {
        question: "Can I hide certain details?",
        answer: "Yes — you control what is public or private.",
      },
      {
        question: "How do contributions appear on my profile?",
        answer:
          "Validated contributions automatically show up as badges and activity.",
      },
      {
        question: "Can I link external work?",
        answer: "Yes — you can add portfolio links or social profiles.",
      },
    ],
  },
  "messaging": {
    hero: {
      title: "Messaging (DNA | CONNECT)",
      oneLiner:
        "Messaging lets you talk directly with members, collaborators, and project teams — helping conversations flow across spaces, events, and contributions.",
      whoItsFor:
        "Everyone. New members, community organizers, founders, contributors, space leads, and anyone who wants to connect, coordinate, or communicate.",
    },
    whatItIs: `People join DNA looking for connection, support, and belonging — and none of that happens without real conversations.

**Messaging is the private communication layer that makes relationship-building natural.**

Messaging turns connections into collaboration — and collaboration into impact.

This is where you:
- Follow up after connecting
- Coordinate project tasks
- Chat with event organizers
- Ask questions
- Offer help
- Share ideas or reflections
- Build trust
- Stay in touch as you work across continents

It's simple, human, and central to the entire DNA experience.`,
    whatYouCanDo: [
      "Send private 1:1 messages to any member they've connected with",
      "Message contributors, collaborators, or space members",
      "Follow up after events",
      "Coordinate tasks inside COLLABORATE",
      "Ask for clarity on needs or offers",
      "Share files or links",
      "Start group conversations for small teams",
      "Stay notified about new messages or replies",
      "Control message requests for safety and boundaries",
    ],
    howItWorks: [
      "You can only message people you're connected to, unless you're in the same Space or Project",
      "Message requests protect privacy, giving you control over who can reach you",
      "Safety filters apply, blocking unwanted or inappropriate content",
      "Attachments and links are supported depending on your role and settings",
      "ADIN improves relevance, suggesting when to reach out (e.g., after you join a Space)",
      "Conversation history stays in sync across your devices",
      "Notifications keep you updated, but you can mute conversations anytime",
    ],
    stepByStep: [
      {
        title: "If you're connecting with someone new",
        steps: [
          "Visit their profile",
          "Click 'Message'",
          "Introduce yourself briefly",
          "Share why you reached out or what sparked your interest",
          "Suggest one small next step — a question, a link, or an invitation",
        ],
      },
      {
        title: "If you're collaborating on a project",
        steps: [
          "Create a group chat for your core contributors",
          "Use messaging to clarify tasks or blockers",
          "Share drafts, links, or context",
          "Host working sessions (via Events) and coordinate in the chat",
          "Celebrate progress as tasks are completed",
        ],
      },
      {
        title: "If you're leading a Space",
        steps: [
          "Welcome new members with a friendly message",
          "Use broadcast messages sparingly for important updates",
          "Encourage contributors to message leads with questions",
          "Direct people to tasks, needs, or events",
          "Maintain a safe, respectful communication culture",
        ],
      },
      {
        title: "If you're supporting a need or offer",
        steps: [
          "After making an offer, send a follow-up message",
          "Confirm expectations and timing",
          "Share progress",
          "Coordinate validation",
          "Stay connected even after the contribution ends",
        ],
      },
    ],
    examples: [
      {
        title: "You're a UX designer in Nairobi",
        description:
          "After seeing a founder's update in the Feed, you message them: 'Loved your prototype — want feedback?' A simple DM leads to a deeper collaboration.",
      },
      {
        title: "You're attending an event",
        description:
          "You meet a speaker whose work inspires you. You message them after the event with a thank-you and a question. This becomes the start of a mentorship relationship.",
      },
      {
        title: "You're contributing to a project in Johannesburg",
        description:
          "You message the lead to clarify a task. A quick conversation unlocks exactly what you needed — and your contribution gets validated.",
      },
      {
        title: "You're a creative in Paris",
        description:
          "You message other creatives in a Space to propose a weekend collaboration session. You end up forming a small team that creates a short film together.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT",
        description: "Talk to people you connect with",
        icon: Users2,
      },
      {
        name: "Spaces",
        description: "Message members or contributors",
        icon: FolderOpen,
      },
      {
        name: "COLLABORATE",
        description: "Coordinate tasks and project work",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Follow up on needs, offers, and contributions",
        icon: Heart,
      },
      {
        name: "CONVENE",
        description: "Coordinate before and after events",
        icon: Calendar,
      },
      {
        name: "CONVEY",
        description: "Message people whose stories inspire you",
        icon: Megaphone,
      },
      {
        name: "ADIN",
        description: "Suggests relevant people to talk to",
        icon: Users2,
      },
      {
        name: "CONNECT Feed",
        description: "Messaging entry points from activity",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Can I message anyone on DNA?",
        answer:
          "You can message people you're connected to, and—depending on settings—members of Spaces you belong to.",
      },
      {
        question: "Are messages private?",
        answer: "Yes — all messages are private between you and the other member(s).",
      },
      {
        question: "Can I block someone?",
        answer: "Absolutely. Blocking prevents messaging and profile visibility.",
      },
      {
        question: "Do you support attachments?",
        answer: "Yes — images, files, and links are supported.",
      },
      {
        question: "Are there group chats?",
        answer: "Yes — small groups can message together.",
      },
      {
        question: "Can I mute conversations?",
        answer: "Yes. You can mute or leave any conversation.",
      },
    ],
  },
  "adin": {
    hero: {
      title: "ADIN — African Diaspora Intelligence Network",
      oneLiner:
        "ADIN is DNA's intelligence engine — the layer that personalizes your experience, connects the dots, and helps the diaspora move with clarity and purpose.",
      whoItsFor:
        "Everyone. Members, organizers, contributors, partners, teams — anyone who benefits from smarter discovery, better recommendations, and a more meaningful platform experience.",
    },
    whatItIs: `Most platforms drown people in noise. Endless lists, random content, irrelevant suggestions — the opposite of empowerment.

**ADIN flips that completely.**

ADIN is the personalization and intelligence system that helps every member see what matters most — people, spaces, events, contributions, and stories aligned with their identity, interests, skills, and goals.

Its purpose is simple:
- Reduce noise
- Increase meaning
- Guide users toward action
- Strengthen diaspora-wide mobilization
- Help contributions and collaborations happen faster

ADIN is the connective tissue behind DNA's 5Cs.`,
    whatYouCanDo: [
      "Smarter Discovery — Relevant members to connect with, Spaces you'll love, Diaspora communities tied to your identity, Opportunities based on your skills and focus areas",
      "Meaningful Event Recommendations — Events tied to your interests, Gathering suggestions based on who you follow, Cross-regional convenings you wouldn't have found otherwise",
      "Better Collaboration Matches — People with complementary skills, Contributors who can support your needs, Potential teammates for your projects, Recommendations for task ownership",
      "Contribution Alignment — Needs that match your expertise, Opportunities for mentorship or support, Offers you're uniquely suited for",
      "Feed Personalization — Stories and updates that matter, Highlights from Spaces and projects you care about, A daily pulse that reflects your world",
      "Safety & Integrity — Reducing spam, Filtering inappropriate content, Preventing unwanted interactions",
    ],
    howItWorks: [
      "Your profile powers your recommendations — Heritage, skills, focus areas, and spaces form your 'identity graph'",
      "Your activity trains the system — Every Space you join, story you read, event you attend, and need you respond to tells ADIN what you value",
      "Your connections shape what you see — The more relationships you build, the more relevant your feed becomes",
      "Your contributions expand your opportunities — People who support others get surfaced more often",
      "Your engagement guides personalization — ADIN learns quietly — always adapting, never overwhelming",
      "Privacy and safety controls are always respected — Blocked users, private spaces, and sensitive data stay protected",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA",
        steps: [
          "Fill out your profile — the more you share, the smarter ADIN becomes",
          "Join one or two Spaces that feel aligned",
          "Attend at least one event",
          "Follow people whose work inspires you",
          "Engage with your feed (reactions, comments, updates)",
        ],
      },
      {
        title: "If you're a builder or organizer",
        steps: [
          "Keep your Space active — ADIN boosts engaged communities",
          "Post clear tasks for contributors",
          "Tag your needs accurately",
          "Share updates for visibility in CONNECT Feed",
          "Invite collaborators with complementary skills",
        ],
      },
      {
        title: "If you're exploring opportunities",
        steps: [
          "Update your skills and focus areas",
          "Follow topics that matter to you",
          "Offer support through CONTRIBUTE",
          "Attend cross-regional events",
          "React to stories that resonate",
        ],
      },
    ],
    examples: [
      {
        title: "You're a creative in Nairobi",
        description:
          "ADIN notices you engaging with art and storytelling Spaces. Your feed starts showing you: Creative workshops, Filmmakers in the diaspora, Events in your region, Needs related to design. Soon, you're collaborating across continents.",
      },
      {
        title: "You're a founder in Accra",
        description:
          "ADIN sees your skills, interests, and contributions. Your feed features: Mentors in your industry, Technical collaborators, Startup spaces in the diaspora, Needs that match your expertise. A support ecosystem forms around your project.",
      },
      {
        title: "You're a student in Toronto",
        description:
          "You explore African heritage topics. ADIN surfaces: Cultural Spaces, Creative events, Stories that match your roots, People who share your background. You slowly find your community.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT",
        description: "Member matching, connection suggestions",
        icon: Users2,
      },
      {
        name: "CONNECT Feed",
        description: "Personalized updates and stories",
        icon: Users2,
      },
      {
        name: "CONVENE",
        description: "Event recommendations",
        icon: Calendar,
      },
      {
        name: "COLLABORATE",
        description: "Project contributor suggestions",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Need/offer matching",
        icon: Heart,
      },
      {
        name: "CONVEY",
        description: "Relevant stories surfaced",
        icon: Megaphone,
      },
      {
        name: "Spaces",
        description: "Discovery and engagement routing",
        icon: FolderOpen,
      },
      {
        name: "Profile System",
        description: "Identity graph foundation",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Is ADIN an algorithm?",
        answer:
          "Yes, but a transparent one — built to support real mobilization, not vanity metrics.",
      },
      {
        question: "Does ADIN use my data?",
        answer:
          "Only with your consent and only to improve your experience. Sensitive or private data is never exposed.",
      },
      {
        question: "Do I have control over what I see?",
        answer:
          "Absolutely — you can follow/unfollow, join/leave Spaces, or adjust your profile anytime.",
      },
      {
        question: "Does ADIN make decisions for me?",
        answer: "No — it suggests. You choose.",
      },
      {
        question: "Does ADIN replace human relationships?",
        answer:
          "No. It amplifies them by removing guesswork and friction.",
      },
      {
        question: "Will ADIN improve over time?",
        answer:
          "Yes — Phase 2 introduces real-time intelligence, experimentation, cohort segmentation, and adaptation.",
      },
    ],
  },
  "notifications": {
    hero: {
      title: "Notifications & Activity System",
      oneLiner:
        "Notifications keep you informed about the things that matter — messages, events, contributions, tasks, stories, and activity from your spaces and connections.",
      whoItsFor:
        "Every member, especially those active in multiple spaces, projects, or collaborations.",
    },
    whatItIs: `When people join DNA, they step into a living ecosystem. Spaces grow. Events happen. Contributions get validated. New stories appear. But no one can check everything all the time.

**Notifications solve that.**

Notifications are your personal activity guide — surfacing updates that matter most, at the right time, and in the right way.

It's not about pinging you constantly. It's about helping you stay connected to your communities, collaborators, and opportunities.`,
    whatYouCanDo: [
      "Messages — Direct messages, Group conversations, Message requests",
      "Events — New events from Spaces you follow, Reminders before an event starts, Updates or changes from organizers, Follow-up messages after events",
      "Needs & Contributions — A lead accepted your offer, Someone responded to your need, Your contribution was validated, New needs posted in your Spaces",
      "Tasks & Projects — You were assigned a task, A task you follow changes, Project updates from collaborators, Milestones, achievements, or progress",
      "Spaces — New members joining, Announcements from Space Leads, New updates, stories, or highlights, Important changes to visibility",
      "Feed Activity — Someone reacts to your update, Comments and mentions, Follow activity, Story highlights",
      "Profile — Someone viewed your profile (if enabled), Follow requests, Username / profile change confirmations",
    ],
    howItWorks: [
      "ADIN prioritizes relevance — You see what aligns with your identity, spaces, and current work",
      "DNA groups similar notifications — So you don't get overwhelmed by noise",
      "Notifications respect privacy — Anything from private or invite-only spaces stays protected",
      "Push + in-app system — You get updates inside DNA, with optional email/push alerts",
      "You control what you receive — Members can mute conversations, disable categories, or turn off certain alerts",
      "Quiet hours coming soon — Future versions will include do-not-disturb windows",
      "Safety first — Inappropriate or unwanted interactions are blocked or muted instantly",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA",
        steps: [
          "Check the notification icon daily",
          "Respond to message requests",
          "RSVP to any relevant events",
          "Follow the Spaces that send you updates",
          "Turn off categories that feel distracting",
        ],
      },
      {
        title: "If you're collaborating on a project",
        steps: [
          "Keep notifications ON for: Tasks, Messages, Project updates",
          "Mute channels that aren't part of your work",
          "Act quickly on assigned tasks or clarifications",
          "Share updates to keep your collaborators aligned",
        ],
      },
      {
        title: "If you're leading a Space",
        steps: [
          "Turn notifications ON for: New members, Needs/offers, Space updates, Event engagement",
          "Respond promptly to contributors",
          "Use notifications to keep your community warm and engaged",
        ],
      },
      {
        title: "If you're contributing",
        steps: [
          "Keep notifications ON for needs you're supporting",
          "Follow up with project leads",
          "Track validation and badge updates",
          "Turn off categories you don't need (e.g., broad feed reactions)",
        ],
      },
    ],
    examples: [
      {
        title: "You're contributing from London",
        description:
          "You get a notification: 'Your offer was accepted.' You hop into Messaging, clarify details, complete the contribution, and get validated. Your badge appears instantly — visible across your profile.",
      },
      {
        title: "You're building a Space in Johannesburg",
        description:
          "Notifications alert you to: New members, Updated tasks, Event RSVPs. You respond quickly, keep momentum alive, and your Space grows stronger.",
      },
      {
        title: "You're exploring opportunities",
        description:
          "You get a notification about a new Space aligned with your skills. You join, meet collaborators, and end up contributing to a project.",
      },
      {
        title: "You're coordinating a global working session",
        description:
          "Notifications help your team stay aligned across Accra, Toronto, Lagos, and Berlin. Everyone arrives ready — no one is lost.",
      },
    ],
    relatedFeatures: [
      {
        name: "Messaging",
        description: "Direct and group conversations",
        icon: Users2,
      },
      {
        name: "Events",
        description: "RSVPs, reminders, updates",
        icon: Calendar,
      },
      {
        name: "Spaces",
        description: "Member activity, announcements",
        icon: FolderOpen,
      },
      {
        name: "COLLABORATE",
        description: "Tasks, project activity",
        icon: FolderOpen,
      },
      {
        name: "CONTRIBUTE",
        description: "Needs, offers, validations",
        icon: Heart,
      },
      {
        name: "CONVEY",
        description: "Comments and interactions",
        icon: Megaphone,
      },
      {
        name: "CONNECT",
        description: "New followers, profile views",
        icon: Users2,
      },
      {
        name: "ADIN",
        description: "Relevance + prioritization",
        icon: Users2,
      },
    ],
    faqs: [
      {
        question: "Can I customize notifications?",
        answer:
          "Yes — members can turn on/off categories or mute specific conversations.",
      },
      {
        question: "Do I get notifications for everything?",
        answer: "No — DNA prioritizes relevance, not noise.",
      },
      {
        question: "Are notifications real-time?",
        answer: "Yes, with fallback email/push options.",
      },
      {
        question: "What about safety?",
        answer: "Blocked users cannot send notifications or messages.",
      },
      {
        question: "Can I mute an entire Space?",
        answer:
          "Yes — you can mute Space notifications without leaving the Space.",
      },
      {
        question: "Do notifications affect recommendations?",
        answer:
          "Engagement with notifications makes ADIN smarter about what you value.",
      },
    ],
  },
};
