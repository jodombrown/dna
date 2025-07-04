import {
  DollarSign,
  BookOpen,
  Clock,
  Users,
  Megaphone,
  Gift,
  MessageSquare,
  Eye,
  Shield,
} from "lucide-react";

// Only three examples per pathway for tighter card layouts.
const impactPathwaysData = [
  {
    id: 1,
    icon: DollarSign,
    title: "Financial Capital",
    description: "Invest or donate to fund project development and implementation",
    examples: [
      "One-time donations",
      "Recurring contributions",
      "Equity investment"
    ],
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    whyItMatters:
      "Every great idea needs fuel. Financial support transforms plans into real-world progress, unlocking opportunities that volunteer effort alone can't achieve.",
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Knowledge & Expertise",
    description: "Share your professional skills and insights to guide projects",
    examples: [
      "Technical assistance",
      "Mentorship",
      "Strategic guidance"
    ],
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    whyItMatters:
      "Lasting impact comes from good decisions. Expertise turns lessons into leverage, helping projects avoid pitfalls and grow their strengths.",
  },
  {
    id: 3,
    icon: Clock,
    title: "Hands-On Work",
    description: "Volunteer your time and energy for direct project implementation",
    examples: [
      "Project implementation",
      "Event organizing",
      "Content creation"
    ],
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    whyItMatters:
      "Progress happens because real people show up and put in the work. Volunteering builds community, trust, and delivers results that money alone can't.",
  },
  {
    id: 4,
    icon: Users,
    title: "Networks & Relationships",
    description: "Open doors by connecting projects with key people and opportunities",
    examples: [
      "Making introductions",
      "Network sharing",
      "Leveraging influence"
    ],
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    whyItMatters:
      "Movements grow faster when connected. Relationships fast-track solutions and give projects access and legitimacy far beyond what resources alone deliver.",
  },
  {
    id: 5,
    icon: Megaphone,
    title: "Visibility & Advocacy",
    description: "Amplify project reach through promotion and public support",
    examples: [
      "Social media promotion",
      "Public speaking",
      "Content creation"
    ],
    color: "bg-pink-500",
    bgColor: "bg-pink-50",
    whyItMatters:
      "A powerful message wins hearts. Advocacy rallies new supporters and helps projects gain traction, strengthening voices that need to be heard.",
  },
  {
    id: 6,
    icon: Gift,
    title: "In-Kind Support",
    description: "Provide tools, services, and resources instead of cash contributions",
    examples: [
      "Free venue access",
      "Professional services",
      "Software licenses"
    ],
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    whyItMatters:
      "Progress often depends on access to tools and space. In-kind gifts stretch resources, remove barriers, and move projects further for less.",
  },
  {
    id: 7,
    icon: MessageSquare,
    title: "Data & Feedback",
    description: "Share insights and experiences to validate and improve projects",
    examples: [
      "User testing",
      "Survey participation",
      "Story sharing"
    ],
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    whyItMatters:
      "Feedback grounds big dreams in reality. Data and stories ensure projects actually meet needs, adapt fast, and share genuine impact while building trust.",
  },
  {
    id: 8,
    icon: Eye,
    title: "Cultural Guidance",
    description:
      "Bridge communities and inform impactful, locally-rooted design",
    examples: [
      "Sharing cultural context",
      "Providing community insight",
      "Acting as a bridge/translator"
    ],
    color: "bg-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    whyItMatters:
      "It ensures projects are rooted in real experiences, not just theory, and that they resonate with the people they aim to serve.",
  },
  {
    id: 9,
    icon: Shield,
    title: "Accountability & Stewardship",
    description:
      "Safeguard projects' missions and provide long-term integrity",
    examples: [
      "Serving on advisory/governance groups",
      "Monitoring progress",
      "Tracking metrics & impact"
    ],
    color: "bg-gray-700",
    bgColor: "bg-slate-100",
    whyItMatters:
      "Projects that last need people who protect the mission when things get tough or complex.",
  },
];

export default impactPathwaysData;
