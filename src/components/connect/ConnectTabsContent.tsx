
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EmptyState from './EmptyState';
import ConnectEventsTab from './tabs/ConnectEventsTab';
import { Professional, Community, Event } from '@/types/search';

interface ConnectTabsContentProps {
  // Data
  professionals: Professional[];
  communities: Community[];
  events: Event[];
  
  // Event handlers
  onConnect: (professionalId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  onJoinCommunity: () => void;
  onEventClick: (event: Event) => void;
  onRegisterEvent: (event: Event) => void;
  onCreatorClick: (creatorId: string) => void;
  onViewAll: () => void;
  onRefresh: () => void;
  
  // State
  getConnectionStatus: (professionalId: string) => any;
  isLoggedIn: boolean;
}

const ConnectTabsContent: React.FC<ConnectTabsContentProps> = ({
  professionals,
  communities,
  events,
  onConnect,
  onMessage,
  onJoinCommunity,
  onEventClick,
  onRegisterEvent,
  onCreatorClick,
  onViewAll,
  onRefresh,
  getConnectionStatus,
  isLoggedIn
}) => {
  // Additional mock communities for demo purposes
  const additionalCommunities: Community[] = [
    {
      id: 'extra1',
      name: 'Diaspora Investment Circle',
      description: 'Connecting African diaspora investors with high-impact investment opportunities across Africa.',
      category: 'Business',
      member_count: 890,
      is_featured: true,
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra2', 
      name: 'Women in African Tech',
      description: 'Empowering African women in technology through mentorship and networking.',
      category: 'Technology',
      member_count: 650,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra3',
      name: 'African Healthcare Innovation',
      description: 'Advancing healthcare solutions and medical innovation across Africa.',
      category: 'Healthcare',
      member_count: 420,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra4',
      name: 'Sustainable Energy Africa',
      description: 'Promoting renewable energy and sustainable development across African communities.',
      category: 'Energy',
      member_count: 380,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra5',
      name: 'African Creative Industries',
      description: 'Supporting artists, designers, and creative professionals in the diaspora.',
      category: 'Creative',
      member_count: 720,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra6',
      name: 'Financial Inclusion Africa',
      description: 'Driving financial technology and inclusion initiatives across African markets.',
      category: 'Finance',
      member_count: 540,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra7',
      name: 'African Agriculture Tech',
      description: 'Modernizing agriculture through technology and sustainable farming practices.',
      category: 'Agriculture',
      member_count: 310,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra8',
      name: 'African Youth Development',
      description: 'Mentoring and supporting the next generation of African leaders.',
      category: 'Education',
      member_count: 950,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'  
    },
    {
      id: 'extra9',
      name: 'Pan-African Legal Network',
      description: 'Connecting legal professionals working on African development and policy.',
      category: 'Legal',
      member_count: 260,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra10',
      name: 'African Media & Communications',
      description: 'Journalists, content creators, and media professionals telling African stories.',
      category: 'Media',
      member_count: 480,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Additional mock professionals for demo purposes
  const additionalProfessionals: Professional[] = [
    {
      id: 'prof11',
      full_name: 'Dr. Aminata Touré',
      profession: 'Biomedical Engineer',
      company: 'UNICEF Health Innovation',
      location: 'Geneva, Switzerland',
      country_of_origin: 'Burkina Faso',
      bio: 'Designing low-cost medical devices and health solutions for underserved communities in Africa.',
      skills: ['Biomedical Engineering', 'Medical Devices', 'Global Health', 'Innovation'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof12',
      full_name: 'Emmanuel Nyong',
      profession: 'Blockchain Developer',
      company: 'ConsenSys Africa',
      location: 'Cape Town, South Africa',
      country_of_origin: 'Cameroon',
      bio: 'Building decentralized finance solutions to increase financial access across Africa.',
      skills: ['Blockchain', 'Smart Contracts', 'DeFi', 'Cryptocurrency'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof13',
      full_name: 'Zainab Hassan',
      profession: 'Social Impact Strategist',
      company: 'Gates Foundation',
      location: 'Seattle, USA',
      country_of_origin: 'Sudan',
      bio: 'Leading strategic initiatives to address poverty and improve education outcomes in Africa.',
      skills: ['Social Impact', 'Strategy', 'Education', 'Non-profit Management'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof14',
      full_name: 'Thabo Mthembu',
      profession: 'Supply Chain Innovator',
      company: 'Maersk Africa',
      location: 'Copenhagen, Denmark',
      country_of_origin: 'South Africa',
      bio: 'Revolutionizing logistics and supply chain operations to boost intra-African trade.',
      skills: ['Supply Chain', 'Logistics', 'Trade Finance', 'Operations'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof15',
      full_name: 'Mariam Keita',
      profession: 'Fashion Tech Entrepreneur',
      company: 'African Styles Global',
      location: 'Milan, Italy',
      country_of_origin: 'Mali',
      bio: 'Connecting African fashion designers with global markets through e-commerce platforms.',
      skills: ['Fashion Technology', 'E-commerce', 'Brand Development', 'Digital Marketing'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof16',
      full_name: 'Dr. Joseph Banda',
      profession: 'Water Resources Engineer',
      company: 'World Bank Water Global Practice',
      location: 'Washington DC, USA',
      country_of_origin: 'Zambia',
      bio: 'Developing sustainable water infrastructure projects across Sub-Saharan Africa.',
      skills: ['Water Engineering', 'Infrastructure', 'Project Finance', 'Sustainability'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof17',
      full_name: 'Asha Mohammed',
      profession: 'Digital Rights Advocate',
      company: 'Mozilla Foundation',
      location: 'Berlin, Germany',
      country_of_origin: 'Ethiopia',
      bio: 'Championing digital privacy and internet freedom across Africa and the Middle East.',
      skills: ['Digital Rights', 'Policy Advocacy', 'Internet Governance', 'Human Rights'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof18',
      full_name: 'Charles Ochieng',
      profession: 'Sports Management Executive',
      company: 'FIFA Development Office',
      location: 'Zurich, Switzerland',
      country_of_origin: 'Kenya',
      bio: 'Promoting football development and infrastructure investment across African nations.',
      skills: ['Sports Management', 'Event Planning', 'Stakeholder Relations', 'Business Development'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof19',
      full_name: 'Nkiru Okwu',
      profession: 'Mental Health Advocate',
      company: 'WHO Africa Region',
      location: 'Brazzaville, Congo',
      country_of_origin: 'Nigeria',
      bio: 'Leading mental health awareness campaigns and policy development across Africa.',
      skills: ['Mental Health', 'Public Health', 'Policy Development', 'Community Outreach'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof20',
      full_name: 'Yusuf Al-Maktoum',
      profession: 'Green Finance Specialist',
      company: 'Islamic Development Bank',
      location: 'Jeddah, Saudi Arabia',
      country_of_origin: 'Somalia',
      bio: 'Structuring green bonds and climate finance solutions for sustainable development in Africa.',
      skills: ['Green Finance', 'Climate Finance', 'Islamic Banking', 'Sustainable Development'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof21',
      full_name: 'Dr. Fatima Benali',
      profession: 'Climate Scientist',
      company: 'IPCC Working Group',
      location: 'Paris, France',
      country_of_origin: 'Morocco',
      bio: 'Leading climate adaptation research and policy development for North African countries.',
      skills: ['Climate Science', 'Environmental Policy', 'Research', 'Data Analysis'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof22',
      full_name: 'Kwame Asante',
      profession: 'Digital Marketing Strategist',
      company: 'Google Africa',
      location: 'Dublin, Ireland',
      country_of_origin: 'Ghana',
      bio: 'Helping African businesses scale globally through digital marketing and e-commerce solutions.',
      skills: ['Digital Marketing', 'E-commerce', 'Brand Strategy', 'Growth Hacking'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof23',
      full_name: 'Aisha Nakamura',
      profession: 'Cybersecurity Expert',
      company: 'Microsoft Japan',
      location: 'Tokyo, Japan',
      country_of_origin: 'Tanzania',
      bio: 'Securing digital infrastructure and promoting cybersecurity awareness across East Africa.',
      skills: ['Cybersecurity', 'Information Security', 'Risk Management', 'Digital Privacy'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof24',
      full_name: 'Dr. Ibrahim Sow',
      profession: 'Agricultural Economist',
      company: 'FAO Headquarters',
      location: 'Rome, Italy',
      country_of_origin: 'Senegal',
      bio: 'Developing food security policies and sustainable agriculture programs across the Sahel region.',
      skills: ['Agricultural Economics', 'Food Security', 'Policy Development', 'Rural Development'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof25',
      full_name: 'Grace Mwangi',
      profession: 'EdTech Entrepreneur',
      company: 'EduKenyan Solutions',
      location: 'Vancouver, Canada',
      country_of_origin: 'Kenya',
      bio: 'Creating innovative educational technology solutions for remote learning in African schools.',
      skills: ['Educational Technology', 'Product Development', 'Startup Management', 'UI/UX Design'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof26',
      full_name: 'Omar El-Rashid',
      profession: 'Renewable Energy Engineer',
      company: 'Tesla Energy',
      location: 'Austin, USA',
      country_of_origin: 'Egypt',
      bio: 'Leading solar and wind energy projects to power rural communities across Africa.',
      skills: ['Renewable Energy', 'Solar Engineering', 'Project Management', 'Sustainability'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof27',
      full_name: 'Naledi Motsepe',
      profession: 'Mining Industry Analyst',
      company: 'Anglo American',
      location: 'London, UK',
      country_of_origin: 'South Africa',
      bio: 'Analyzing mining investments and promoting sustainable mining practices across Africa.',
      skills: ['Mining Analysis', 'Investment Analysis', 'Sustainability', 'Strategic Planning'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof28',
      full_name: 'Dr. Jean-Baptiste Mukendi',
      profession: 'Public Health Specialist',
      company: 'Médecins Sans Frontières',
      location: 'Brussels, Belgium',
      country_of_origin: 'Democratic Republic of Congo',
      bio: 'Coordinating emergency health responses and building healthcare capacity in conflict zones.',
      skills: ['Public Health', 'Emergency Medicine', 'Healthcare Systems', 'Crisis Management'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof29',
      full_name: 'Halima Aden',
      profession: 'Fashion & Cultural Ambassador',
      company: 'UNICEF Goodwill Ambassador',
      location: 'New York, USA',
      country_of_origin: 'Somalia',
      bio: 'Promoting African fashion globally while advocating for refugee rights and education.',
      skills: ['Fashion Industry', 'Cultural Diplomacy', 'Public Speaking', 'Brand Partnerships'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof30',
      full_name: 'Dr. Tendai Mukamuri',
      profession: 'AI Research Scientist',
      company: 'DeepMind',
      location: 'London, UK',
      country_of_origin: 'Zimbabwe',
      bio: 'Developing AI solutions for healthcare and education challenges in developing countries.',
      skills: ['Artificial Intelligence', 'Machine Learning', 'Healthcare AI', 'Research'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof31',
      full_name: 'Amara Traore',
      profession: 'Microfinance Director',
      company: 'Grameen Foundation',
      location: 'Washington DC, USA',
      country_of_origin: 'Ivory Coast',  
      bio: 'Expanding financial inclusion through microfinance and mobile banking solutions in West Africa.',
      skills: ['Microfinance', 'Financial Inclusion', 'Mobile Banking', 'Development Finance'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof32',
      full_name: 'Dr. Samuel Wanjiku',
      profession: 'Biotechnology Researcher',
      company: 'Novartis Research',
      location: 'Basel, Switzerland',
      country_of_origin: 'Kenya',
      bio: 'Researching tropical disease treatments and developing affordable pharmaceuticals for Africa.',
      skills: ['Biotechnology', 'Drug Development', 'Research', 'Pharmaceutical Science'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof33',
      full_name: 'Blessing Okoro',
      profession: 'Film & Media Producer',
      company: 'Nollywood Global',
      location: 'Los Angeles, USA',
      country_of_origin: 'Nigeria',
      bio: 'Bringing African stories to global audiences through film and digital media production.',
      skills: ['Film Production', 'Media Strategy', 'Content Creation', 'International Distribution'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof34',
      full_name: 'Dr. Lila Rasoamanana',
      profession: 'Marine Biologist',
      company: 'UNESCO Marine Programme',
      location: 'Sydney, Australia',
      country_of_origin: 'Madagascar',
      bio: 'Protecting Indian Ocean marine ecosystems and promoting sustainable fishing practices.',
      skills: ['Marine Biology', 'Conservation', 'Sustainable Fisheries', 'Environmental Research'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof35',
      full_name: 'Hassan Juma',
      profession: 'Logistics Technology CEO',
      company: 'AfriTransport Tech',
      location: 'Mumbai, India',
      country_of_origin: 'Tanzania',
      bio: 'Revolutionizing supply chain logistics and transportation across East African corridors.',
      skills: ['Logistics Technology', 'Supply Chain', 'Transportation', 'Business Strategy'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof36',
      full_name: 'Dr. Esther Mwangi',
      profession: 'Space Technology Engineer',
      company: 'European Space Agency',
      location: 'Munich, Germany',
      country_of_origin: 'Kenya',
      bio: 'Developing satellite technology for climate monitoring and disaster management in Africa.',
      skills: ['Space Technology', 'Satellite Engineering', 'Climate Monitoring', 'Data Systems'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof37',
      full_name: 'Rasheed Al-Mansouri',
      profession: 'Islamic Banking Executive',
      company: 'Dubai Islamic Bank',
      location: 'Dubai, UAE',
      country_of_origin: 'Chad',
      bio: 'Expanding Sharia-compliant financial services and trade finance across Sub-Saharan Africa.',
      skills: ['Islamic Banking', 'Trade Finance', 'Financial Services', 'Cross-border Payments'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof38',
      full_name: 'Chinelo Okwu',
      profession: 'Urban Planning Consultant',
      company: 'UN-Habitat',
      location: 'Singapore',
      country_of_origin: 'Nigeria',
      bio: 'Designing sustainable cities and smart infrastructure solutions for rapidly growing African urban centers.',
      skills: ['Urban Planning', 'Smart Cities', 'Infrastructure Design', 'Sustainable Development'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof39',
      full_name: 'Dr. Kofi Mensah',
      profession: 'Pharmaceutical Innovation Director',
      company: 'Johnson & Johnson',
      location: 'São Paulo, Brazil',
      country_of_origin: 'Ghana',
      bio: 'Leading drug discovery programs focused on neglected tropical diseases affecting Africa.',
      skills: ['Pharmaceutical Research', 'Drug Discovery', 'Clinical Trials', 'Global Health'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof40',
      full_name: 'Safiya Hassan',
      profession: 'Gender Equality Advocate',  
      company: 'UN Women',
      location: 'Nairobi, Kenya',
      country_of_origin: 'Djibouti',
      bio: 'Promoting women empowerment and gender equality across the Horn of Africa region.',
      skills: ['Gender Advocacy', 'Women Empowerment', 'Policy Development', 'Program Management'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof41',
      full_name: 'Dr. Abdoul Karim',
      profession: 'Telecommunications Engineer',
      company: 'Huawei Technologies',
      location: 'Shenzhen, China',
      country_of_origin: 'Niger',
      bio: 'Building 5G infrastructure and digital connectivity solutions across the Sahel region.',
      skills: ['Telecommunications', '5G Technology', 'Network Infrastructure', 'Digital Connectivity'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof42',
      full_name: 'Princess Nakamura',
      profession: 'Impact Investment Manager',
      company: 'Acumen Academy',
      location: 'Mumbai, India',
      country_of_origin: 'Rwanda',
      bio: 'Directing impact investments in healthcare, education, and financial inclusion across East Africa.',
      skills: ['Impact Investing', 'Social Finance', 'Due Diligence', 'Portfolio Management'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof43',
      full_name: 'Dr. Moses Kiggundu',
      profession: 'Infectious Disease Specialist',
      company: 'WHO Regional Office',
      location: 'Geneva, Switzerland',
      country_of_origin: 'Uganda',
      bio: 'Leading global response to infectious disease outbreaks and strengthening health systems in Africa.',
      skills: ['Infectious Diseases', 'Epidemiology', 'Public Health', 'Health Systems'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof44',
      full_name: 'Aminata Sy',
      profession: 'Cultural Heritage Curator',
      company: 'Louvre Museum',
      location: 'Paris, France',
      country_of_origin: 'Mali',
      bio: 'Preserving and showcasing African cultural heritage through international museum partnerships.',
      skills: ['Cultural Heritage', 'Museum Curation', 'Art History', 'Cultural Diplomacy'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof45',
      full_name: 'Dr. Patricia Nkomo',
      profession: 'Veterinary Epidemiologist',
      company: 'CGIAR Global Health',
      location: 'Edinburgh, Scotland',
      country_of_origin: 'Botswana',
      bio: 'Combating livestock diseases and improving food security through veterinary science.',
      skills: ['Veterinary Medicine', 'Epidemiology', 'Animal Health', 'Food Security'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof46',
      full_name: 'Ahmed El-Sharif',
      profession: 'Aviation Industry Executive',
      company: 'Qatar Airways',
      location: 'Doha, Qatar',
      country_of_origin: 'Libya',
      bio: 'Expanding air connectivity and aviation infrastructure across North and Central Africa.',
      skills: ['Aviation Management', 'Route Development', 'Airport Operations', 'Strategic Planning'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof47',
      full_name: 'Dr. Nomsa Daniels',
      profession: 'Social Innovation Researcher',
      company: 'Oxford Saïd Business School',
      location: 'Oxford, UK',
      country_of_origin: 'South Africa',
      bio: 'Researching social entrepreneurship and innovation ecosystems in emerging markets.',
      skills: ['Social Innovation', 'Entrepreneurship Research', 'Impact Measurement', 'Academic Research'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof48',
      full_name: 'Kwaku Boateng',
      profession: 'Renewable Energy Project Developer',
      company: 'Scatec Solar',
      location: 'Oslo, Norway',
      country_of_origin: 'Ghana',
      bio: 'Developing large-scale solar and wind projects to accelerate Africa\'s energy transition.',
      skills: ['Project Development', 'Renewable Energy Finance', 'Power Systems', 'Energy Policy'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof49',
      full_name: 'Dr. Fatoumata Diallo',
      profession: 'Nutrition & Food Science Researcher',
      company: 'IFPRI',
      location: 'Washington DC, USA',
      country_of_origin: 'Guinea',
      bio: 'Addressing malnutrition and developing nutrition-sensitive agriculture programs across West Africa.',
      skills: ['Nutrition Science', 'Food Security', 'Agricultural Research', 'Program Evaluation'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof50',
      full_name: 'Chinedu Okafor',
      profession: 'Blockchain & Cryptocurrency Expert',
      company: 'Binance Labs',
      location: 'Malta',
      country_of_origin: 'Nigeria',
      bio: 'Building cryptocurrency infrastructure and DeFi solutions to improve financial access in Africa.',
      skills: ['Blockchain Technology', 'Cryptocurrency', 'DeFi', 'Financial Technology'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof51',
      full_name: 'Dr. Rose Kiguli',
      profession: 'Pediatric Surgeon',
      company: 'Great Ormond Street Hospital',
      location: 'London, UK',
      country_of_origin: 'Uganda',
      bio: 'Training pediatric surgeons and establishing children\'s surgical centers across East Africa.',
      skills: ['Pediatric Surgery', 'Medical Training', 'Healthcare Systems', 'Global Surgery'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof52',
      full_name: 'Mamadou Traore',
      profession: 'Sports Development Manager',
      company: 'CAF (Confederation of African Football)',
      location: 'Cairo, Egypt',
      country_of_origin: 'Burkina Faso',
      bio: 'Developing football infrastructure and youth programs across West African countries.',
      skills: ['Sports Management', 'Youth Development', 'Infrastructure Planning', 'Program Management'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof53',
      full_name: 'Dr. Salma Ahmed',
      profession: 'Materials Science Engineer',
      company: 'Saudi Aramco Research',
      location: 'Dhahran, Saudi Arabia',
      country_of_origin: 'Sudan',
      bio: 'Developing advanced materials for renewable energy and construction applications in arid regions.',
      skills: ['Materials Science', 'Nanotechnology', 'Renewable Energy Materials', 'Research & Development'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof54',
      full_name: 'Wanjiku Kimathi',
      profession: 'Social Media Strategist',
      company: 'Meta (Facebook)',
      location: 'Menlo Park, USA',
      country_of_origin: 'Kenya',
      bio: 'Developing social media platforms and digital literacy programs for African markets.',
      skills: ['Social Media Strategy', 'Product Management', 'Digital Marketing', 'Community Building'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof55',
      full_name: 'Dr. Kone Bakary',
      profession: 'Tropical Disease Researcher',
      company: 'Institut Pasteur',
      location: 'Dakar, Senegal',
      country_of_origin: 'Ivory Coast',
      bio: 'Researching vaccines and treatments for malaria, dengue, and other tropical diseases.',
      skills: ['Infectious Disease Research', 'Vaccine Development', 'Microbiology', 'Clinical Research'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof56',
      full_name: 'Adaora Okafor',
      profession: 'Digital Banking Executive',
      company: 'Standard Bank Group',
      location: 'Johannesburg, South Africa',
      country_of_origin: 'Nigeria',
      bio: 'Leading digital transformation in banking and expanding financial services across Africa.',
      skills: ['Digital Banking', 'Financial Services', 'Digital Transformation', 'Mobile Payments'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof57',
      full_name: 'Dr. Fatou Bensouda',
      profession: 'International Lawyer',
      company: 'International Criminal Court',
      location: 'The Hague, Netherlands',
      country_of_origin: 'Gambia',
      bio: 'Advancing international justice and human rights law across Africa and globally.',
      skills: ['International Law', 'Human Rights', 'Criminal Justice', 'Legal Advocacy'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof58',
      full_name: 'Kofi Antwi',
      profession: 'Agtech Entrepreneur',
      company: 'AgroCorp Technologies',
      location: 'Accra, Ghana',
      country_of_origin: 'Ghana',
      bio: 'Developing precision agriculture tools and farm management software for smallholder farmers.',
      skills: ['Agricultural Technology', 'Precision Agriculture', 'Software Development', 'Farmer Training'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof59',
      full_name: 'Dr. Lilian Mutero',
      profession: 'Environmental Scientist',
      company: 'UNEP Headquarters',
      location: 'Nairobi, Kenya',
      country_of_origin: 'Zimbabwe',
      bio: 'Leading environmental conservation programs and climate adaptation strategies across Southern Africa.',
      skills: ['Environmental Science', 'Climate Adaptation', 'Conservation Biology', 'Policy Development'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof60',
      full_name: 'Hassan Omar',
      profession: 'Maritime Trade Specialist',
      company: 'Maerska Shipping',
      location: 'Copenhagen, Denmark',
      country_of_origin: 'Comoros',
      bio: 'Optimizing shipping routes and port operations to boost intra-African trade.',
      skills: ['Maritime Logistics', 'Port Operations', 'Trade Finance', 'Supply Chain Management'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof61',
      full_name: 'Dr. Maryam Hassan',
      profession: 'Nuclear Medicine Specialist',
      company: 'IAEA Technical Cooperation',
      location: 'Vienna, Austria',
      country_of_origin: 'Egypt',
      bio: 'Establishing nuclear medicine programs and cancer treatment centers across Africa.',
      skills: ['Nuclear Medicine', 'Medical Physics', 'Cancer Treatment', 'Healthcare Technology'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof62',
      full_name: 'Sekou Toure',
      profession: 'Music & Entertainment Executive',
      company: 'Universal Music Africa',
      location: 'Lagos, Nigeria',
      country_of_origin: 'Guinea-Bissau',
      bio: 'Promoting African music globally and developing the continent\'s entertainment industry.',
      skills: ['Music Industry', 'Entertainment Business', 'Artist Development', 'Digital Distribution'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof63',
      full_name: 'Dr. Agnes Kalibata',
      profession: 'Agricultural Development Specialist',
      company: 'AGRA (Alliance for a Green Revolution in Africa)',
      location: 'Kigali, Rwanda',
      country_of_origin: 'Rwanda',
      bio: 'Transforming African agriculture through sustainable farming practices and technology adoption.',
      skills: ['Agricultural Development', 'Food Systems', 'Sustainable Agriculture', 'Rural Development'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof64',
      full_name: 'Yusuf Kiranda',
      profession: 'Telecommunications Policy Expert',
      company: 'ITU Regional Office',
      location: 'Geneva, Switzerland',
      country_of_origin: 'Uganda',
      bio: 'Developing telecommunications policies and digital infrastructure strategies for African countries.',
      skills: ['Telecommunications Policy', 'Digital Infrastructure', 'Regulatory Affairs', 'ICT Development'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof65',
      full_name: 'Dr. Amina Kone',
      profession: 'Reproductive Health Specialist',
      company: 'UNFPA West Africa',
      location: 'Dakar, Senegal',
      country_of_origin: 'Mali',
      bio: 'Improving maternal health outcomes and family planning services across the Sahel region.',
      skills: ['Reproductive Health', 'Maternal Health', 'Public Health Programs', 'Health Policy'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof66',
      full_name: 'Dr. Christophe Mbarga',
      profession: 'Forestry & Conservation Scientist',
      company: 'CIFOR',
      location: 'Bogor, Indonesia',
      country_of_origin: 'Cameroon',
      bio: 'Researching sustainable forest management and REDD+ programs in the Congo Basin.',
      skills: ['Forest Conservation', 'Climate Change Mitigation', 'Biodiversity', 'Environmental Research'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof67',
      full_name: 'Folake Solanke',
      profession: 'Fashion Design & Retail Executive',
      company: 'ASOS Africa',
      location: 'London, UK',
      country_of_origin: 'Nigeria',
      bio: 'Bringing African fashion to global retail markets and supporting emerging designers.',
      skills: ['Fashion Design', 'Retail Management', 'Brand Development', 'International Markets'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof68',
      full_name: 'Dr. Tarek Mahmoud',
      profession: 'Water Engineering Consultant',
      company: 'World Bank MENA',
      location: 'Beirut, Lebanon',
      country_of_origin: 'Egypt',
      bio: 'Designing water infrastructure and desalination projects for water-scarce regions in Africa.',
      skills: ['Water Engineering', 'Desalination', 'Infrastructure Design', 'Project Management'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof69',
      full_name: 'Grace Nakimuli',
      profession: 'Healthcare Innovation Manager',
      company: 'Philips Healthcare',
      location: 'Amsterdam, Netherlands',
      country_of_origin: 'Uganda',
      bio: 'Developing medical technology solutions adapted for resource-limited healthcare settings.',
      skills: ['Healthcare Innovation', 'Medical Technology', 'Product Development', 'Global Health'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof70',
      full_name: 'Dr. Adebayo Ogundimu',
      profession: 'Artificial Intelligence Researcher',
      company: 'Google Research',
      location: 'Mountain View, USA',
      country_of_origin: 'Nigeria',
      bio: 'Developing AI applications for agriculture, healthcare, and education in emerging markets.',
      skills: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'Natural Language Processing'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const [viewMoreClicks, setViewMoreClicks] = useState({
    professionals: 0,
    communities: 0
  });

  const allProfessionals = [...professionals, ...additionalProfessionals];
  const allCommunities = [...communities, ...additionalCommunities];
  
  // Show initial limited set, then add 10 more each time
  const getVisibleProfessionals = () => {
    const initialCount = 6; // Show only 6 initially
    const additionalPerClick = 10; // Add 10 more each time
    const totalToShow = initialCount + (viewMoreClicks.professionals * additionalPerClick);
    return allProfessionals.slice(0, totalToShow);
  };

  const getVisibleCommunities = () => {
    const initialCount = 9; // Show only 9 initially  
    const additionalPerClick = 10; // Add 10 more each time
    const totalToShow = initialCount + (viewMoreClicks.communities * additionalPerClick);
    return allCommunities.slice(0, totalToShow);
  };

  const handleViewMoreProfessionals = () => {
    setViewMoreClicks(prev => ({
      ...prev,
      professionals: prev.professionals + 1
    }));
  };

  const handleViewMoreCommunities = () => {
    setViewMoreClicks(prev => ({
      ...prev,
      communities: prev.communities + 1
    }));
  };

  const visibleProfessionals = getVisibleProfessionals();
  const visibleCommunities = getVisibleCommunities();
  
  const hasMoreProfessionals = visibleProfessionals.length < allProfessionals.length;
  const hasMoreCommunities = visibleCommunities.length < allCommunities.length;
  return (
    <>
      <TabsContent value="professionals">
        {professionals.length === 0 ? (
          <EmptyState type="professionals" onRefresh={onRefresh} />
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {visibleProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onConnect={() => onConnect(professional.id)}
                  onMessage={() => onMessage(professional.id, professional.full_name)}
                  connectionStatus={getConnectionStatus(professional.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            
            {hasMoreProfessionals && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreProfessionals}
                >
                  View More Professionals
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="communities">
        {communities.length === 0 ? (
          <EmptyState type="communities" onRefresh={onRefresh} />
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCommunities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onJoin={onJoinCommunity}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            
            {hasMoreCommunities && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreCommunities}
                >
                  View More Communities
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="events">
        {events.length === 0 ? (
          <EmptyState type="events" onRefresh={onRefresh} />
        ) : (
          <ConnectEventsTab
            events={events}
            onEventClick={onEventClick}
            onRegisterEvent={onRegisterEvent}
            onCreatorClick={onCreatorClick}
            onViewAll={onViewAll}
          />
        )}
      </TabsContent>
    </>
  );
};

export default ConnectTabsContent;
