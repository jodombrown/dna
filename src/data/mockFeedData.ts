// Mock data for testing the social feed without authentication

export interface MockUser {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  bio: string;
  followers: number;
  connections: number;
}

export interface MockPost {
  id: string;
  userId: string;
  user: MockUser;
  content: string;
  type: 'text' | 'job' | 'event' | 'initiative';
  image?: string;
  hashtags: string[];
  likes: number;
  comments: number;
  reposts: number;
  timeAgo: string;
  isLiked?: boolean;
}

export interface MockEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
}

export interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedBy: string;
  timeAgo: string;
}

export interface MockInitiative {
  id: string;
  title: string;
  description: string;
  impactArea: string;
  supporters: number;
  goal: number;
  raised: number;
}

// Current mock user (the logged in user)
export const mockCurrentUser: MockUser = {
  id: 'current-user',
  name: 'Alex Diaspora',
  title: 'Product Manager',
  company: 'DNA Network',
  location: 'Lagos, Nigeria',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  bio: 'Building connections across the African diaspora. Passionate about tech innovation and community impact.',
  followers: 1247,
  connections: 892
};

// Mock users for the platform
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    title: 'Software Engineer',
    company: 'Google',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b04c9e18?w=150&h=150&fit=crop&crop=face',
    bio: 'Nigerian-British software engineer passionate about AI and machine learning.',
    followers: 2341,
    connections: 1205
  },
  {
    id: '2', 
    name: 'Kwame Asante',
    title: 'Investment Banker',
    company: 'Goldman Sachs',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Ghanaian-American investment banker focused on African infrastructure financing.',
    followers: 3456,
    connections: 2134
  },
  {
    id: '3',
    name: 'Dr. Fatima Al-Rashid',
    title: 'Medical Doctor',
    company: 'Johns Hopkins',
    location: 'Baltimore, MD',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    bio: 'Sudanese-American physician specializing in infectious diseases.',
    followers: 1876,
    connections: 945
  },
  {
    id: '4',
    name: 'Chinedu Okwu',
    title: 'Entrepreneur',
    company: 'TechHub Africa',
    location: 'Lagos, Nigeria',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Serial entrepreneur building fintech solutions across Africa.',
    followers: 5432,
    connections: 3021
  },
  {
    id: '5',
    name: 'Zara Hassan',
    title: 'Marketing Director',
    company: 'Unilever',
    location: 'Amsterdam, Netherlands',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Somali-Dutch marketing professional with expertise in emerging markets.',
    followers: 2987,
    connections: 1654
  }
];

// Mock posts
export const mockPosts: MockPost[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    content: 'Excited to announce that our AI model for crop prediction is now being used by 1000+ farmers across Nigeria! 🌾 The impact of technology on agriculture continues to amaze me. #AgriTech #AI #Africa',
    type: 'text',
    hashtags: ['AgriTech', 'AI', 'Africa'],
    likes: 234,
    comments: 42,
    reposts: 18,
    timeAgo: '2h'
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    content: 'Just closed a $50M infrastructure deal for renewable energy projects in West Africa. The diaspora investment community is truly powerful when we come together! 💰⚡',
    type: 'text',
    hashtags: ['Investment', 'RenewableEnergy', 'Diaspora'],
    likes: 567,
    comments: 89,
    reposts: 45,
    timeAgo: '4h'
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    content: 'Our telemedicine platform just reached 50,000 patients served across rural Africa. Healthcare access is a human right, and technology is making it possible. 🏥',
    type: 'text',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=300&fit=crop',
    hashtags: ['HealthTech', 'Telemedicine', 'Africa'],
    likes: 892,
    comments: 156,
    reposts: 78,
    timeAgo: '6h'
  },
  {
    id: '4',
    userId: '4',
    user: mockUsers[3],
    content: 'We\'re hiring! Looking for a Senior React Developer to join our fintech team in Lagos. Building the future of payments in Africa. 🚀',
    type: 'job',
    hashtags: ['Hiring', 'React', 'Fintech', 'Lagos'],
    likes: 345,
    comments: 67,
    reposts: 89,
    timeAgo: '8h'
  },
  {
    id: '5',
    userId: '5',
    user: mockUsers[4],
    content: 'African brands are taking the global stage! Our campaign for a Nigerian fashion brand just won at Cannes Lions. Representation matters everywhere. 🦁✨',
    type: 'text',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop',
    hashtags: ['Fashion', 'Nigeria', 'GlobalBrands'],
    likes: 1234,
    comments: 234,
    reposts: 156,
    timeAgo: '12h'
  },
  {
    id: '6',
    userId: '1',
    user: mockUsers[0],
    content: 'Join us for the African Tech Summit 2025! 3 days of innovation, networking, and collaboration. Early bird tickets now available.',
    type: 'event',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop',
    hashtags: ['TechSummit', 'Networking', 'Innovation'],
    likes: 456,
    comments: 78,
    reposts: 123,
    timeAgo: '1d'
  },
  {
    id: '7',
    userId: '2',
    user: mockUsers[1],
    content: 'Launching our new initiative: "Code for Africa" - teaching programming skills to 10,000 young people across the continent. Who wants to volunteer as a mentor?',
    type: 'initiative',
    hashtags: ['CodeForAfrica', 'Education', 'Programming'],
    likes: 789,
    comments: 145,
    reposts: 234,
    timeAgo: '1d'
  },
  {
    id: '8',
    userId: '3',
    user: mockUsers[2],
    content: 'Research breakthrough: Our team identified genetic markers that could lead to better malaria treatment for African populations. Science saves lives! 🧬',
    type: 'text',
    hashtags: ['Research', 'Malaria', 'Healthcare'],
    likes: 567,
    comments: 89,
    reposts: 67,
    timeAgo: '2d'
  },
  {
    id: '9',
    userId: '4',
    user: mockUsers[3],
    content: 'The African startup ecosystem raised $4.3B this year! 📈 The innovation happening across the continent is incredible. What sector are you most excited about?',
    type: 'text',
    hashtags: ['Startups', 'Investment', 'Innovation'],
    likes: 432,
    comments: 98,
    reposts: 54,
    timeAgo: '2d'
  },
  {
    id: '10',
    userId: '5',
    user: mockUsers[4],
    content: 'Building authentic African narratives in global advertising. Our latest campaign showcases the diversity and beauty of our continent. 🌍',
    type: 'text',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=300&fit=crop',
    hashtags: ['Advertising', 'Africa', 'Storytelling'],
    likes: 678,
    comments: 123,
    reposts: 87,
    timeAgo: '3d'
  }
];

// Mock events
export const mockEvents: MockEvent[] = [
  {
    id: '1',
    title: 'African Tech Summit 2025',
    date: '2025-08-15',
    location: 'Lagos, Nigeria',
    attendees: 2500,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Diaspora Investment Webinar',
    date: '2025-07-12',
    location: 'Virtual Event',
    attendees: 1200,
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'Healthcare Innovation Forum',
    date: '2025-09-03',
    location: 'Accra, Ghana',
    attendees: 800,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop'
  }
];

// Mock jobs
export const mockJobs: MockJob[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechHub Africa',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    postedBy: 'Chinedu Okwu',
    timeAgo: '2d'
  },
  {
    id: '2',
    title: 'Investment Analyst',
    company: 'Diaspora Capital',
    location: 'London, UK',
    type: 'Full-time',
    postedBy: 'Kwame Asante',
    timeAgo: '1w'
  }
];

// Mock initiatives
export const mockInitiatives: MockInitiative[] = [
  {
    id: '1',
    title: 'Code for Africa Initiative',
    description: 'Teaching programming skills to young people across African cities',
    impactArea: 'Education & Technology',
    supporters: 2341,
    goal: 10000,
    raised: 6500
  },
  {
    id: '2',
    title: 'Clean Water Wells Project',
    description: 'Drilling clean water wells in drought-affected communities',
    impactArea: 'Water & Sanitation',
    supporters: 1876,
    goal: 500,
    raised: 320
  }
];

// Mock trending hashtags
export const mockTrendingHashtags = [
  { tag: 'AfricanTech', posts: 2341 },
  { tag: 'DiasporaImpact', posts: 1876 },
  { tag: 'Innovation', posts: 1543 },
  { tag: 'Investment', posts: 1234 },
  { tag: 'Healthcare', posts: 987 }
];

// Mock suggested users to follow
export const mockSuggestedUsers = [
  {
    id: '6',
    name: 'Prof. Mandla Ndebele',
    title: 'University Professor',
    company: 'Oxford University',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    mutualConnections: 23
  },
  {
    id: '7',
    name: 'Aisha Koné',
    title: 'Climate Scientist',
    company: 'UN Environment',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    mutualConnections: 15
  },
  {
    id: '8',
    name: 'Jomo Kigali',
    title: 'Renewable Energy Engineer',
    company: 'Tesla',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    mutualConnections: 31
  }
];

// Mock saved content
export const mockSavedContent = [
  {
    id: '1',
    title: 'African Tech Ecosystem Report 2024',
    type: 'article',
    author: 'Amara Okafor',
    timeAgo: '3d'
  },
  {
    id: '2',
    title: 'Investment Opportunities in AgriTech',
    type: 'post',
    author: 'Kwame Asante',
    timeAgo: '1w'
  },
  {
    id: '3',
    title: 'Healthcare Innovation Summit',
    type: 'event',
    author: 'Dr. Fatima Al-Rashid',
    timeAgo: '2w'
  }
];