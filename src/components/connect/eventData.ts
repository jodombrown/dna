
import { Event } from '@/types/search';

export const sampleCreators = [
  {
    id: "u1",
    full_name: "Dr. Amara Okafor",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: "u2",
    full_name: "Kwame Asante",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: "u3",
    full_name: "Sarah Mwangi",
    avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: "u4",
    full_name: "Ibrahim Diallo",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: "u5",
    full_name: "Fatima Al-Rashid",
    avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face"
  }
];

export const additionalEvents: Event[] = [
  {
    id: "evt7",
    title: "Climate Innovation Summit",
    description: "Exploring climate solutions and green technology innovations across Africa and the diaspora community.",
    type: "Summit",
    date_time: "2024-08-15T14:00:00Z",
    location: "Accra, Ghana",
    is_virtual: false,
    attendee_count: 320,
    is_featured: false,
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
    banner_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=200&fit=crop",
    creator_profile: sampleCreators[0]
  },
  {
    id: "evt8", 
    title: "Women in STEM Leadership Forum",
    description: "Empowering the next generation of African women leaders in science, technology, engineering, and mathematics.",
    type: "Forum",
    date_time: "2024-08-20T16:00:00Z",
    location: "Virtual",
    is_virtual: true,
    attendee_count: 180,
    is_featured: false,
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
    banner_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=200&fit=crop",
    creator_profile: sampleCreators[2]
  },
  {
    id: "evt9",
    title: "Digital Financial Services Conference",
    description: "Revolutionizing financial inclusion through mobile money, fintech, and digital banking solutions.",
    type: "Conference",
    date_time: "2024-08-25T10:00:00Z", 
    location: "Nairobi, Kenya",
    is_virtual: false,
    attendee_count: 250,
    is_featured: false,
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
    banner_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=200&fit=crop",
    creator_profile: sampleCreators[3]
  }
];

export const eventCategories = [
  { id: 'tech', name: 'Technology', icon: '💻', count: '145 Events', color: 'bg-blue-500' },
  { id: 'business', name: 'Business & Finance', icon: '💼', count: '89 Events', color: 'bg-green-500' },
  { id: 'culture', name: 'Arts & Culture', icon: '🎨', count: '67 Events', color: 'bg-purple-500' },
  { id: 'health', name: 'Health & Wellness', icon: '🏥', count: '45 Events', color: 'bg-red-500' },
  { id: 'education', name: 'Education', icon: '📚', count: '78 Events', color: 'bg-yellow-500' },
  { id: 'climate', name: 'Climate & Environment', icon: '🌍', count: '34 Events', color: 'bg-emerald-500' }
];

export const featuredCalendars = [
  {
    id: 'tech-innovators',
    name: 'African Tech Innovators',
    description: 'Curating the best tech events across Africa',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop',
    eventCount: 24,
    followers: 1200
  },
  {
    id: 'diaspora-invest',
    name: 'Diaspora Investment Circle', 
    description: 'Investment opportunities and networking events',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop',
    eventCount: 18,
    followers: 850
  },
  {
    id: 'women-leadership',
    name: 'Women Leadership Network',
    description: 'Empowering African women in leadership',
    logo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop',
    eventCount: 32,
    followers: 2100
  }
];

export const localEvents = [
  { city: 'Lagos', count: 23, flag: '🇳🇬', color: 'bg-green-600' },
  { city: 'Nairobi', count: 18, flag: '🇰🇪', color: 'bg-red-600' },
  { city: 'Cape Town', count: 15, flag: '🇿🇦', color: 'bg-blue-600' },
  { city: 'Accra', count: 12, flag: '🇬🇭', color: 'bg-yellow-600' },
  { city: 'London', count: 45, flag: '🇬🇧', color: 'bg-blue-800' },
  { city: 'New York', count: 38, flag: '🇺🇸', color: 'bg-red-700' }
];
