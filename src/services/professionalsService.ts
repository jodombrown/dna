
import { Professional } from '@/types/search';

// Mock data for professionals
const mockProfessionals: Professional[] = [
  {
    id: 'prof-1',
    full_name: 'Dr. Amara Okafor',
    profession: 'FinTech Entrepreneur',
    company: 'Lagos Innovations',
    location: 'London, UK',
    bio: 'Passionate about financial inclusion in Africa through innovative technology solutions.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e3?w=150&h=150&fit=crop&crop=face',
    skills: ['FinTech', 'Blockchain', 'Financial Inclusion'],
    is_mentor: true,
    is_investor: false,
    looking_for_opportunities: false,
    years_experience: 8,
    country_of_origin: 'Nigeria'
  },
  {
    id: 'prof-2',
    full_name: 'Prof. Kwame Asante',
    profession: 'AgriTech Researcher',
    company: 'University of Ghana',
    location: 'Toronto, Canada',
    bio: 'Researching sustainable agriculture solutions for smallholder farmers across Africa.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skills: ['Agriculture', 'Sustainability', 'Research'],
    is_mentor: true,
    is_investor: true,
    looking_for_opportunities: true,
    years_experience: 15,
    country_of_origin: 'Ghana'
  },
  {
    id: 'prof-3',
    full_name: 'Sarah Mwangi',
    profession: 'Healthcare Innovation Lead',
    company: 'Nairobi Health Solutions',
    location: 'San Francisco, USA',
    bio: 'Building digital health platforms to improve healthcare access in rural communities.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    skills: ['Healthcare', 'Digital Health', 'Product Management'],
    is_mentor: false,
    is_investor: false,
    looking_for_opportunities: true,
    years_experience: 6,
    country_of_origin: 'Kenya'
  },
  {
    id: 'prof-4',
    full_name: 'Ibrahim Diallo',
    profession: 'Clean Energy Engineer',
    company: 'Sahel Solar',
    location: 'Paris, France',
    bio: 'Developing solar energy solutions for off-grid communities in West Africa.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skills: ['Solar Energy', 'Engineering', 'Sustainability'],
    is_mentor: true,
    is_investor: false,
    looking_for_opportunities: false,
    years_experience: 10,
    country_of_origin: 'Mali'
  },
  {
    id: 'prof-5',
    full_name: 'Fatima Al-Rashid',
    profession: 'EdTech Founder',
    company: 'Learn Africa',
    location: 'Dubai, UAE',
    bio: 'Creating accessible educational technology for African students worldwide.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    skills: ['Education', 'Technology', 'Entrepreneurship'],
    is_mentor: false,
    is_investor: true,
    looking_for_opportunities: true,
    years_experience: 7,
    country_of_origin: 'Morocco'
  }
];

export const fetchProfessionals = async (searchTerm?: string): Promise<Professional[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!searchTerm) {
    return mockProfessionals;
  }

  // Filter professionals based on search term
  const filtered = mockProfessionals.filter(professional =>
    professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.skills?.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    professional.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return filtered;
};
