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
      "Host events for your community, project, city, or ecosystem.",
      "Discover gatherings across regions, topics, and industries.",
      "Filter by format — virtual, in-person, hybrid.",
      "Follow organizers and stay updated on new events they create.",
      "RSVP and check in, so your presence strengthens future recommendations.",
      "Learn what's happening across the diaspora through curated highlights and categories.",
      "Create recurring gatherings (weekly workshops, monthly meetups, annual conferences).",
      "Build momentum around a space or project by inviting members to join your event directly.",
    ],
    howItWorks: [
      "Events are indexed globally, so your meetup in Nairobi can be discovered just as easily by someone in Toronto or Kigali.",
      "We prioritize events that match your interests, based on your heritage, skills, focus areas, spaces you joined, and people you follow.",
      "Organizers with strong track records get elevated, making it easier for the community to find quality gatherings.",
      "Safety is always on: blocked users won't see or interact with your events, and organizers control privacy (open, space-only, invite-only).",
      "As ADIN grows, CONVENE becomes even more personalized — surfacing events that truly match your goals.",
    ],
    stepByStep: [
      {
        title: "If you're new to DNA:",
        steps: [
          "Browse the Events Hub to see what people are organizing across the diaspora.",
          "Use filters like 'virtual,' 'career,' or 'creative industries.'",
          "RSVP to an event just to experience how gatherings work on DNA.",
          "Follow an organizer or space you enjoy so you don't miss future events.",
        ],
      },
      {
        title: "If you're a community builder or organizer:",
        steps: [
          "Create your first event — even something small like a 30-minute meetup.",
          "Select the right format: virtual, hybrid, or in-person.",
          "Promote it through CONNECT by sending invites to your network.",
          "Engage after the event: share updates, post insights, or invite new people to your space.",
        ],
      },
      {
        title: "If you're running a project or initiative:",
        steps: [
          "Use CONVENE for working sessions, office hours, or milestone check-ins.",
          "Link your event to a space so members can join the project community.",
          "Turn attendees into collaborators by connecting them through CONNECT.",
          "Share updates in CONVEY to show progress and invite contribution.",
        ],
      },
    ],
    examples: [
      {
        title: "You're in Lagos hosting a climate tech meetup",
        description:
          "You create an event, tag 'Climate' and 'Startups,' and choose hybrid format. Diaspora builders in Nairobi, Berlin, and Accra discover it through their feeds. Some join virtually, a few in-person — and suddenly your meetup becomes a cross-continental conversation.",
      },
      {
        title: "You're a student in Toronto preparing for a study-abroad program in Ghana",
        description:
          "You search for Ghana-related events, find an Accra meetup, and attend virtually. You meet a DNA organizer who shares resources and connects you to a space for Ghana travelers.",
      },
      {
        title: "You're growing a project team in Addis Ababa",
        description:
          "You create weekly 'Project Fridays' and link them to your space. Your teammates across the diaspora join, contribute, and help move tasks forward. What started as a project becomes a community.",
      },
    ],
    relatedFeatures: [
      {
        name: "CONNECT Feed",
        description: "Shows event activity from people and spaces you follow.",
        icon: Users2,
      },
      {
        name: "Spaces",
        description: "Organizers can tie events to specific communities or projects.",
        icon: FolderOpen,
      },
      {
        name: "Messages",
        description: "Where attendees and organizers coordinate details.",
        icon: Users2,
      },
      {
        name: "Contributions (CONTRIBUTE)",
        description: "Use events to rally support around needs.",
        icon: Heart,
      },
      {
        name: "Stories (CONVEY)",
        description: "Post highlights and recaps so the network learns what happened.",
        icon: Megaphone,
      },
    ],
    faqs: [
      {
        question: "Are CONVENE events public?",
        answer:
          "They can be. Organizers choose: Public, Space-only, or Invite-only.",
      },
      {
        question: "Do I need to follow someone to see their events?",
        answer:
          "No. You can discover events by location, topic, region, or category.",
      },
      {
        question: "How are events recommended?",
        answer:
          "We use your interests, skills, heritage, focus areas, and network activity to surface relevant gatherings. (More personalization coming as ADIN expands.)",
      },
      {
        question: "Can anyone create an event?",
        answer:
          "Yes — as long as your profile meets basic completeness + integrity checks. This keeps events meaningful and safe.",
      },
      {
        question: "What about payments or ticketing?",
        answer:
          "These integrations are planned for future phases, especially for major convenings, conferences, and partner-led events.",
      },
      {
        question: "What counts as a 'good' event on DNA?",
        answer:
          "Clear intention, a welcoming description, and a focus on connection or action. The best gatherings move people closer to building, learning, or contributing.",
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
};
