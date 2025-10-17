import { useState } from 'react';

export interface ImpactStory {
  id: string;
  title: string;
  author: string;
  authorTitle?: string;
  reach: string;
  engagement: string;
  category: string;
  impact: string;
  content?: string;
  imageUrl?: string;
  date: string;
  featured: boolean;
}

export const useConveyLogic = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isShareStoryDialogOpen, setIsShareStoryDialogOpen] = useState(false);
  const [isStoryDetailOpen, setIsStoryDetailOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<ImpactStory | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const impactStories: ImpactStory[] = [
    {
      id: "1",
      title: 'Solar Energy Revolution in Rwanda',
      author: 'Dr. Amara Okafor',
      authorTitle: 'Renewable Energy Specialist',
      reach: '2.5M',
      engagement: '45K',
      category: 'Energy',
      impact: 'Inspired 12 new solar projects across East Africa',
      content: 'Our team successfully implemented solar panel systems in 50 rural schools, providing clean energy and educational opportunities to over 15,000 students.',
      date: '2025-01-15',
      featured: true
    },
    {
      id: "2",
      title: 'EdTech Transforming Ghana Schools',
      author: 'Prof. Kwame Asante',
      authorTitle: 'Education Technology Director',
      reach: '1.8M',
      engagement: '32K',
      category: 'Education',
      impact: '500 schools adopted the platform, reaching 200K students',
      content: 'Digital learning platform now serving students across Ghana with personalized curriculum and real-time teacher support.',
      date: '2025-01-10',
      featured: true
    },
    {
      id: "3",
      title: 'AgriTech Innovation in Kenya',
      author: 'Sarah Wanjiru',
      authorTitle: 'Agricultural Technology Founder',
      reach: '3.2M',
      engagement: '58K',
      category: 'Agriculture',
      impact: '10,000 farmers benefited, income increased by 40%',
      content: 'Blockchain-based supply chain platform connecting smallholder farmers directly to markets, eliminating middleman exploitation.',
      date: '2025-01-05',
      featured: true
    },
    {
      id: "4",
      title: 'Telemedicine Reaches Rural Nigeria',
      author: 'Dr. Chioma Nwankwo',
      authorTitle: 'Healthcare Innovation Lead',
      reach: '1.2M',
      engagement: '28K',
      category: 'Healthcare',
      impact: '25,000 patients served in remote areas',
      content: 'Mobile health units equipped with telemedicine technology bringing specialist care to underserved communities.',
      date: '2024-12-28',
      featured: false
    },
    {
      id: "5",
      title: 'FinTech Banking the Unbanked',
      author: 'Joseph Kamau',
      authorTitle: 'Financial Inclusion Strategist',
      reach: '4.1M',
      engagement: '67K',
      category: 'Finance',
      impact: '150,000 new mobile wallet users onboarded',
      content: 'Digital banking solution providing financial services to rural communities across Kenya, Tanzania, and Uganda.',
      date: '2024-12-20',
      featured: false
    },
    {
      id: "6",
      title: 'Clean Water Initiative in Ghana',
      author: 'Ama Osei',
      authorTitle: 'Environmental Engineer',
      reach: '900K',
      engagement: '19K',
      category: 'Environment',
      impact: '30 communities gained access to clean water',
      content: 'Innovative water filtration systems installed in rural communities, serving 50,000 people with clean drinking water.',
      date: '2024-12-15',
      featured: false
    }
  ];

  const stats = {
    totalReach: '12.5M+',
    storiesShared: 847,
    totalEngagements: '250K+',
    activeContributors: 356
  };

  const handleViewStory = (story: ImpactStory) => {
    setSelectedStory(story);
    setIsStoryDetailOpen(true);
  };

  const filteredStories = impactStories.filter(story => {
    return filterCategory === 'all' || story.category === filterCategory;
  });

  return {
    impactStories: filteredStories,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isShareStoryDialogOpen,
    setIsShareStoryDialogOpen,
    isStoryDetailOpen,
    setIsStoryDetailOpen,
    selectedStory,
    handleViewStory,
    filterCategory,
    setFilterCategory
  };
};
