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
    // Energy Stories
    {
      id: "e1",
      title: 'Nigerian Diaspora Launches Africa\'s Largest Solar Farm in Kano',
      author: 'Dr. Amara Okafor',
      authorTitle: 'Renewable Energy Specialist, MIT-Africa Initiative',
      reach: '3.8M',
      engagement: '127K',
      category: 'Energy',
      impact: 'Powers 250,000 homes and inspired 12 new solar projects across West Africa',
      content: 'A consortium of Nigerian-American engineers and investors has completed construction of a 500MW solar facility in Kano State, creating 2,000 jobs and providing reliable electricity to previously underserved communities. The project leverages breakthrough photovoltaic technology developed at MIT, reducing costs by 40% compared to traditional solar installations. Local youth are being trained in maintenance and operations, ensuring sustainable knowledge transfer.',
      date: '2025-01-28',
      featured: true
    },
    {
      id: "e2",
      title: 'Ethiopian Hydroelectric Innovation Attracts $200M in Diaspora Investment',
      author: 'Yohannes Bekele',
      authorTitle: 'Infrastructure Finance Director, African Development Consortium',
      reach: '2.1M',
      engagement: '89K',
      category: 'Energy',
      impact: '$200M raised from diaspora investors, generating 1,200 MW of clean energy',
      content: 'Ethiopian diaspora communities across North America and Europe have pooled resources to finance micro-hydroelectric plants along the Blue Nile tributaries. The innovative financing model combines traditional investment with blockchain-based revenue sharing, allowing small investors to participate with as little as $100. The project is expected to bring electricity to 500,000 rural households by 2026.',
      date: '2025-01-22',
      featured: true
    },
    {
      id: "e3",
      title: 'Wind Energy Startup from South African Expat Wins Global Innovation Award',
      author: 'Thandiwe Mkhize',
      authorTitle: 'Clean Tech Reporter',
      reach: '1.7M',
      engagement: '54K',
      category: 'Energy',
      impact: 'Technology to be deployed across 15 African nations, creating 5,000 jobs',
      content: 'Cape Town-born engineer Lebo Matshoba, now based in London, has developed revolutionary vertical-axis wind turbines optimized for Africa\'s wind patterns. The design is 60% more efficient in low-wind conditions and costs half as much to manufacture. Several African governments have already placed orders.',
      date: '2025-01-18',
      featured: false
    },
    {
      id: "e4",
      title: 'Senegal Launches First Community-Owned Solar Cooperative',
      author: 'Fatima Diop',
      authorTitle: 'Energy Access Advocate',
      reach: '980K',
      engagement: '31K',
      category: 'Energy',
      impact: '45 villages now energy-independent, model replicated in 8 countries',
      content: 'With support from Senegalese diaspora in France, rural communities have formed the country\'s first member-owned solar cooperative. Households pay affordable monthly fees and share in profits, creating a sustainable model for energy democratization.',
      date: '2025-01-14',
      featured: false
    },

    // Education Stories
    {
      id: "ed1",
      title: 'Kenyan Educator\'s AI Platform Reaches 2 Million Students Across Africa',
      author: 'Prof. Wanjiru Kamau',
      authorTitle: 'Education Technology Director, Stanford-Africa Innovation Lab',
      reach: '4.2M',
      engagement: '198K',
      category: 'Education',
      impact: '2M students served, 40% improvement in STEM scores across 12 countries',
      content: 'Dr. Wanjiru Kamau, a Kenyan computer scientist who earned her PhD at Stanford, has developed an AI-powered adaptive learning platform that works offline and on low-bandwidth networks. The platform, called "Elimu AI," personalizes education for each student and works in 15 African languages. Backed by $50M in diaspora funding, it\'s now deployed in schools across Kenya, Tanzania, Uganda, Rwanda, Ghana, Nigeria, and six other nations. Teachers report dramatic improvements in student engagement and comprehension.',
      date: '2025-01-27',
      featured: true
    },
    {
      id: "ed2",
      title: 'Nigerian Diaspora Network Establishes 100 Digital Libraries',
      author: 'Dr. Chinedu Okonkwo',
      authorTitle: 'Chief Education Officer, Digital Futures Foundation',
      reach: '2.9M',
      engagement: '112K',
      category: 'Education',
      impact: '500K students gained access to world-class educational resources',
      content: 'A coalition of Nigerian professionals in tech hubs worldwide has funded and built 100 state-of-the-art digital libraries across Nigeria. Each facility features high-speed internet, tablets, coding bootcamp programs, and virtual mentorship connections with diaspora professionals. The initiative prioritizes underserved regions and has already produced its first cohort of student developers.',
      date: '2025-01-20',
      featured: true
    },
    {
      id: "ed3",
      title: 'Ghanaian EdTech Startup Partners with Universities for Skills Training',
      author: 'Kwame Mensah',
      authorTitle: 'Technology in Education Correspondent',
      reach: '1.5M',
      engagement: '67K',
      category: 'Education',
      impact: '50K graduates trained in digital skills, 85% employment rate',
      content: 'SkillBridge Ghana, founded by diaspora entrepreneur Akua Asante, has partnered with 25 African universities to offer industry-aligned tech training. The platform combines online coursework with in-person labs and guarantees job placement support.',
      date: '2025-01-16',
      featured: false
    },
    {
      id: "ed4",
      title: 'Virtual Exchange Program Connects African and Diaspora Students',
      author: 'Zainab Mohammed',
      authorTitle: 'Global Education Reporter',
      reach: '1.1M',
      engagement: '43K',
      category: 'Education',
      impact: '10K student pairs engaged in cultural and academic exchange',
      content: 'The African Diaspora Student Exchange (ADSE) uses video conferencing to pair students in Africa with diaspora youth in the US, UK, and Canada for collaborative projects, language exchange, and cultural learning.',
      date: '2025-01-12',
      featured: false
    },

    // Agriculture Stories
    {
      id: "a1",
      title: 'Zimbabwean Agronomist\'s Drought-Resistant Seeds Transform Farming',
      author: 'Dr. Tendai Moyo',
      authorTitle: 'Agricultural Innovation Specialist, Climate Resilience Institute',
      reach: '3.5M',
      engagement: '145K',
      category: 'Agriculture',
      impact: '250K farmers adopted new seeds, crop yields up 65% in drought-prone areas',
      content: 'Dr. Tendai Moyo, who spent 15 years researching at UC Davis before returning to Zimbabwe, has developed genetically improved seed varieties that thrive with 50% less water. The non-GMO seeds are being distributed through farmer cooperatives across Southern Africa. Combined with mobile app-based farming advice from diaspora agronomists, farmers are experiencing unprecedented harvests even during dry seasons. The World Food Programme has recognized the initiative as a breakthrough in climate adaptation.',
      date: '2025-01-26',
      featured: true
    },
    {
      id: "a2",
      title: 'Blockchain Supply Chain Platform Doubles Farmer Incomes in East Africa',
      author: 'Sarah Wanjiru',
      authorTitle: 'AgriTech Founder, FarmConnect Technologies',
      reach: '2.7M',
      engagement: '103K',
      category: 'Agriculture',
      impact: '100K farmers connected to direct markets, income increased by 85%',
      content: 'Kenyan-Canadian entrepreneur Sarah Wanjiru has launched a blockchain-based platform that connects smallholder farmers directly to buyers, cutting out exploitative middlemen. Using basic mobile phones, farmers can now negotiate prices, track shipments, and receive instant mobile money payments. The platform has expanded to Kenya, Uganda, Tanzania, and Rwanda with $30M in diaspora venture funding.',
      date: '2025-01-24',
      featured: true
    },
    {
      id: "a3",
      title: 'Drone Technology Revolutionizes Crop Monitoring in Zambia',
      author: 'Joseph Banda',
      authorTitle: 'Precision Agriculture Reporter',
      reach: '1.9M',
      engagement: '71K',
      category: 'Agriculture',
      impact: 'Early disease detection saved $15M in crop losses',
      content: 'Zambian diaspora engineers have introduced affordable agricultural drones that help farmers identify crop diseases, optimize irrigation, and monitor soil health. The service is offered on a subscription model accessible to small-scale farmers.',
      date: '2025-01-19',
      featured: false
    },
    {
      id: "a4",
      title: 'Urban Farming Initiative Brings Fresh Produce to Lagos Neighborhoods',
      author: 'Aisha Ibrahim',
      authorTitle: 'Sustainable Agriculture Advocate',
      reach: '1.3M',
      engagement: '48K',
      category: 'Agriculture',
      impact: '20K families gained access to affordable fresh vegetables',
      content: 'Nigerian diaspora in the Netherlands have introduced vertical farming techniques to Lagos, converting rooftops and unused spaces into productive gardens that supply local markets with pesticide-free vegetables.',
      date: '2025-01-13',
      featured: false
    },

    // Healthcare Stories
    {
      id: "h1",
      title: 'Ugandan Doctor\'s Telemedicine Network Serves 500K Rural Patients',
      author: 'Dr. Nakato Olivia',
      authorTitle: 'Healthcare Innovation Lead, Pan-African Health Network',
      reach: '3.1M',
      engagement: '134K',
      category: 'Healthcare',
      impact: '500K patients treated remotely, maternal mortality reduced by 30%',
      content: 'Dr. Olivia Nakato, trained at Johns Hopkins and now based in Kampala, has established Africa\'s largest telemedicine network connecting rural health workers with specialist doctors via smartphone apps. The platform offers real-time consultations, AI-assisted diagnostics, and emergency response coordination. Funded by diaspora healthcare professionals, the network has reduced maternal mortality rates by 30% in participating regions and saved countless lives through early disease detection.',
      date: '2025-01-25',
      featured: true
    },
    {
      id: "h2",
      title: 'Nigerian Diaspora Doctors Launch Mobile Surgical Units',
      author: 'Dr. Emeka Obi',
      authorTitle: 'Chief Medical Officer, Surgical Access Initiative',
      reach: '2.4M',
      engagement: '96K',
      category: 'Healthcare',
      impact: '15K surgeries performed in remote areas, zero-cost to patients',
      content: 'A coalition of Nigerian surgeons working in Western hospitals have funded fully-equipped mobile surgical theaters that travel to underserved communities. The units perform everything from cataract surgeries to emergency C-sections, with diaspora doctors volunteering during scheduled missions. All procedures are free to patients.',
      date: '2025-01-23',
      featured: true
    },
    {
      id: "h3",
      title: 'Mental Health App Breaks Stigma, Reaches 1M Users Across Africa',
      author: 'Dr. Ayana Tadesse',
      authorTitle: 'Mental Health Innovation Reporter',
      reach: '1.8M',
      engagement: '79K',
      category: 'Healthcare',
      impact: '1M users accessed confidential mental health support',
      content: 'Ethiopian-American psychologist Dr. Ayana Tadesse created a culturally-sensitive mental health app offering therapy, peer support, and crisis intervention in 20 African languages. The platform has helped break stigma around mental health.',
      date: '2025-01-17',
      featured: false
    },
    {
      id: "h4",
      title: 'Malaria Elimination Program Shows 70% Reduction in Five Countries',
      author: 'Dr. Kofi Annan Jr.',
      authorTitle: 'Public Health Correspondent',
      reach: '2.2M',
      engagement: '88K',
      category: 'Healthcare',
      impact: '70% reduction in malaria cases across participating regions',
      content: 'Diaspora-funded malaria elimination program combining genetic mosquito research, community health workers, and innovative treatment protocols has achieved remarkable results in Ghana, Benin, Togo, Burkina Faso, and Côte d\'Ivoire.',
      date: '2025-01-11',
      featured: false
    },

    // Finance Stories
    {
      id: "f1",
      title: 'Fintech Revolution: $500M in Remittances Now Fee-Free to Africa',
      author: 'Abena Osei',
      authorTitle: 'Financial Inclusion Director, AfriPay Global',
      reach: '5.2M',
      engagement: '234K',
      category: 'Finance',
      impact: '$500M sent home fee-free, saving families $35M in transaction costs',
      content: 'A Ghanaian-British fintech founder has launched a revolutionary remittance platform that eliminates transfer fees using blockchain technology. AfriPay Global partners with mobile money providers across 30 African countries, allowing diaspora families to send money home instantly at zero cost. In just six months, the platform has processed over $500M in transfers, saving African families an estimated $35M in fees they would have paid to traditional services. The platform has secured $80M in venture funding and is expanding to include microloans and investment products.',
      date: '2025-01-29',
      featured: true
    },
    {
      id: "f2",
      title: 'Diaspora Bond Raises $2B for African Infrastructure Projects',
      author: 'Mohamed Hassan',
      authorTitle: 'Investment Banking Analyst, Diaspora Capital Markets',
      reach: '3.6M',
      engagement: '156K',
      category: 'Finance',
      impact: '$2B raised for roads, hospitals, schools across 8 African nations',
      content: 'In a groundbreaking financial initiative, African diaspora investors have purchased $2 billion in diaspora bonds to fund critical infrastructure projects. The bonds offer competitive returns while directly supporting development in investors\' home countries. Projects include highway construction in Ethiopia, hospital expansion in Rwanda, and school building in Senegal.',
      date: '2025-01-21',
      featured: true
    },
    {
      id: "f3",
      title: 'Digital Banking Platform Onboards 3M Unbanked Africans',
      author: 'Chinwe Okoro',
      authorTitle: 'Fintech Innovation Reporter',
      reach: '2.5M',
      engagement: '107K',
      category: 'Finance',
      impact: '3M previously unbanked individuals now have access to financial services',
      content: 'Nigerian diaspora entrepreneurs have launched a digital-only bank that requires no minimum balance and works entirely via mobile phone. The platform offers savings accounts, micro-loans, and insurance products tailored to African markets.',
      date: '2025-01-15',
      featured: false
    },
    {
      id: "f4",
      title: 'Diaspora Investment Fund Backs 50 African Startups',
      author: 'Kwame Boateng',
      authorTitle: 'Venture Capital Correspondent',
      reach: '1.9M',
      engagement: '73K',
      category: 'Finance',
      impact: '$150M deployed to African startups, 3,000 jobs created',
      content: 'Pan-African Ventures, a diaspora-led VC fund, has invested $150M across 50 promising African startups in sectors ranging from agriculture to healthcare, creating thousands of jobs and fostering local innovation ecosystems.',
      date: '2025-01-09',
      featured: false
    },

    // Environment Stories
    {
      id: "env1",
      title: 'Reforestation Initiative Plants 50M Trees Across the Sahel',
      author: 'Amina Diallo',
      authorTitle: 'Environmental Restoration Director, Green Sahel Coalition',
      reach: '4.1M',
      engagement: '187K',
      category: 'Environment',
      impact: '50M trees planted, 500K hectares restored, 10K jobs created',
      content: 'A coalition of West African diaspora environmentalists has mobilized $100M to combat desertification across the Sahel region. The Green Sahel Coalition has planted 50 million trees across Senegal, Mali, Niger, Chad, and Burkina Faso, employing local communities in the world\'s largest reforestation effort. The initiative uses drought-resistant native species and innovative water harvesting techniques developed by diaspora scientists. Early results show significant soil restoration and increased agricultural productivity in participating regions.',
      date: '2025-01-30',
      featured: true
    },
    {
      id: "env2",
      title: 'Ocean Cleanup Technology Removes Plastic from West African Coastlines',
      author: 'Kwesi Mensah',
      authorTitle: 'Marine Conservation Specialist, Blue Africa Initiative',
      reach: '2.8M',
      engagement: '118K',
      category: 'Environment',
      impact: '5,000 tons of plastic removed, 200km of coastline cleaned',
      content: 'Ghanaian ocean engineer Kwesi Mensah has adapted his California-developed cleanup technology for African waters. The autonomous systems collect plastic waste before it reaches the ocean, while employing coastal communities to sort and recycle collected materials. The initiative has cleaned 200km of coastline and diverted 5,000 tons of plastic from the ocean.',
      date: '2025-01-19',
      featured: true
    },
    {
      id: "env3",
      title: 'Rwanda Becomes First Carbon-Negative African Nation',
      author: 'Grace Uwera',
      authorTitle: 'Climate Policy Reporter',
      reach: '3.4M',
      engagement: '142K',
      category: 'Environment',
      impact: 'Model for continental climate action, absorbing more CO2 than emitted',
      content: 'With technical support from Rwandan diaspora climate scientists, the country has achieved carbon-negative status through massive reforestation, renewable energy adoption, and sustainable agriculture practices. The success story is inspiring similar initiatives continent-wide.',
      date: '2025-01-08',
      featured: false
    },
    {
      id: "env4",
      title: 'Clean Water Innovation Serves 500K People in Rural Tanzania',
      author: 'Fatuma Juma',
      authorTitle: 'Water Resources Engineer',
      reach: '1.6M',
      engagement: '61K',
      category: 'Environment',
      impact: '500K people gained access to clean drinking water',
      content: 'Tanzanian diaspora engineers have developed solar-powered water purification systems that convert contaminated water into safe drinking water. The low-maintenance units are being installed in 150 villages, dramatically reducing waterborne diseases.',
      date: '2025-01-06',
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
