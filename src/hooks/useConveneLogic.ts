import { useState } from 'react';

export interface ConveneEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'In-Person' | 'Virtual' | 'Hybrid';
  isVirtual: boolean;
  attendees: number;
  attendeeCount: number;
  category: string;
  organizer: {
    name: string;
    avatar: string | null;
  };
  creatorName: string;
  creatorImage: string;
  eventLogo: string;
  bannerImage: string;
  featured: boolean;
  spotsLeft?: number;
  price?: string;
}

export const useConveneLogic = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ConveneEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const upcomingEvents: ConveneEvent[] = [
    {
      id: "1",
      title: 'African Tech Summit 2025',
      description: 'The largest gathering of African tech innovators, investors, and entrepreneurs from across the diaspora.',
      date: 'March 15, 2025',
      time: '10:00 AM GMT',
      location: 'Nairobi, Kenya',
      type: 'In-Person',
      isVirtual: false,
      attendees: 250,
      attendeeCount: 250,
      category: 'Technology',
      organizer: {
        name: 'Tech Africa Alliance',
        avatar: null
      },
      creatorName: 'Dr. Amina Hassan',
      creatorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop',
      featured: true,
      spotsLeft: 50,
      price: '$150'
    },
    {
      id: "2",
      title: 'Diaspora Investment Forum',
      description: 'Connect with investment opportunities across Africa and learn from successful diaspora investors.',
      date: 'March 22, 2025',
      time: '2:00 PM EST',
      location: 'Virtual',
      type: 'Virtual',
      isVirtual: true,
      attendees: 500,
      attendeeCount: 500,
      category: 'Finance',
      organizer: {
        name: 'African Investment Network',
        avatar: null
      },
      creatorName: 'Prof. Kwame Asante',
      creatorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=200&fit=crop',
      featured: true,
      spotsLeft: 200,
      price: 'Free'
    },
    {
      id: "3",
      title: 'Healthcare Innovation Workshop',
      description: 'Hands-on workshop exploring telemedicine and healthcare tech solutions for rural Africa.',
      date: 'April 5, 2025',
      time: '9:00 AM WAT',
      location: 'Lagos, Nigeria',
      type: 'Hybrid',
      isVirtual: false,
      attendees: 150,
      attendeeCount: 150,
      category: 'Healthcare',
      organizer: {
        name: 'Dr. Amina Hassan',
        avatar: null
      },
      creatorName: 'Ibrahim Diallo',
      creatorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=200&fit=crop',
      featured: false,
      spotsLeft: 30,
      price: '$75'
    },
    {
      id: "4",
      title: 'AgriTech Networking Dinner',
      description: 'Intimate dinner gathering for AgriTech founders, investors, and industry experts.',
      date: 'April 12, 2025',
      time: '7:00 PM EAT',
      location: 'Accra, Ghana',
      type: 'In-Person',
      isVirtual: false,
      attendees: 45,
      attendeeCount: 45,
      category: 'Agriculture',
      organizer: {
        name: 'Ghana AgriTech Hub',
        avatar: null
      },
      creatorName: 'Sarah Mwangi',
      creatorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&h=200&fit=crop',
      featured: false,
      spotsLeft: 10,
      price: '$100'
    },
    {
      id: "5",
      title: 'EdTech Virtual Summit',
      description: 'Global summit on digital education transformation across African schools.',
      date: 'April 20, 2025',
      time: '11:00 AM GMT',
      location: 'Virtual',
      type: 'Virtual',
      isVirtual: true,
      attendees: 800,
      attendeeCount: 800,
      category: 'Education',
      organizer: {
        name: 'African EdTech Alliance',
        avatar: null
      },
      creatorName: 'Fatima Al-Rashid',
      creatorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=200&fit=crop',
      featured: true,
      spotsLeft: 300,
      price: 'Free'
    },
    {
      id: "6",
      title: 'Renewable Energy Expo',
      description: 'Explore cutting-edge renewable energy solutions and connect with green energy pioneers.',
      date: 'May 3, 2025',
      time: '9:00 AM SAST',
      location: 'Cape Town, South Africa',
      type: 'In-Person',
      isVirtual: false,
      attendees: 350,
      attendeeCount: 350,
      category: 'Energy',
      organizer: {
        name: 'Green Africa Foundation',
        avatar: null
      },
      creatorName: 'Dr. Chinedu Okonkwo',
      creatorImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=80&h=80&fit=crop&crop=face',
      eventLogo: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=500&h=200&fit=crop',
      featured: false,
      spotsLeft: 85,
      price: '$125'
    }
  ];

  const stats = {
    totalEvents: 127,
    totalAttendees: 15400,
    countriesReached: 28,
    upcomingEvents: upcomingEvents.length
  };

  const handleRegister = (event: ConveneEvent) => {
    setSelectedEvent(event);
    setIsRegisterDialogOpen(true);
  };

  const filteredEvents = upcomingEvents.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  return {
    upcomingEvents: filteredEvents,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isRegisterDialogOpen,
    setIsRegisterDialogOpen,
    isCreateEventDialogOpen,
    setIsCreateEventDialogOpen,
    selectedEvent,
    handleRegister,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory
  };
};
