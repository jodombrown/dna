import { useState } from 'react';

export interface ConveneEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'In-Person' | 'Virtual' | 'Hybrid';
  attendees: number;
  category: string;
  organizer: {
    name: string;
    avatar: string | null;
  };
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
      attendees: 250,
      category: 'Technology',
      organizer: {
        name: 'Tech Africa Alliance',
        avatar: null
      },
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
      attendees: 500,
      category: 'Finance',
      organizer: {
        name: 'African Investment Network',
        avatar: null
      },
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
      attendees: 150,
      category: 'Healthcare',
      organizer: {
        name: 'Dr. Amina Hassan',
        avatar: null
      },
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
      attendees: 45,
      category: 'Agriculture',
      organizer: {
        name: 'Ghana AgriTech Hub',
        avatar: null
      },
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
      attendees: 800,
      category: 'Education',
      organizer: {
        name: 'African EdTech Alliance',
        avatar: null
      },
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
      attendees: 350,
      category: 'Energy',
      organizer: {
        name: 'Green Africa Foundation',
        avatar: null
      },
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
