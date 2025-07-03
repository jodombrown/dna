import { supabase } from '@/integrations/supabase/client';

// Demo profiles data
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
  }
];

// Demo posts data
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

export const seedDemoData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting demo data seeding...');

    // First, let's create demo user profiles
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    // If we don't have enough users, we'll use the existing ones
    const existingUsers = authUsers.users;
    
    // Seed profiles for existing users
    for (let i = 0; i < Math.min(demoProfiles.length, existingUsers.length); i++) {
      const profile = demoProfiles[i];
      const user = existingUsers[i];
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
        });
        
      if (profileError) {
        console.error(`Error creating profile ${i}:`, profileError);
      } else {
        console.log(`✅ Created profile: ${profile.full_name}`);
      }
    }

    // Get the created profiles to use for posts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(8);

    if (!profiles || profiles.length === 0) {
      console.error('No profiles found to create posts for');
      return;
    }

    // Seed posts
    for (let i = 0; i < demoPosts.length; i++) {
      const post = demoPosts[i];
      const randomProfile = profiles[i % profiles.length];
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: randomProfile.id,
          content: post.content,
          hashtags: post.hashtags,
          post_type: post.post_type,
          is_published: true,
          moderation_status: 'approved',
          likes_count: Math.floor(Math.random() * 50) + 5,
          comments_count: Math.floor(Math.random() * 20) + 1,
          shares_count: Math.floor(Math.random() * 15) + 1,
        });
        
      if (postError) {
        console.error(`Error creating post ${i}:`, postError);
      } else {
        console.log(`✅ Created post by ${randomProfile.full_name}`);
      }
    }

    // Seed events
    for (let i = 0; i < demoEvents.length; i++) {
      const event = demoEvents[i];
      const randomProfile = profiles[i % profiles.length];
      
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          ...event,
          created_by: randomProfile.id,
          attendee_count: Math.floor(Math.random() * 50) + 10,
        });
        
      if (eventError) {
        console.error(`Error creating event ${i}:`, eventError);
      } else {
        console.log(`✅ Created event: ${event.title}`);
      }
    }

    // Seed communities
    for (let i = 0; i < demoCommunities.length; i++) {
      const community = demoCommunities[i];
      const randomProfile = profiles[i % profiles.length];
      
      const { error: communityError } = await supabase
        .from('communities')
        .insert({
          ...community,
          created_by: randomProfile.id,
          member_count: Math.floor(Math.random() * 500) + 50,
        });
        
      if (communityError) {
        console.error(`Error creating community ${i}:`, communityError);
      } else {
        console.log(`✅ Created community: ${community.name}`);
      }
    }

    // Seed contribution cards
    for (let i = 0; i < demoContributionCards.length; i++) {
      const card = demoContributionCards[i];
      const randomProfile = profiles[i % profiles.length];
      
      const { error: cardError } = await supabase
        .from('contribution_cards')
        .insert({
          ...card,
          created_by: randomProfile.id,
        });
        
      if (cardError) {
        console.error(`Error creating contribution card ${i}:`, cardError);
      } else {
        console.log(`✅ Created contribution card: ${card.title}`);
      }
    }

    console.log('🎉 Demo data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
};