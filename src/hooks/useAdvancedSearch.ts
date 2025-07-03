
import { useState, useEffect } from 'react';

interface Professional {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  avatar: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  attendeeCount: number;
}

interface Filters {
  location: string;
  industry: string;
  skills: string[];
}

interface ResultCounts {
  professionals: number;
  communities: number;
  events: number;
}

export const useAdvancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    location: '',
    industry: '',
    skills: []
  });
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultCounts, setResultCounts] = useState<ResultCounts>({
    professionals: 0,
    communities: 0,
    events: 0
  });

  // Mock data
  const mockProfessionals: Professional[] = [
    {
      id: '1',
      name: 'Amara Kone',
      title: 'Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'Python'],
      avatar: '/lovable-uploads/02154efb-0abe-4ed4-b41f-265e4a856e8d.png'
    },
    {
      id: '2',
      name: 'Kwame Asante',
      title: 'Investment Banker',
      company: 'Goldman Sachs',
      location: 'London, UK',
      skills: ['Finance', 'Investment', 'Analytics'],
      avatar: '/lovable-uploads/02154efb-0abe-4ed4-b41f-265e4a856e8d.png'
    }
  ];

  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'African Tech Professionals',
      description: 'Connecting African tech professionals worldwide',
      memberCount: 1250,
      category: 'Technology'
    },
    {
      id: '2',
      name: 'Women in African Business',
      description: 'Empowering African women entrepreneurs',
      memberCount: 850,
      category: 'Business'
    }
  ];

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'African Innovation Summit',
      date: '2024-03-15',
      location: 'Virtual',
      description: 'Annual summit for African innovators',
      attendeeCount: 500
    },
    {
      id: '2',
      title: 'Diaspora Investment Forum',
      date: '2024-04-20',
      location: 'New York, NY',
      description: 'Investment opportunities in Africa',
      attendeeCount: 200
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setProfessionals(mockProfessionals);
    setCommunities(mockCommunities);
    setEvents(mockEvents);
    setResultCounts({
      professionals: mockProfessionals.length,
      communities: mockCommunities.length,
      events: mockEvents.length
    });
  }, []);

  const performSearch = () => {
    setLoading(true);
    // Simulate search delay
    setTimeout(() => {
      // Filter based on search term
      const filteredProfessionals = mockProfessionals.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const filteredCommunities = mockCommunities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const filteredEvents = mockEvents.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setProfessionals(filteredProfessionals);
      setCommunities(filteredCommunities);
      setEvents(filteredEvents);
      setResultCounts({
        professionals: filteredProfessionals.length,
        communities: filteredCommunities.length,
        events: filteredEvents.length
      });
      setLoading(false);
    }, 1000);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({ location: '', industry: '', skills: [] });
    setProfessionals(mockProfessionals);
    setCommunities(mockCommunities);
    setEvents(mockEvents);
    setResultCounts({
      professionals: mockProfessionals.length,
      communities: mockCommunities.length,
      events: mockEvents.length
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    professionals,
    communities,
    events,
    loading,
    resultCounts,
    performSearch,
    clearSearch
  };
};
