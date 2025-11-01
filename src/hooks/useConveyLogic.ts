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
    // === ALL STORIES / FEATURED ===
    {
      id: "featured1",
      title: 'Fintech Revolution: $500M in Remittances Now Fee-Free to Africa',
      author: 'Abena Osei',
      authorTitle: 'Financial Inclusion Director, AfriPay Global',
      reach: '5.2M',
      engagement: '234K',
      category: 'Finance',
      impact: '$500M sent home fee-free, saving families $35M in transaction costs',
      content: 'A Ghanaian-British fintech founder has launched a revolutionary remittance platform that eliminates transfer fees using blockchain technology. AfriPay Global partners with mobile money providers across 30 African countries, allowing diaspora families to send money home instantly at zero cost. In just six months, the platform has processed over $500M in transfers, saving African families an estimated $35M in fees they would have paid to traditional services. The platform has secured $80M in venture funding and is expanding to include microloans and investment products.',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
      date: '2025-01-29',
      featured: true
    },
    {
      id: "featured2",
      title: 'Reforestation Initiative Plants 50M Trees Across the Sahel',
      author: 'Amina Diallo',
      authorTitle: 'Environmental Restoration Director, Green Sahel Coalition',
      reach: '4.1M',
      engagement: '187K',
      category: 'Environment',
      impact: '50M trees planted, 500K hectares restored, 10K jobs created',
      content: 'A coalition of West African diaspora environmentalists has mobilized $100M to combat desertification across the Sahel region. The Green Sahel Coalition has planted 50 million trees across Senegal, Mali, Niger, Chad, and Burkina Faso, employing local communities in the world\'s largest reforestation effort. The initiative uses drought-resistant native species and innovative water harvesting techniques developed by diaspora scientists. Early results show significant soil restoration and increased agricultural productivity in participating regions.',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
      date: '2025-01-28',
      featured: true
    },
    {
      id: "featured3",
      title: 'Kenyan Educator\'s AI Platform Reaches 2 Million Students Across Africa',
      author: 'Prof. Wanjiru Kamau',
      authorTitle: 'Education Technology Director, Stanford-Africa Innovation Lab',
      reach: '4.2M',
      engagement: '198K',
      category: 'Education',
      impact: '2M students served, 40% improvement in STEM scores across 12 countries',
      content: 'Dr. Wanjiru Kamau, a Kenyan computer scientist who earned her PhD at Stanford, has developed an AI-powered adaptive learning platform that works offline and on low-bandwidth networks. The platform, called "Elimu AI," personalizes education for each student and works in 15 African languages. Backed by $50M in diaspora funding, it\'s now deployed in schools across Kenya, Tanzania, Uganda, Rwanda, Ghana, Nigeria, and six other nations. Teachers report dramatic improvements in student engagement and comprehension.',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
      date: '2025-01-26',
      featured: true
    },

    // === ALL STORIES / TOP STORIES ===
    {
      id: "top1",
      title: 'Nigerian Diaspora Launches Africa\'s Largest Solar Farm in Kano',
      author: 'Dr. Amara Okafor',
      authorTitle: 'Renewable Energy Specialist, MIT-Africa Initiative',
      reach: '3.8M',
      engagement: '127K',
      category: 'Energy',
      impact: 'Powers 250,000 homes and inspired 12 new solar projects across West Africa',
      content: 'A consortium of Nigerian-American engineers and investors has completed construction of a 500MW solar facility in Kano State, creating 2,000 jobs and providing reliable electricity to previously underserved communities. The project leverages breakthrough photovoltaic technology developed at MIT, reducing costs by 40% compared to traditional solar installations. Local youth are being trained in maintenance and operations, ensuring sustainable knowledge transfer.',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
      date: '2025-01-25',
      featured: false
    },
    {
      id: "top2",
      title: 'Zimbabwean Agronomist\'s Drought-Resistant Seeds Transform Farming',
      author: 'Dr. Tendai Moyo',
      authorTitle: 'Agricultural Innovation Specialist, Climate Resilience Institute',
      reach: '3.5M',
      engagement: '145K',
      category: 'Agriculture',
      impact: '250K farmers adopted new seeds, crop yields up 65% in drought-prone areas',
      content: 'Dr. Tendai Moyo, who spent 15 years researching at UC Davis before returning to Zimbabwe, has developed genetically improved seed varieties that thrive with 50% less water. The non-GMO seeds are being distributed through farmer cooperatives across Southern Africa. Combined with mobile app-based farming advice from diaspora agronomists, farmers are experiencing unprecedented harvests even during dry seasons. The World Food Programme has recognized the initiative as a breakthrough in climate adaptation.',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
      date: '2025-01-23',
      featured: false
    },
    {
      id: "top3",
      title: 'Diaspora Bond Raises $2B for African Infrastructure Projects',
      author: 'Mohamed Hassan',
      authorTitle: 'Investment Banking Analyst, Diaspora Capital Markets',
      reach: '3.6M',
      engagement: '156K',
      category: 'Finance',
      impact: '$2B raised for roads, hospitals, schools across 8 African nations',
      content: 'In a groundbreaking financial initiative, African diaspora investors have purchased $2 billion in diaspora bonds to fund critical infrastructure projects. The bonds offer competitive returns while directly supporting development in investors\' home countries. Projects include highway construction in Ethiopia, hospital expansion in Rwanda, and school building in Senegal.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      date: '2025-01-20',
      featured: false
    },
    {
      id: "top4",
      title: 'Ugandan Doctor\'s Telemedicine Network Serves 500K Rural Patients',
      author: 'Dr. Nakato Olivia',
      authorTitle: 'Healthcare Innovation Lead, Pan-African Health Network',
      reach: '3.1M',
      engagement: '134K',
      category: 'Healthcare',
      impact: '500K patients treated remotely, maternal mortality reduced by 30%',
      content: 'Dr. Olivia Nakato, trained at Johns Hopkins and now based in Kampala, has established Africa\'s largest telemedicine network connecting rural health workers with specialist doctors via smartphone apps. The platform offers real-time consultations, AI-assisted diagnostics, and emergency response coordination. Funded by diaspora healthcare professionals, the network has reduced maternal mortality rates by 30% in participating regions and saved countless lives through early disease detection.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
      date: '2025-01-18',
      featured: false
    },

    // === ALL STORIES / LATEST (Regular Stories) ===
    {
      id: "latest1",
      title: 'Ethiopian Hydroelectric Innovation Attracts $200M in Diaspora Investment',
      author: 'Yohannes Bekele',
      authorTitle: 'Infrastructure Finance Director',
      reach: '2.1M',
      engagement: '89K',
      category: 'Energy',
      impact: '$200M raised from diaspora investors',
      content: 'Ethiopian diaspora communities across North America and Europe have pooled resources to finance micro-hydroelectric plants along the Blue Nile tributaries.',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
      date: '2025-01-15',
      featured: false
    },
    {
      id: "latest2",
      title: 'Nigerian Diaspora Network Establishes 100 Digital Libraries',
      author: 'Dr. Chinedu Okonkwo',
      authorTitle: 'Chief Education Officer',
      reach: '2.9M',
      engagement: '112K',
      category: 'Education',
      impact: '500K students gained access to resources',
      content: 'A coalition of Nigerian professionals in tech hubs worldwide has funded and built 100 state-of-the-art digital libraries across Nigeria.',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      date: '2025-01-12',
      featured: false
    },
    {
      id: "latest3",
      title: 'Blockchain Supply Chain Platform Doubles Farmer Incomes in East Africa',
      author: 'Sarah Wanjiru',
      authorTitle: 'AgriTech Founder',
      reach: '2.7M',
      engagement: '103K',
      category: 'Agriculture',
      impact: '100K farmers income increased by 85%',
      content: 'Kenyan-Canadian entrepreneur Sarah Wanjiru has launched a blockchain-based platform connecting smallholder farmers to buyers.',
      imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
      date: '2025-01-10',
      featured: false
    },
    {
      id: "latest4",
      title: 'Ocean Cleanup Technology Removes Plastic from West African Coastlines',
      author: 'Kwesi Mensah',
      authorTitle: 'Marine Conservation Specialist',
      reach: '2.8M',
      engagement: '118K',
      category: 'Environment',
      impact: '5,000 tons of plastic removed',
      content: 'Ghanaian ocean engineer Kwesi Mensah has adapted his California-developed cleanup technology for African waters.',
      imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&h=600&fit=crop',
      date: '2025-01-08',
      featured: false
    },
    {
      id: "latest5",
      title: 'Nigerian Diaspora Doctors Launch Mobile Surgical Units',
      author: 'Dr. Emeka Obi',
      authorTitle: 'Chief Medical Officer',
      reach: '2.4M',
      engagement: '96K',
      category: 'Healthcare',
      impact: '15K surgeries performed in remote areas',
      content: 'Coalition of Nigerian surgeons have funded fully-equipped mobile surgical theaters traveling to underserved communities.',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
      date: '2025-01-06',
      featured: false
    },
    {
      id: "latest6",
      title: 'Digital Banking Platform Onboards 3M Unbanked Africans',
      author: 'Chinwe Okoro',
      authorTitle: 'Fintech Innovation Reporter',
      reach: '2.5M',
      engagement: '107K',
      category: 'Finance',
      impact: '3M unbanked gained financial access',
      content: 'Nigerian diaspora entrepreneurs have launched a digital-only bank requiring no minimum balance.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      date: '2025-01-04',
      featured: false
    },

    // === ENERGY STORIES ===
    {
      id: "e1",
      title: 'Wind Energy Startup from South African Expat Wins Global Innovation Award',
      author: 'Thandiwe Mkhize',
      authorTitle: 'Clean Tech Reporter',
      reach: '1.7M',
      engagement: '54K',
      category: 'Energy',
      impact: 'Technology deployed across 15 African nations',
      content: 'Cape Town-born engineer Lebo Matshoba has developed revolutionary vertical-axis wind turbines optimized for Africa\'s wind patterns.',
      imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop',
      date: '2024-12-28',
      featured: false
    },
    {
      id: "e2",
      title: 'Senegal Launches First Community-Owned Solar Cooperative',
      author: 'Fatima Diop',
      authorTitle: 'Energy Access Advocate',
      reach: '980K',
      engagement: '31K',
      category: 'Energy',
      impact: '45 villages now energy-independent',
      content: 'With support from Senegalese diaspora in France, rural communities have formed the country\'s first member-owned solar cooperative.',
      imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop',
      date: '2024-12-20',
      featured: false
    },
    {
      id: "e3",
      title: 'Kenyan Geothermal Project Powers Nairobi\'s Tech Hub',
      author: 'Samuel Njoroge',
      authorTitle: 'Energy Infrastructure Analyst',
      reach: '1.2M',
      engagement: '47K',
      category: 'Energy',
      impact: 'Clean energy for 500K residents',
      content: 'Diaspora-funded geothermal expansion in the Rift Valley now provides 24/7 power to Nairobi\'s Silicon Savannah.',
      imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop',
      date: '2024-12-15',
      featured: false
    },

    // === EDUCATION STORIES ===
    {
      id: "ed1",
      title: 'Ghanaian EdTech Startup Partners with Universities for Skills Training',
      author: 'Kwame Mensah',
      authorTitle: 'Technology in Education Correspondent',
      reach: '1.5M',
      engagement: '67K',
      category: 'Education',
      impact: '50K graduates trained in digital skills',
      content: 'SkillBridge Ghana has partnered with 25 African universities to offer industry-aligned tech training.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      date: '2024-12-22',
      featured: false
    },
    {
      id: "ed2",
      title: 'Virtual Exchange Program Connects African and Diaspora Students',
      author: 'Zainab Mohammed',
      authorTitle: 'Global Education Reporter',
      reach: '1.1M',
      engagement: '43K',
      category: 'Education',
      impact: '10K student pairs in cultural exchange',
      content: 'The African Diaspora Student Exchange pairs students for collaborative projects and cultural learning.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      date: '2024-12-10',
      featured: false
    },
    {
      id: "ed3",
      title: 'Rwanda Launches Coding Bootcamp for Rural Youth',
      author: 'Jean-Claude Habimana',
      authorTitle: 'Tech Education Specialist',
      reach: '890K',
      engagement: '35K',
      category: 'Education',
      impact: '5K youth trained in software development',
      content: 'Diaspora-backed bootcamp brings coding education to rural Rwanda with 95% job placement rate.',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
      date: '2024-11-30',
      featured: false
    },

    // === AGRICULTURE STORIES ===
    {
      id: "a1",
      title: 'Drone Technology Revolutionizes Crop Monitoring in Zambia',
      author: 'Joseph Banda',
      authorTitle: 'Precision Agriculture Reporter',
      reach: '1.9M',
      engagement: '71K',
      category: 'Agriculture',
      impact: 'Early disease detection saved $15M',
      content: 'Zambian diaspora engineers have introduced affordable agricultural drones for disease identification.',
      imageUrl: 'https://images.unsplash.com/photo-1527847263472-aa5338d178b8?w=800&h=600&fit=crop',
      date: '2024-12-18',
      featured: false
    },
    {
      id: "a2",
      title: 'Urban Farming Initiative Brings Fresh Produce to Lagos',
      author: 'Aisha Ibrahim',
      authorTitle: 'Sustainable Agriculture Advocate',
      reach: '1.3M',
      engagement: '48K',
      category: 'Agriculture',
      impact: '20K families gained fresh vegetables',
      content: 'Nigerian diaspora introduced vertical farming to Lagos, converting rooftops into productive gardens.',
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
      date: '2024-12-08',
      featured: false
    },
    {
      id: "a3",
      title: 'Moroccan Irrigation Innovation Saves Water in North Africa',
      author: 'Leila Benali',
      authorTitle: 'Water Conservation Specialist',
      reach: '1.1M',
      engagement: '39K',
      category: 'Agriculture',
      impact: '40% reduction in water usage',
      content: 'Diaspora engineer develops smart irrigation system using AI to optimize water distribution.',
      imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
      date: '2024-11-25',
      featured: false
    },

    // === HEALTHCARE STORIES ===
    {
      id: "h1",
      title: 'Mental Health App Breaks Stigma, Reaches 1M Users Across Africa',
      author: 'Dr. Ayana Tadesse',
      authorTitle: 'Mental Health Innovation Reporter',
      reach: '1.8M',
      engagement: '79K',
      category: 'Healthcare',
      impact: '1M users accessed mental health support',
      content: 'Ethiopian-American psychologist created a culturally-sensitive mental health app in 20 African languages.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
      date: '2024-12-14',
      featured: false
    },
    {
      id: "h2",
      title: 'Malaria Elimination Program Shows 70% Reduction in Five Countries',
      author: 'Dr. Kofi Annan Jr.',
      authorTitle: 'Public Health Correspondent',
      reach: '2.2M',
      engagement: '88K',
      category: 'Healthcare',
      impact: '70% reduction in malaria cases',
      content: 'Diaspora-funded program achieves remarkable results in Ghana, Benin, Togo, Burkina Faso, and Côte d\'Ivoire.',
      imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
      date: '2024-12-02',
      featured: false
    },
    {
      id: "h3",
      title: 'South African Biotech Develops Affordable Cancer Screening',
      author: 'Dr. Nomsa Dlamini',
      authorTitle: 'Medical Innovation Reporter',
      reach: '1.4M',
      engagement: '52K',
      category: 'Healthcare',
      impact: 'Early detection for 100K patients',
      content: 'Diaspora scientist creates low-cost cancer screening technology accessible in rural clinics.',
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop',
      date: '2024-11-20',
      featured: false
    },

    // === FINANCE STORIES ===
    {
      id: "f1",
      title: 'Diaspora Investment Fund Backs 50 African Startups',
      author: 'Kwame Boateng',
      authorTitle: 'Venture Capital Correspondent',
      reach: '1.9M',
      engagement: '73K',
      category: 'Finance',
      impact: '$150M deployed, 3,000 jobs created',
      content: 'Pan-African Ventures invests across 50 startups from agriculture to healthcare.',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop',
      date: '2024-12-12',
      featured: false
    },
    {
      id: "f2",
      title: 'Kenyan Mobile Money Platform Expands to 15 Countries',
      author: 'Grace Njeri',
      authorTitle: 'Financial Technology Analyst',
      reach: '1.6M',
      engagement: '61K',
      category: 'Finance',
      impact: '8M users across East and West Africa',
      content: 'Diaspora-backed fintech brings seamless cross-border payments to African SMEs.',
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop',
      date: '2024-11-28',
      featured: false
    },
    {
      id: "f3",
      title: 'Cryptocurrency Exchange Launches Africa-First Trading Platform',
      author: 'Ibrahim Kamara',
      authorTitle: 'Blockchain Reporter',
      reach: '1.3M',
      engagement: '48K',
      category: 'Finance',
      impact: '2M traders onboarded',
      content: 'Sierra Leone diaspora entrepreneur creates crypto platform with local currency support.',
      imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=600&fit=crop',
      date: '2024-11-15',
      featured: false
    },

    // === ENVIRONMENT STORIES ===
    {
      id: "env1",
      title: 'Rwanda Becomes First Carbon-Negative African Nation',
      author: 'Grace Uwera',
      authorTitle: 'Climate Policy Reporter',
      reach: '3.4M',
      engagement: '142K',
      category: 'Environment',
      impact: 'Model for continental climate action',
      content: 'With diaspora climate scientists, Rwanda achieves carbon-negative status through reforestation and renewables.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      date: '2024-12-05',
      featured: false
    },
    {
      id: "env2",
      title: 'Clean Water Innovation Serves 500K People in Rural Tanzania',
      author: 'Fatuma Juma',
      authorTitle: 'Water Resources Engineer',
      reach: '1.6M',
      engagement: '61K',
      category: 'Environment',
      impact: '500K people gained clean water',
      content: 'Solar-powered purification systems convert contaminated water into safe drinking water.',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      date: '2024-11-18',
      featured: false
    },
    {
      id: "env3",
      title: 'Nigerian Wildlife Conservation Saves Endangered Species',
      author: 'Chinonso Eze',
      authorTitle: 'Conservation Biologist',
      reach: '1.2M',
      engagement: '44K',
      category: 'Environment',
      impact: '3 species brought back from brink',
      content: 'Diaspora-funded conservation program protects biodiversity in Cross River National Park.',
      imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop',
      date: '2024-11-05',
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
