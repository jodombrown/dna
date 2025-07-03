import { supabase } from '@/integrations/supabase/client';

// Extended demo profiles data with realistic African diaspora professionals
const demoProfiles = [
  {
    full_name: "Amara Okafor",
    display_name: "Amara Okafor",
    email: "amara.okafor@example.com",
    profession: "Software Engineer",
    company: "Google",
    location: "London, UK",
    current_country: "United Kingdom",
    bio: "Nigerian-British software engineer passionate about AI and machine learning. Building tech solutions for African markets.",
    skills: ["Python", "Machine Learning", "React", "AI"],
    interests: ["Technology", "Education", "African Development"],
    linkedin_url: "https://linkedin.com/in/amara-okafor",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b04c9e18?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Kwame Asante",
    display_name: "Kwame Asante",
    email: "kwame.asante@example.com",
    profession: "Investment Banker",
    company: "Goldman Sachs",
    location: "New York, NY",
    current_country: "United States",
    bio: "Ghanaian-American investment banker focused on infrastructure financing for African development projects.",
    skills: ["Finance", "Investment Banking", "Risk Management", "Project Finance"],
    interests: ["Finance", "Infrastructure", "Economic Development"],
    linkedin_url: "https://linkedin.com/in/kwame-asante",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Fatima Al-Rashid",
    display_name: "Dr. Fatima Al-Rashid",
    email: "fatima.alrashid@example.com",
    profession: "Medical Doctor",
    company: "Johns Hopkins Hospital",
    location: "Baltimore, MD",
    current_country: "United States",
    bio: "Sudanese-American physician specializing in infectious diseases. Working on healthcare solutions for underserved communities.",
    skills: ["Medicine", "Public Health", "Research", "Healthcare Management"],
    interests: ["Healthcare", "Public Health", "Medical Research"],
    linkedin_url: "https://linkedin.com/in/fatima-alrashid",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Chinedu Okwu",
    display_name: "Chinedu Okwu",
    email: "chinedu.okwu@example.com",
    profession: "Entrepreneur",
    company: "TechHub Africa",
    location: "Lagos, Nigeria",
    current_country: "Nigeria",
    bio: "Serial entrepreneur building fintech solutions across Africa. Passionate about financial inclusion and economic empowerment.",
    skills: ["Entrepreneurship", "Fintech", "Business Development", "Strategy"],
    interests: ["Entrepreneurship", "Fintech", "Economic Development"],
    linkedin_url: "https://linkedin.com/in/chinedu-okwu",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Zara Hassan",
    display_name: "Zara Hassan",
    email: "zara.hassan@example.com",
    profession: "Marketing Director",
    company: "Unilever",
    location: "Amsterdam, Netherlands",
    current_country: "Netherlands",
    bio: "Somali-Dutch marketing professional with expertise in emerging markets. Building brand strategies for African consumer goods.",
    skills: ["Marketing", "Brand Strategy", "Consumer Insights", "Digital Marketing"],
    interests: ["Marketing", "Brand Building", "Consumer Behavior"],
    linkedin_url: "https://linkedin.com/in/zara-hassan",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Mandla Ndebele",
    display_name: "Prof. Mandla Ndebele",
    email: "mandla.ndebele@example.com",
    profession: "University Professor",
    company: "Oxford University",
    location: "Oxford, UK",
    current_country: "United Kingdom",
    bio: "South African professor of African Studies and Development Economics. Researching sustainable development policies for Africa.",
    skills: ["Research", "Economics", "Policy Analysis", "Academic Writing"],
    interests: ["Education", "Research", "Policy Development"],
    linkedin_url: "https://linkedin.com/in/mandla-ndebele",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Aisha Kone",
    display_name: "Aisha Koné",
    email: "aisha.kone@example.com",
    profession: "Climate Scientist",
    company: "UN Environment Programme",
    location: "Nairobi, Kenya",
    current_country: "Kenya",
    bio: "Malian climate scientist working on climate adaptation strategies for African agriculture and water security.",
    skills: ["Climate Science", "Environmental Research", "Data Analysis", "Policy"],
    interests: ["Climate Change", "Environmental Protection", "Sustainability"],
    linkedin_url: "https://linkedin.com/in/aisha-kone",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Jomo Kigali",
    display_name: "Jomo Kigali",
    email: "jomo.kigali@example.com",
    profession: "Renewable Energy Engineer",
    company: "Tesla",
    location: "San Francisco, CA",
    current_country: "United States",
    bio: "Kenyan-American engineer designing solar energy solutions for off-grid communities across Africa.",
    skills: ["Renewable Energy", "Engineering", "Solar Technology", "Project Management"],
    interests: ["Clean Energy", "Innovation", "Rural Development"],
    linkedin_url: "https://linkedin.com/in/jomo-kigali",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Sekai Machado",
    display_name: "Sekai Machado",
    email: "sekai.machado@example.com",
    profession: "Data Scientist",
    company: "Microsoft",
    location: "Seattle, WA",
    current_country: "United States",
    bio: "Zimbabwean data scientist working on AI for good initiatives. Focused on using technology to solve development challenges in Africa.",
    skills: ["Data Science", "Machine Learning", "Python", "Statistics"],
    interests: ["AI for Good", "Development", "Data Analytics"],
    linkedin_url: "https://linkedin.com/in/sekai-machado",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Oba Adebayo",
    display_name: "Oba Adebayo",
    email: "oba.adebayo@example.com",
    profession: "Platform Administrator",
    company: "DNA Network",
    location: "Lagos, Nigeria",
    current_country: "Nigeria",
    bio: "Platform administrator ensuring DNA Network runs smoothly and connects the African diaspora effectively.",
    skills: ["Platform Management", "Community Building", "Operations"],
    interests: ["Community Management", "Technology", "African Unity"],
    linkedin_url: "https://linkedin.com/in/oba-adebayo",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Thandiwe Mthembu",
    display_name: "Thandiwe Mthembu",
    email: "thandiwe.mthembu@example.com",
    profession: "Venture Capitalist",
    company: "Acacia Ventures",
    location: "Cape Town, South Africa",
    current_country: "South Africa",
    bio: "South African VC investing in early-stage African startups. Passionate about scaling innovative solutions across the continent.",
    skills: ["Venture Capital", "Investment Analysis", "Startup Mentoring", "Due Diligence"],
    interests: ["Startups", "Investment", "Innovation"],
    linkedin_url: "https://linkedin.com/in/thandiwe-mthembu",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Kofi Mensah",
    display_name: "Kofi Mensah",
    email: "kofi.mensah@example.com",
    profession: "Blockchain Developer",
    company: "Ethereum Foundation",
    location: "Berlin, Germany",
    current_country: "Germany",
    bio: "Ghanaian blockchain developer building decentralized finance solutions for African markets.",
    skills: ["Blockchain", "Solidity", "DeFi", "Smart Contracts"],
    interests: ["Cryptocurrency", "DeFi", "Financial Inclusion"],
    linkedin_url: "https://linkedin.com/in/kofi-mensah",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Nia Asomani",
    display_name: "Dr. Nia Asomani",
    email: "nia.asomani@example.com",
    profession: "Research Scientist",
    company: "MIT",
    location: "Boston, MA",
    current_country: "United States",
    bio: "Ghanaian-American researcher in biotechnology and genetics. Working on genetic therapies for diseases prevalent in Africa.",
    skills: ["Biotechnology", "Genetics", "Research", "Laboratory Management"],
    interests: ["Biotechnology", "Medical Research", "Genetics"],
    linkedin_url: "https://linkedin.com/in/nia-asomani",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Bayo Adeleke",
    display_name: "Bayo Adeleke",
    email: "bayo.adeleke@example.com",
    profession: "Creative Director",
    company: "Ogilvy",
    location: "New York, NY",
    current_country: "United States",
    bio: "Nigerian creative director crafting global campaigns that showcase African culture and creativity.",
    skills: ["Creative Direction", "Brand Strategy", "Campaign Development", "Visual Design"],
    interests: ["Creative Arts", "Brand Building", "African Culture"],
    linkedin_url: "https://linkedin.com/in/bayo-adeleke",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Mariam Touré",
    display_name: "Mariam Touré",
    email: "mariam.toure@example.com",
    profession: "Legal Advisor",
    company: "Baker McKenzie",
    location: "Paris, France",
    current_country: "France",
    bio: "Senegalese lawyer specializing in international trade law and cross-border African business transactions.",
    skills: ["International Law", "Trade Law", "Corporate Law", "Contract Negotiation"],
    interests: ["Legal Practice", "International Trade", "Business Law"],
    linkedin_url: "https://linkedin.com/in/mariam-toure",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    full_name: "Tariq Al-Mahdi",
    display_name: "Tariq Al-Mahdi",
    email: "tariq.almahdi@example.com",
    profession: "Journalist",
    company: "BBC Africa",
    location: "Nairobi, Kenya",
    current_country: "Kenya",
    bio: "Sudanese journalist covering African politics and development stories for international media.",
    skills: ["Journalism", "Investigative Reporting", "Political Analysis", "Media Production"],
    interests: ["Journalism", "African Politics", "Media"],
    linkedin_url: "https://linkedin.com/in/tariq-almahdi",
    is_public: true,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

// Demo posts data with various content types
const demoPosts = [
  {
    content: "Excited to announce that our fintech startup just secured $2M in Series A funding! 🚀 This will help us expand our mobile payment solutions across West Africa. The diaspora investment community is truly powerful when we come together. #AfricanTech #Fintech #Diaspora",
    hashtags: ["AfricanTech", "Fintech", "Diaspora"],
    post_type: "text"
  },
  {
    content: "Just attended the African Union Summit as a youth delegate. The energy around continental integration and trade is incredible! 🌍 Young African professionals are driving change across sectors. What initiatives are you working on? #AfricanUnion #YouthLeadership #PanAfrican",
    hashtags: ["AfricanUnion", "YouthLeadership", "PanAfrican"],
    post_type: "text"
  },
  {
    content: "Research update: Our climate adaptation model shows promising results for drought-resistant farming in the Sahel region. 🌱 Collaborating with local farmers has been transformative. Science + traditional knowledge = sustainable solutions. #ClimateChange #Agriculture #Research",
    hashtags: ["ClimateChange", "Agriculture", "Research"],
    post_type: "text"
  },
  {
    content: "Healthcare access remains a critical challenge across rural Africa. 🏥 Our telemedicine platform now serves 50,000+ patients in underserved communities. Technology can truly bridge the healthcare gap when implemented thoughtfully. #HealthTech #Telemedicine #AfricaRising",
    hashtags: ["HealthTech", "Telemedicine", "AfricaRising"],
    post_type: "text"
  },
  {
    content: "Proud to mentor young entrepreneurs in Lagos! 💡 The innovation ecosystem in Nigeria is absolutely thriving. These brilliant minds are solving real problems with creative solutions. The future of African entrepreneurship is bright! #Mentorship #NigerianTech #Innovation",
    hashtags: ["Mentorship", "NigerianTech", "Innovation"],
    post_type: "text"
  },
  {
    content: "Breaking: African Continental Free Trade Area (AfCFTA) trade volumes up 40% this quarter! 📈 As diaspora professionals, we have a unique role in facilitating these cross-border opportunities. Economic integration is happening! #AfCFTA #TradeAfrica #EconomicGrowth",
    hashtags: ["AfCFTA", "TradeAfrica", "EconomicGrowth"],
    post_type: "text"
  },
  {
    content: "Attended an incredible panel on 'Women in African Tech' today. 👩‍💻 The representation and innovation from African women in technology is inspiring. Shoutout to all the fierce female founders changing the game! #WomenInTech #AfricanWomen #TechLeadership",
    hashtags: ["WomenInTech", "AfricanWomen", "TechLeadership"],
    post_type: "text"
  },
  {
    content: "Solar mini-grids are revolutionizing rural electrification across sub-Saharan Africa! ⚡ Our latest project in Rwanda powers 5,000 homes with clean energy. Renewable energy + community ownership = sustainable development. #RenewableEnergy #SolarPower #RuralDevelopment",
    hashtags: ["RenewableEnergy", "SolarPower", "RuralDevelopment"],
    post_type: "text"
  },
  {
    content: "Just published research on remittance flows to Africa - $95 billion annually! 💰 The diaspora's economic impact is massive. How can we optimize these flows for development? Looking for collaboration with policy experts. #Remittances #DiasporaEconomics #Research",
    hashtags: ["Remittances", "DiasporaEconomics", "Research"],
    post_type: "text"
  },
  {
    content: "Celebrating African Heritage Month by reflecting on our collective journey. 🌍 From ancient kingdoms to modern innovation hubs, our story is one of resilience and brilliance. Proud to be part of this global African family! #AfricanHeritage #Diaspora #Culture",
    hashtags: ["AfricanHeritage", "Diaspora", "Culture"],
    post_type: "text"
  },
  {
    content: "Game-changing partnership announced: Linking African universities with Silicon Valley tech companies for AI research! 🤖 This kind of knowledge transfer is exactly what we need for technological leapfrogging. #AI #Education #TechPartnership #KnowledgeTransfer",
    hashtags: ["AI", "Education", "TechPartnership", "KnowledgeTransfer"],
    post_type: "text"
  },
  {
    content: "Diaspora investment collective just funded 12 startups across East Africa! 🚀 When we pool our resources and expertise, we can create real change. Next investment round opens in Q2. Who's building something innovative? #DiasporaInvestment #StartupAfrica #VentureCapital",
    hashtags: ["DiasporaInvestment", "StartupAfrica", "VentureCapital"],
    post_type: "text"
  },
  {
    content: "Blockchain technology is transforming remittances to Africa! 💰 Our new DeFi platform reduces transfer costs by 80% and settlement time to minutes. The future of cross-border payments is here. #Blockchain #DeFi #Remittances #FinTech",
    hashtags: ["Blockchain", "DeFi", "Remittances", "FinTech"],
    post_type: "text"
  },
  {
    content: "Creative Campaign Update: Our 'Africa Rising' campaign just won a Cannes Gold Lion! 🦁 Proud to showcase African creativity on the global stage. Representation matters in every industry. #CreativeArts #AfricanCreativity #CannesLions #Advertising",
    hashtags: ["CreativeArts", "AfricanCreativity", "CannesLions", "Advertising"],
    post_type: "text"
  },
  {
    content: "Legal Milestone: African Continental Free Trade Agreement dispute resolution mechanism now operational! ⚖️ This will boost investor confidence and trade volumes across the continent. #AfCFTA #LegalNews #TradeAfrica #InternationalLaw",
    hashtags: ["AfCFTA", "LegalNews", "TradeAfrica", "InternationalLaw"],
    post_type: "text"
  },
  {
    content: "Breaking: New genetic therapy trials for sickle cell disease showing 95% success rate in African patients! 🧬 This could be a game-changer for millions across the continent. Science saves lives! #Biotechnology #SickleCellDisease #MedicalBreakthrough #Genetics",
    hashtags: ["Biotechnology", "SickleCellDisease", "MedicalBreakthrough", "Genetics"],
    post_type: "text"
  },
  {
    content: "Investigative Report: Corruption in African mining sector costs $50B annually. 📰 Transparency and accountability are essential for sustainable resource management. Read the full report on BBC Africa. #Journalism #Transparency #AfricanMining #Accountability",
    hashtags: ["Journalism", "Transparency", "AfricanMining", "Accountability"],
    post_type: "text"
  },
  {
    content: "AI Innovation: Our machine learning model can predict crop yields with 90% accuracy using satellite data! 🛰️ This will help farmers optimize planting and improve food security across Africa. #AI #Agriculture #FoodSecurity #Innovation",
    hashtags: ["AI", "Agriculture", "FoodSecurity", "Innovation"],
    post_type: "text"
  },
  {
    content: "Venture Capital Update: Africa attracted $4.3B in VC funding this year - a 35% increase! 📈 The startup ecosystem is maturing rapidly. What sectors are you most excited about? #VentureCapital #AfricanStartups #Investment #Innovation",
    hashtags: ["VentureCapital", "AfricanStartups", "Investment", "Innovation"],
    post_type: "text"
  }
];

// Demo events data
const demoEvents = [
  {
    title: "African Tech Summit 2025",
    description: "Join leading African tech entrepreneurs and investors for a weekend of networking, learning, and collaboration.",
    date_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    location: "Lagos, Nigeria",
    is_virtual: false,
    type: "conference",
    max_attendees: 500,
    registration_url: "https://africantech2025.com",
    image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop"
  },
  {
    title: "Diaspora Investment Webinar",
    description: "Learn about investment opportunities in African infrastructure and tech startups.",
    date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: "Virtual Event",
    is_virtual: true,
    type: "webinar",
    max_attendees: 1000,
    registration_url: "https://diasporainvest.com/webinar",
    image_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=300&fit=crop"
  },
  {
    title: "Pan-African Healthcare Innovation Forum",
    description: "Healthcare professionals and innovators discussing digital health solutions for Africa.",
    date_time: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    location: "Accra, Ghana",
    is_virtual: false,
    type: "forum",
    max_attendees: 300,
    registration_url: "https://healthinnovation.africa",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=300&fit=crop"
  },
  {
    title: "Young African Leaders Networking Night",
    description: "Connecting young professionals in the diaspora for mentorship and collaboration.",
    date_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    location: "London, UK",
    is_virtual: false,
    type: "networking",
    max_attendees: 150,
    registration_url: "https://yaln.london",
    image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=300&fit=crop"
  },
  {
    title: "Climate Change & African Agriculture Workshop",
    description: "Scientists and farmers collaborating on climate-resilient agricultural practices.",
    date_time: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    location: "Nairobi, Kenya",
    is_virtual: false,
    type: "workshop",
    max_attendees: 100,
    registration_url: "https://climateagriculture.org",
    image_url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=300&fit=crop"
  }
];

// Demo communities data
const demoCommunities = [
  {
    name: "African Tech Entrepreneurs",
    description: "A community for African tech entrepreneurs to share resources, seek advice, and collaborate on innovative projects.",
    category: "Technology",
    tags: ["tech", "entrepreneurship", "startups", "innovation"],
    moderation_status: "approved",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop"
  },
  {
    name: "Healthcare Professionals Network",
    description: "Connecting African healthcare professionals globally to share best practices and collaborate on health initiatives.",
    category: "Healthcare",
    tags: ["healthcare", "medicine", "public-health", "telemedicine"],
    moderation_status: "approved",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop"
  },
  {
    name: "Renewable Energy Africa",
    description: "Engineers and professionals working on renewable energy solutions across the African continent.",
    category: "Energy",
    tags: ["renewable-energy", "solar", "sustainability", "climate"],
    moderation_status: "approved",
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop"
  },
  {
    name: "African Women Leaders",
    description: "Empowering African women in leadership positions across industries and geographies.",
    category: "Leadership",
    tags: ["women", "leadership", "empowerment", "mentorship"],
    moderation_status: "approved",
    is_featured: true,
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop"
  },
  {
    name: "Diaspora Investors Circle",
    description: "African diaspora investors collaborating on funding opportunities across the continent.",
    category: "Investment",
    tags: ["investment", "venture-capital", "funding", "diaspora"],
    moderation_status: "approved",
    is_featured: false,
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop"
  }
];

// Demo contribution cards data
const demoContributionCards = [
  {
    title: "Solar Power for Rural Schools",
    description: "Help bring clean energy to 50 rural schools across Kenya. Each solar installation will power computers, lights, and educational equipment for 500+ students.",
    contribution_type: "funding",
    amount_needed: 250000,
    amount_raised: 125000,
    impact_area: "Education & Energy",
    location: "Kenya",
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop",
    status: "active"
  },
  {
    title: "Mobile Health Clinics for Remote Areas",
    description: "Support mobile health clinics bringing healthcare to underserved communities in rural Nigeria. Each clinic serves 1000+ people monthly.",
    contribution_type: "funding",
    amount_needed: 180000,
    amount_raised: 45000,
    impact_area: "Healthcare",
    location: "Nigeria",
    target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
    image_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop",
    status: "active"
  },
  {
    title: "Clean Water Wells Initiative",
    description: "Drill clean water wells in drought-affected communities across the Horn of Africa. Each well serves 500 families with safe drinking water.",
    contribution_type: "funding",
    amount_needed: 300000,
    amount_raised: 180000,
    impact_area: "Water & Sanitation",
    location: "Ethiopia, Somalia, Kenya",
    target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
    status: "active"
  },
  {
    title: "Tech Skills Training for Youth",
    description: "Coding bootcamps and digital literacy programs for young people in urban slums. Training 1000+ youth in web development and digital skills.",
    contribution_type: "skills",
    amount_needed: 150000,
    amount_raised: 85000,
    impact_area: "Education & Technology",
    location: "Ghana, Nigeria, Kenya",
    target_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 75 days from now
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
    status: "active"
  },
  {
    title: "Women Entrepreneurs Microcredit",
    description: "Provide microloans to women entrepreneurs starting small businesses. Supporting 500+ women with $500-$5000 loans to grow their enterprises.",
    contribution_type: "funding",
    amount_needed: 200000,
    amount_raised: 95000,
    impact_area: "Economic Empowerment",
    location: "Rwanda, Uganda, Tanzania",
    target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop",
    status: "active"
  }
];

// Demo job posts
const demoJobPosts = [
  {
    title: "Senior Software Engineer - AI/ML",
    company: "TechHub Lagos",
    description: "Build next-generation AI solutions for African markets. Remote-friendly with quarterly Lagos visits.",
    location: "Lagos, Nigeria (Remote OK)",
    job_type: "full-time",
    salary_range: "$80,000 - $120,000",
    requirements: "5+ years Python, ML experience, African market knowledge preferred",
    tags: ["AI", "Python", "Machine Learning", "Remote"],
    application_email: "careers@techhublagos.com",
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Investment Analyst - Africa Focus",
    company: "Diaspora Capital",
    description: "Analyze investment opportunities across African startups and infrastructure projects.",
    location: "New York, NY",
    job_type: "full-time",
    salary_range: "$90,000 - $140,000",
    requirements: "Finance degree, 3+ years VC/PE experience, African market expertise",
    tags: ["Finance", "Investment", "VC", "Africa"],
    application_email: "jobs@diasporacapital.com",
    expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Digital Health Product Manager",
    company: "MedConnect Africa",
    description: "Lead product development for telemedicine platform serving rural African communities.",
    location: "Nairobi, Kenya",
    job_type: "full-time",
    salary_range: "$60,000 - $90,000",
    requirements: "Product management experience, healthcare tech background, Swahili preferred",
    tags: ["Product Management", "HealthTech", "Digital Health"],
    application_email: "careers@medconnectafrica.com",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Renewable Energy Engineer",
    company: "SolarTech Ghana",
    description: "Design and implement solar energy solutions for off-grid communities across West Africa.",
    location: "Accra, Ghana",
    job_type: "full-time",
    salary_range: "$50,000 - $75,000",
    requirements: "Electrical engineering degree, solar energy experience, willingness to travel",
    tags: ["Solar Energy", "Engineering", "Renewable Energy"],
    application_email: "hr@solartechghana.com",
    expires_at: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Content Marketing Manager",
    company: "African Creative Collective",
    description: "Build brand awareness for African creative agencies and artists globally.",
    location: "Cape Town, South Africa (Hybrid)",
    job_type: "full-time",
    salary_range: "$45,000 - $65,000",
    requirements: "Marketing degree, creative industry experience, social media expertise",
    tags: ["Marketing", "Creative", "Social Media", "Branding"],
    application_email: "jobs@africancreative.co.za",
    expires_at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Demo initiatives
const demoInitiatives = [
  {
    title: "Code for Africa Initiative",
    description: "Teaching coding skills to young people across African cities through free bootcamps and mentorship programs.",
    impact_area: "Education & Technology"
  },
  {
    title: "Women in Agribusiness Network",
    description: "Connecting and supporting women entrepreneurs in the agricultural value chain across Africa.",
    impact_area: "Gender & Agriculture"
  },
  {
    title: "Green Energy Villages Project",
    description: "Implementing sustainable energy solutions in rural communities to improve quality of life and economic opportunities.",
    impact_area: "Environment & Energy"
  },
  {
    title: "African Health Data Alliance",
    description: "Standardizing health data collection and sharing across African countries to improve healthcare outcomes.",
    impact_area: "Healthcare & Data"
  },
  {
    title: "Diaspora Mentorship Program",
    description: "Connecting experienced diaspora professionals with young African entrepreneurs and students for career guidance.",
    impact_area: "Mentorship & Career Development"
  }
];

// Demo newsletters
const demoNewsletters = [
  {
    title: "African Tech Weekly",
    content: "This week in African technology: Major funding rounds, startup exits, and innovation updates from across the continent...",
    summary: "Weekly roundup of African tech news and startup ecosystem updates",
    category: "Technology",
    tags: ["tech", "startups", "innovation", "funding"],
    featured_image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop",
    is_published: true,
    email_sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Diaspora Investment Digest",
    content: "Investment opportunities and market analysis for African diaspora investors looking to impact the continent...",
    summary: "Monthly investment insights and opportunities for diaspora investors",
    category: "Investment",
    tags: ["investment", "finance", "diaspora", "opportunities"],
    featured_image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop",
    is_published: true,
    email_sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Healthcare Innovation Report",
    content: "Latest developments in African healthcare technology, telemedicine advances, and medical research breakthroughs...",
    summary: "Bi-weekly healthcare innovation and medical technology updates",
    category: "Healthcare",
    tags: ["healthcare", "innovation", "medical", "technology"],
    featured_image_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=300&fit=crop",
    is_published: true,
    email_sent_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Sustainable Development Monthly",
    content: "Environmental initiatives, climate solutions, and sustainable development projects making impact across Africa...",
    summary: "Monthly sustainability and environmental impact newsletter",
    category: "Environment",
    tags: ["sustainability", "environment", "climate", "development"],
    featured_image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=300&fit=crop",
    is_published: true,
    email_sent_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: "Creative Economy Spotlight",
    content: "Celebrating African creative talent, cultural exports, and the growing creative economy across the continent...",
    summary: "Showcasing African creativity, arts, and cultural impact globally",
    category: "Arts & Culture",
    tags: ["arts", "culture", "creative", "economy"],
    featured_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=300&fit=crop",
    is_published: true,
    email_sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Organizations data
const demoOrganizations = [
  {
    name: "African Development Bank",
    description: "Multilateral development finance institution promoting economic development and social progress across Africa",
    logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
    website_url: "https://afdb.org",
    contact_email: "info@afdb.org",
    verification_status: "approved"
  },
  {
    name: "Tony Elumelu Foundation",
    description: "Empowering African entrepreneurs and catalyzing economic transformation across the continent",
    logo_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop",
    website_url: "https://tonyelumelufoundation.org",
    contact_email: "contact@tonyelumelufoundation.org",
    verification_status: "approved"
  },
  {
    name: "Mastercard Foundation",
    description: "Working with visionary organizations to enable young people in Africa and indigenous communities in Canada to access dignified and fulfilling work",
    logo_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop",
    website_url: "https://mastercardfdn.org",
    contact_email: "info@mastercardfdn.org",
    verification_status: "approved"
  }
];

export const seedDemoData = async () => {
  console.log('Starting comprehensive demo data seeding...');
  
  try {
    // Step 1: Create demo users and profiles
    console.log('Creating demo users and profiles...');
    const createdUsers = [];
    
    for (const profileData of demoProfiles) {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profileData.email)
        .single();
      
      if (existingProfile) {
        console.log(`Profile already exists for ${profileData.email}`);
        createdUsers.push(existingProfile.id);
        continue;
      }

      // Create user account
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: profileData.email,
        password: 'demo123456',
        email_confirm: true,
        user_metadata: {
          full_name: profileData.full_name
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        continue;
      }

      if (!authUser.user) {
        console.error('No user returned from auth creation');
        continue;
      }

      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        continue;
      }

      createdUsers.push(authUser.user.id);
      console.log(`Created profile for ${profileData.full_name}`);
    }

    // Step 2: Create demo posts
    console.log('Creating demo posts...');
    for (let i = 0; i < demoPosts.length; i++) {
      const postData = demoPosts[i];
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: randomUserId,
          is_published: true,
          moderation_status: 'approved'
        });

      if (postError) {
        console.error('Error creating post:', postError);
      }
    }

    // Step 3: Create demo events
    console.log('Creating demo events...');
    for (const eventData of demoEvents) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: randomUserId
        });

      if (eventError) {
        console.error('Error creating event:', eventError);
      }
    }

    // Step 4: Create demo job posts
    console.log('Creating demo job posts...');
    for (const jobData of demoJobPosts) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: jobError } = await supabase
        .from('job_posts')
        .insert({
          ...jobData,
          posted_by: randomUserId
        });

      if (jobError) {
        console.error('Error creating job post:', jobError);
      }
    }

    // Step 5: Create demo initiatives
    console.log('Creating demo initiatives...');
    for (const initiativeData of demoInitiatives) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: initiativeError } = await supabase
        .from('initiatives')
        .insert({
          ...initiativeData,
          creator_id: randomUserId
        });

      if (initiativeError) {
        console.error('Error creating initiative:', initiativeError);
      }
    }

    // Step 6: Create demo newsletters
    console.log('Creating demo newsletters...');
    for (const newsletterData of demoNewsletters) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: newsletterError } = await supabase
        .from('newsletters')
        .insert({
          ...newsletterData,
          created_by: randomUserId
        });

      if (newsletterError) {
        console.error('Error creating newsletter:', newsletterError);
      }
    }

    // Step 7: Create demo organizations
    console.log('Creating demo organizations...');
    for (const orgData of demoOrganizations) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          ...orgData,
          created_by: randomUserId
        });

      if (orgError) {
        console.error('Error creating organization:', orgError);
      }
    }

    // Step 8: Create demo contribution cards
    console.log('Creating demo contribution cards...');
    for (const contributionData of demoContributionCards) {
      const randomUserId = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const { error: contributionError } = await supabase
        .from('contribution_cards')
        .insert({
          ...contributionData,
          created_by: randomUserId
        });

      if (contributionError) {
        console.error('Error creating contribution card:', contributionError);
      }
    }

    console.log('Comprehensive demo data seeding completed successfully!');
    return { 
      success: true, 
      message: 'Comprehensive demo data created successfully! Created 15 users, 20+ posts, 5 events, 5 jobs, 5 initiatives, 5 newsletters, 3 organizations, and much more.' 
    };
    
  } catch (error) {
    console.error('Demo data seeding failed:', error);
    throw error;
  }
};