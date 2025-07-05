
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
  { id: 'climate', name: 'Climate & Environment', icon: '🌍', count: '34 Events', color: 'bg-emerald-500' },
  { id: 'agriculture', name: 'Agriculture & Food', icon: '🌾', count: '52 Events', color: 'bg-orange-500' },
  { id: 'finance', name: 'Fintech & Banking', icon: '💳', count: '73 Events', color: 'bg-indigo-500' },
  { id: 'energy', name: 'Energy & Mining', icon: '⚡', count: '41 Events', color: 'bg-amber-500' },
  { id: 'media', name: 'Media & Entertainment', icon: '🎭', count: '58 Events', color: 'bg-pink-500' },
  { id: 'transport', name: 'Transport & Logistics', icon: '🚛', count: '36 Events', color: 'bg-cyan-500' },
  { id: 'tourism', name: 'Tourism & Hospitality', icon: '✈️', count: '42 Events', color: 'bg-rose-500' },
  { id: 'governance', name: 'Governance & Policy', icon: '🏛️', count: '29 Events', color: 'bg-violet-500' },
  { id: 'innovation', name: 'Innovation & R&D', icon: '🔬', count: '63 Events', color: 'bg-teal-500' },
  { id: 'sports', name: 'Sports & Recreation', icon: '⚽', count: '47 Events', color: 'bg-lime-500' },
  { id: 'social', name: 'Social Impact', icon: '🤝', count: '81 Events', color: 'bg-sky-500' }
];

export const featuredCalendars = [
  {
    id: 'tech-innovators',
    name: 'African Tech Innovators',
    description: 'Curating the best tech events across Africa',
    logo: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=120&h=120&fit=crop&crop=face',
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
  },
  {
    id: 'climate-action',
    name: 'Climate Action Africa',
    description: 'Environmental sustainability and green innovation',
    logo: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=120&h=120&fit=crop',
    eventCount: 28,
    followers: 1650
  },
  {
    id: 'fintech-hub',
    name: 'African Fintech Hub',
    description: 'Financial technology and digital banking events',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=120&h=120&fit=crop',
    eventCount: 35,
    followers: 2800
  },
  {
    id: 'agri-innovation',
    name: 'AgriTech Innovation',
    description: 'Agricultural technology and sustainable farming',
    logo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=120&h=120&fit=crop',
    eventCount: 22,
    followers: 980
  },
  {
    id: 'healthcare-africa',
    name: 'Healthcare Africa',
    description: 'Medical innovation and healthcare solutions',
    logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=120&h=120&fit=crop',
    eventCount: 26,
    followers: 1420
  },
  {
    id: 'creative-economy',
    name: 'African Creative Economy',
    description: 'Arts, culture, and creative industries',
    logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop',
    eventCount: 31,
    followers: 1890
  },
  {
    id: 'education-leaders',
    name: 'Education Leaders Africa',
    description: 'Educational innovation and youth development',
    logo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop',
    eventCount: 29,
    followers: 1560
  },
  {
    id: 'energy-transition',
    name: 'Energy Transition Africa',
    description: 'Renewable energy and sustainable power solutions',
    logo: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=120&h=120&fit=crop',
    eventCount: 20,
    followers: 1230
  },
  {
    id: 'digital-governance',
    name: 'Digital Governance Hub',
    description: 'Digital transformation in public sector',
    logo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=120&h=120&fit=crop',
    eventCount: 16,
    followers: 740
  },
  {
    id: 'youth-entrepreneurs',
    name: 'Young African Entrepreneurs',
    description: 'Supporting the next generation of business leaders',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    eventCount: 38,
    followers: 3200
  },
  {
    id: 'diaspora-connect',
    name: 'Diaspora Connect',
    description: 'Building bridges between diaspora and homeland',
    logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop',
    eventCount: 27,
    followers: 1780
  }
];

export const localEvents = [
  { city: 'Lagos', count: 23, flag: '🇳🇬', color: 'bg-green-600' },
  { city: 'Nairobi', count: 18, flag: '🇰🇪', color: 'bg-red-600' },
  { city: 'Cape Town', count: 15, flag: '🇿🇦', color: 'bg-blue-600' },
  { city: 'Accra', count: 12, flag: '🇬🇭', color: 'bg-yellow-600' },
  { city: 'London', count: 45, flag: '🇬🇧', color: 'bg-blue-800' },
  { city: 'New York', count: 38, flag: '🇺🇸', color: 'bg-red-700' },
  { city: 'Toronto', count: 28, flag: '🇨🇦', color: 'bg-red-500' },
  { city: 'Paris', count: 22, flag: '🇫🇷', color: 'bg-blue-700' },
  { city: 'Berlin', count: 19, flag: '🇩🇪', color: 'bg-gray-700' },
  { city: 'Dubai', count: 31, flag: '🇦🇪', color: 'bg-emerald-600' },
  { city: 'Johannesburg', count: 26, flag: '🇿🇦', color: 'bg-orange-600' },
  { city: 'Cairo', count: 17, flag: '🇪🇬', color: 'bg-yellow-700' },
  { city: 'Addis Ababa', count: 14, flag: '🇪🇹', color: 'bg-green-700' },
  { city: 'Kigali', count: 11, flag: '🇷🇼', color: 'bg-blue-500' },
  { city: 'Dakar', count: 16, flag: '🇸🇳', color: 'bg-green-500' },
  { city: 'Atlanta', count: 35, flag: '🇺🇸', color: 'bg-purple-600' }
];
