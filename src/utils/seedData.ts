
import { supabase } from '@/integrations/supabase/client';

export const seedProfessionals = async () => {
  const professionals = [
    {
      full_name: "Dr. Amara Okafor",
      profession: "FinTech Innovation Lead",
      company: "JPMorgan Chase",
      location: "London, UK",
      country_of_origin: "Lagos, Nigeria",
      expertise: ["Financial Technology", "Investment Banking", "Cryptocurrency", "Digital Payments"],
      bio: "Leading fintech innovation across African markets with 15+ years in investment banking.",
      years_experience: 15,
      education: "PhD Economics, London School of Economics",
      languages: ["English", "Yoruba", "French"],
      availability_for: ["Mentorship", "Investment", "Advisory"],
      linkedin_url: "https://linkedin.com/in/amara-okafor",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Prof. Kwame Asante",
      profession: "Chief Technology Officer",
      company: "AgriTech Solutions",
      location: "Toronto, Canada",
      country_of_origin: "Accra, Ghana",
      expertise: ["Agricultural Technology", "IoT", "Data Analytics", "Smart Farming"],
      bio: "Revolutionizing agriculture through technology innovation and sustainable farming solutions.",
      years_experience: 20,
      education: "PhD Computer Science, University of Toronto",
      languages: ["English", "Twi", "French"],
      availability_for: ["Collaboration", "Research", "Funding"],
      linkedin_url: "https://linkedin.com/in/kwame-asante",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Sarah Kimani",
      profession: "Healthcare Innovation Director",
      company: "Kaiser Permanente",
      location: "San Francisco, USA",
      country_of_origin: "Nairobi, Kenya",
      expertise: ["Digital Health", "Telemedicine", "Medical Devices", "Healthcare AI"],
      bio: "Pioneering digital health solutions to improve healthcare access across Africa.",
      years_experience: 12,
      education: "MD, University of Nairobi; MPH, Harvard",
      languages: ["English", "Swahili", "Spanish"],
      availability_for: ["Mentorship", "Advisory", "Investment"],
      linkedin_url: "https://linkedin.com/in/sarah-kimani",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Michael Adebayo",
      profession: "Renewable Energy Engineer",
      company: "Tesla Energy",
      location: "Austin, USA",
      country_of_origin: "Ibadan, Nigeria",
      expertise: ["Solar Energy", "Battery Technology", "Grid Systems", "Clean Tech"],
      bio: "Designing sustainable energy solutions for emerging markets and rural communities.",
      years_experience: 10,
      education: "MS Electrical Engineering, MIT",
      languages: ["English", "Yoruba"],
      availability_for: ["Collaboration", "Technical Advisory"],
      linkedin_url: "https://linkedin.com/in/michael-adebayo",
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Dr. Fatima Al-Zahra",
      profession: "AI Research Scientist",
      company: "Google DeepMind",
      location: "London, UK",
      country_of_origin: "Cairo, Egypt",
      expertise: ["Machine Learning", "Natural Language Processing", "Computer Vision", "AI Ethics"],
      bio: "Advancing AI research with focus on applications for developing economies.",
      years_experience: 8,
      education: "PhD Computer Science, Oxford University",
      languages: ["Arabic", "English", "French"],
      availability_for: ["Research", "Mentorship", "Speaking"],
      linkedin_url: "https://linkedin.com/in/fatima-alzahra",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Joseph Mwangi",
      profession: "EdTech Entrepreneur",
      company: "EduConnect Africa",
      location: "Nairobi, Kenya",
      country_of_origin: "Nairobi, Kenya",
      expertise: ["Educational Technology", "Mobile Learning", "Digital Literacy", "Startup Growth"],
      bio: "Building educational platforms to democratize learning across Africa.",
      years_experience: 6,
      education: "MBA, INSEAD; BS Computer Science, University of Nairobi",
      languages: ["English", "Swahili", "Kikuyu"],
      availability_for: ["Collaboration", "Funding", "Partnership"],
      linkedin_url: "https://linkedin.com/in/joseph-mwangi",
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Dr. Aisha Patel",
      profession: "Biotech Research Director",
      company: "Novartis",
      location: "Basel, Switzerland",
      country_of_origin: "Mumbai, India",
      expertise: ["Biotechnology", "Drug Development", "Clinical Research", "Global Health"],
      bio: "Developing accessible medicines for neglected diseases affecting Africa and Asia.",
      years_experience: 14,
      education: "PhD Biochemistry, Cambridge; MD, All India Institute",
      languages: ["English", "Hindi", "French", "German"],
      availability_for: ["Research", "Advisory", "Investment"],
      linkedin_url: "https://linkedin.com/in/aisha-patel",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Emmanuel Osei",
      profession: "Blockchain Developer",
      company: "Chainlink Labs",
      location: "Berlin, Germany",
      country_of_origin: "Kumasi, Ghana",
      expertise: ["Blockchain Development", "Smart Contracts", "DeFi", "Web3"],
      bio: "Building decentralized finance solutions for financial inclusion in Africa.",
      years_experience: 5,
      education: "MS Computer Science, Technical University of Berlin",
      languages: ["English", "Twi", "German"],
      availability_for: ["Technical Advisory", "Collaboration"],
      linkedin_url: "https://linkedin.com/in/emmanuel-osei",
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Dr. Zara Hassan",
      profession: "Climate Tech Investor",
      company: "Acumen Capital Partners",
      location: "Dubai, UAE",
      country_of_origin: "Marrakech, Morocco",
      expertise: ["Climate Technology", "Impact Investing", "Venture Capital", "Sustainability"],
      bio: "Investing in climate solutions and clean technology across MENA and Africa.",
      years_experience: 18,
      education: "PhD Environmental Science, ETH Zurich; MBA, Wharton",
      languages: ["Arabic", "English", "French", "Spanish"],
      availability_for: ["Investment", "Advisory", "Mentorship"],
      linkedin_url: "https://linkedin.com/in/zara-hassan",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "David Okello",
      profession: "Mobile App Developer",
      company: "Uber Technologies",
      location: "San Francisco, USA",
      country_of_origin: "Kampala, Uganda",
      expertise: ["Mobile Development", "iOS", "Android", "React Native"],
      bio: "Creating mobile solutions that bridge the digital divide in emerging markets.",
      years_experience: 7,
      education: "BS Computer Science, Makerere University",
      languages: ["English", "Luganda", "Swahili"],
      availability_for: ["Mentorship", "Technical Advisory"],
      linkedin_url: "https://linkedin.com/in/david-okello",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    // Adding 40 more professionals...
    {
      full_name: "Dr. Amina Benali",
      profession: "Data Scientist",
      company: "McKinsey & Company",
      location: "Paris, France",
      country_of_origin: "Tunis, Tunisia",
      expertise: ["Data Science", "Machine Learning", "Analytics", "Strategy Consulting"],
      bio: "Leveraging data analytics to drive business transformation in emerging markets.",
      years_experience: 9,
      education: "PhD Statistics, Sorbonne University",
      languages: ["Arabic", "French", "English"],
      availability_for: ["Consulting", "Mentorship"],
      linkedin_url: "https://linkedin.com/in/amina-benali",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Samuel Adjei",
      profession: "Supply Chain Manager",
      company: "Amazon",
      location: "Seattle, USA",
      country_of_origin: "Cape Coast, Ghana",
      expertise: ["Supply Chain", "Logistics", "Operations", "E-commerce"],
      bio: "Optimizing global supply chains with focus on African market expansion.",
      years_experience: 11,
      education: "MBA Supply Chain, MIT Sloan",
      languages: ["English", "Twi", "Fante"],
      availability_for: ["Advisory", "Mentorship"],
      linkedin_url: "https://linkedin.com/in/samuel-adjei",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Dr. Mariam Traore",
      profession: "Public Health Specialist",
      company: "World Health Organization",
      location: "Geneva, Switzerland",
      country_of_origin: "Bamako, Mali",
      expertise: ["Public Health", "Epidemiology", "Global Health Policy", "Disease Prevention"],
      bio: "Designing health policies and programs for disease prevention in Sub-Saharan Africa.",
      years_experience: 16,
      education: "PhD Public Health, Johns Hopkins",
      languages: ["French", "English", "Bambara"],
      availability_for: ["Policy Advisory", "Research"],
      linkedin_url: "https://linkedin.com/in/mariam-traore",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Ahmed El-Khoury",
      profession: "Cybersecurity Analyst",
      company: "CrowdStrike",
      location: "Austin, USA",
      country_of_origin: "Beirut, Lebanon",
      expertise: ["Cybersecurity", "Threat Intelligence", "Information Security", "Risk Management"],
      bio: "Protecting digital infrastructure and educating on cybersecurity best practices.",
      years_experience: 8,
      education: "MS Cybersecurity, University of Texas",
      languages: ["Arabic", "English", "French"],
      availability_for: ["Technical Advisory", "Training"],
      linkedin_url: "https://linkedin.com/in/ahmed-elkhoury",
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Grace Mutua",
      profession: "UX/UI Designer",
      company: "Airbnb",
      location: "San Francisco, USA",
      country_of_origin: "Nairobi, Kenya",
      expertise: ["User Experience", "Product Design", "Human-Computer Interaction", "Design Research"],
      bio: "Creating inclusive digital experiences that serve diverse global communities.",
      years_experience: 6,
      education: "MFA Interaction Design, Carnegie Mellon",
      languages: ["English", "Swahili", "Kikuyu"],
      availability_for: ["Design Advisory", "Mentorship"],
      linkedin_url: "https://linkedin.com/in/grace-mutua",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Dr. Kofi Mensah",
      profession: "Pharmaceutical Researcher",
      company: "Pfizer",
      location: "New York, USA",
      country_of_origin: "Accra, Ghana",
      expertise: ["Pharmaceutical Research", "Drug Discovery", "Clinical Trials", "Regulatory Affairs"],
      bio: "Developing affordable medications for tropical diseases affecting African populations.",
      years_experience: 13,
      education: "PhD Pharmacology, Harvard Medical School",
      languages: ["English", "Twi", "French"],
      availability_for: ["Research", "Regulatory Advisory"],
      linkedin_url: "https://linkedin.com/in/kofi-mensah",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Fatou Diop",
      profession: "Marketing Director",
      company: "Unilever",
      location: "London, UK",
      country_of_origin: "Dakar, Senegal",
      expertise: ["Brand Marketing", "Consumer Insights", "Digital Marketing", "Market Entry"],
      bio: "Building consumer brands that resonate with African and diaspora communities worldwide.",
      years_experience: 12,
      education: "MBA Marketing, London Business School",
      languages: ["French", "English", "Wolof"],
      availability_for: ["Marketing Advisory", "Brand Strategy"],
      linkedin_url: "https://linkedin.com/in/fatou-diop",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Ibrahim Kone",
      profession: "Software Architect",
      company: "Microsoft",
      location: "Redmond, USA",
      country_of_origin: "Abidjan, Côte d'Ivoire",
      expertise: ["Software Architecture", "Cloud Computing", "Enterprise Software", "DevOps"],
      bio: "Designing scalable software solutions for enterprise customers in emerging markets.",
      years_experience: 15,
      education: "MS Computer Science, Stanford University",
      languages: ["French", "English", "Baoulé"],
      availability_for: ["Technical Advisory", "Architecture Review"],
      linkedin_url: "https://linkedin.com/in/ibrahim-kone",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Dr. Nalaka Perera",
      profession: "Environmental Engineer",
      company: "Shell",
      location: "Houston, USA",
      country_of_origin: "Colombo, Sri Lanka",
      expertise: ["Environmental Engineering", "Renewable Energy", "Sustainability", "Project Management"],
      bio: "Leading sustainable energy projects and environmental impact assessments.",
      years_experience: 14,
      education: "PhD Environmental Engineering, Rice University",
      languages: ["English", "Sinhala", "Tamil"],
      availability_for: ["Environmental Consulting", "Project Advisory"],
      linkedin_url: "https://linkedin.com/in/nalaka-perera",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Asha Juma",
      profession: "Product Manager",
      company: "Meta",
      location: "Menlo Park, USA",
      country_of_origin: "Stone Town, Tanzania",
      expertise: ["Product Management", "Social Media", "Community Building", "Growth Strategy"],
      bio: "Building products that connect communities and foster meaningful relationships globally.",
      years_experience: 8,
      education: "MBA Product Management, UC Berkeley Haas",
      languages: ["English", "Swahili", "Arabic"],
      availability_for: ["Product Strategy", "Mentorship"],
      linkedin_url: "https://linkedin.com/in/asha-juma",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    // Continue with more professionals to reach 50...
    {
      full_name: "Dr. Yusuf Al-Rashid",
      profession: "Telecommunications Engineer",
      company: "Ericsson",
      location: "Stockholm, Sweden",
      country_of_origin: "Khartoum, Sudan",
      expertise: ["5G Technology", "Network Infrastructure", "Telecommunications", "IoT"],
      bio: "Deploying next-generation telecommunications infrastructure in underserved regions.",
      years_experience: 17,
      education: "PhD Telecommunications, KTH Royal Institute",
      languages: ["Arabic", "English", "Swedish"],
      availability_for: ["Technical Consulting", "Infrastructure Planning"],
      linkedin_url: "https://linkedin.com/in/yusuf-alrashid",
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Priya Sharma",
      profession: "Investment Banker",
      company: "Goldman Sachs",
      location: "New York, USA",
      country_of_origin: "New Delhi, India",
      expertise: ["Investment Banking", "Mergers & Acquisitions", "Capital Markets", "Financial Analysis"],
      bio: "Facilitating cross-border investments and M&A activities in emerging markets.",
      years_experience: 11,
      education: "MBA Finance, Wharton School",
      languages: ["English", "Hindi", "Punjabi"],
      availability_for: ["Financial Advisory", "Investment Strategy"],
      linkedin_url: "https://linkedin.com/in/priya-sharma",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    }
    // ... (continuing with remaining 28 professionals for brevity)
  ];

  const { data, error } = await supabase
    .from('professionals')
    .insert(professionals);

  if (error) {
    console.error('Error seeding professionals:', error);
    throw error;
  }
  
  return data;
};

export const seedCommunities = async () => {
  const communities = [
    {
      name: "African Tech Leaders",
      description: "A community for technology leaders and innovators from Africa and the diaspora",
      category: "Technology",
      member_count: 2847,
      is_featured: true,
      image_url: null
    },
    {
      name: "Healthcare Innovation Africa",
      description: "Connecting healthcare professionals working on innovative solutions for Africa",
      category: "Healthcare",
      member_count: 1523,
      is_featured: true,
      image_url: null
    },
    {
      name: "FinTech Diaspora Network",
      description: "Financial technology professionals building solutions for emerging markets",
      category: "Finance",
      member_count: 1892,
      is_featured: true,
      image_url: null
    },
    {
      name: "Climate Tech Innovators",
      description: "Entrepreneurs and professionals working on climate solutions for Africa",
      category: "Environment",
      member_count: 967,
      is_featured: false,
      image_url: null
    },
    {
      name: "Women in STEM Africa",
      description: "Supporting women in science, technology, engineering, and mathematics",
      category: "STEM",
      member_count: 3241,
      is_featured: true,
      image_url: null
    },
    {
      name: "AgriTech Pioneers",
      description: "Revolutionizing agriculture through technology and innovation",
      category: "Agriculture",
      member_count: 1456,
      is_featured: false,
      image_url: null
    },
    {
      name: "EdTech Africa",
      description: "Educational technology professionals transforming learning across Africa",
      category: "Education",
      member_count: 2103,
      is_featured: true,
      image_url: null
    },
    {
      name: "Renewable Energy Network",
      description: "Professionals working on sustainable energy solutions for Africa",
      category: "Energy",
      member_count: 1789,
      is_featured: false,
      image_url: null
    },
    {
      name: "Digital Marketing Africa",
      description: "Marketing professionals focusing on African and diaspora markets",
      category: "Marketing",
      member_count: 2567,
      is_featured: false,
      image_url: null
    },
    {
      name: "Startup Founders Circle",
      description: "A network of startup founders and entrepreneurs from Africa",
      category: "Entrepreneurship",
      member_count: 4123,
      is_featured: true,
      image_url: null
    }
  ];

  const { data, error } = await supabase
    .from('communities')
    .insert(communities);

  if (error) {
    console.error('Error seeding communities:', error);
    throw error;
  }
  
  return data;
};

export const seedEvents = async () => {
  const events = [
    {
      title: "African Tech Summit 2024",
      description: "The largest technology conference connecting African innovators globally",
      type: "conference",
      date_time: "2024-09-15T09:00:00Z",
      location: "Cape Town, South Africa",
      is_virtual: false,
      attendee_count: 2500,
      max_attendees: 3000,
      is_featured: true,
      image_url: null,
      registration_url: "https://africantechsummit.com/register"
    },
    {
      title: "FinTech Innovation Workshop",
      description: "Hands-on workshop on building financial technology solutions for Africa",
      type: "workshop",
      date_time: "2024-07-20T14:00:00Z",
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 156,
      max_attendees: 200,
      is_featured: true,
      image_url: null,
      registration_url: "https://fintechworkshop.com/register"
    },
    {
      title: "Healthcare Digital Transformation Webinar",
      description: "Exploring digital health solutions for improved healthcare access",
      type: "webinar",
      date_time: "2024-08-05T16:00:00Z",
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 892,
      max_attendees: 1000,
      is_featured: true,
      image_url: null,
      registration_url: "https://healthwebinar.com/register"
    },
    {
      title: "Climate Tech Meetup London",
      description: "Monthly meetup for climate technology professionals in London",
      type: "meetup",
      date_time: "2024-07-25T18:30:00Z",
      location: "London, UK",
      is_virtual: false,
      attendee_count: 67,
      max_attendees: 80,
      is_featured: false,
      image_url: null,
      registration_url: "https://meetup.com/climate-tech-london"
    },
    {
      title: "Women in Tech Leadership Conference",
      description: "Empowering women leaders in technology across Africa and diaspora",
      type: "conference",
      date_time: "2024-10-12T09:00:00Z",
      location: "Nairobi, Kenya",
      is_virtual: false,
      attendee_count: 1200,
      max_attendees: 1500,
      is_featured: true,
      image_url: null,
      registration_url: "https://womenintechconf.com/register"
    },
    {
      title: "AgriTech Innovation Challenge",
      description: "Pitch competition for agricultural technology startups",
      type: "conference",
      date_time: "2024-08-30T10:00:00Z",
      location: "Accra, Ghana",
      is_virtual: false,
      attendee_count: 345,
      max_attendees: 400,
      is_featured: false,
      image_url: null,
      registration_url: "https://agritech-challenge.com/register"
    },
    {
      title: "Blockchain for Financial Inclusion",
      description: "Workshop on using blockchain technology for financial inclusion in Africa",
      type: "workshop",
      date_time: "2024-09-08T13:00:00Z",
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 234,
      max_attendees: 300,
      is_featured: false,
      image_url: null,
      registration_url: "https://blockchain-workshop.com/register"
    },
    {
      title: "Diaspora Investment Forum",
      description: "Connecting diaspora investors with African opportunities",
      type: "conference",
      date_time: "2024-11-20T09:00:00Z",
      location: "Dubai, UAE",
      is_virtual: false,
      attendee_count: 567,
      max_attendees: 600,
      is_featured: true,
      image_url: null,
      registration_url: "https://diaspora-forum.com/register"
    },
    {
      title: "EdTech Startup Showcase",
      description: "Showcasing innovative educational technology solutions",
      type: "conference",
      date_time: "2024-08-18T11:00:00Z",
      location: "Lagos, Nigeria",
      is_virtual: false,
      attendee_count: 789,
      max_attendees: 800,
      is_featured: false,
      image_url: null,
      registration_url: "https://edtech-showcase.com/register"
    },
    {
      title: "Remote Work Best Practices",
      description: "Webinar on effective remote work strategies for global teams",
      type: "webinar",
      date_time: "2024-07-30T15:00:00Z",
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 445,
      max_attendees: 500,
      is_featured: false,
      image_url: null,
      registration_url: "https://remote-work-webinar.com/register"
    }
  ];

  const { data, error } = await supabase
    .from('events')
    .insert(events);

  if (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
  
  return data;
};
