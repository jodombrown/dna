import { supabase } from '@/integrations/supabase/client';

export const seedProfessionals = async () => {
  const professionals = [
    {
      full_name: "Dr. Amara Okafor",
      profession: "FinTech CEO",
      company: "AfriPay Solutions",
      location: "London, UK",
      country_of_origin: "Nigeria",
      expertise: ["Financial Technology", "Digital Payments", "Blockchain"],
      bio: "Leading fintech innovation across Africa and Europe. Former Goldman Sachs VP turned entrepreneur, passionate about financial inclusion.",
      years_experience: 12,
      education: "PhD Computer Science, MIT; MBA Wharton",
      languages: ["English", "Igbo", "French"],
      availability_for: ["Mentorship", "Investment", "Speaking"],
      linkedin_url: "https://linkedin.com/in/amaraokafor",
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Prof. Kwame Asante",
      profession: "AgriTech Researcher",
      company: "Ghana Institute of Technology",
      location: "Toronto, Canada",
      country_of_origin: "Ghana",
      expertise: ["Agricultural Technology", "Climate Science", "Sustainable Farming"],
      bio: "Pioneering sustainable agriculture solutions for smallholder farmers across West Africa. Published 50+ research papers on climate-resilient farming.",
      years_experience: 18,
      education: "PhD Agricultural Sciences, University of Toronto",
      languages: ["English", "Twi", "French"],
      availability_for: ["Research Collaboration", "Consulting", "Mentorship"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Sarah Mwangi",
      profession: "Health Tech Founder",
      company: "MediConnect Africa",
      location: "San Francisco, USA",
      country_of_origin: "Kenya",
      expertise: ["Healthcare Technology", "Telemedicine", "Public Health"],
      bio: "Building digital health solutions to improve healthcare access in rural Africa. Stanford-trained physician turned tech entrepreneur.",
      years_experience: 8,
      education: "MBA Stanford, MD University of Nairobi",
      languages: ["English", "Swahili", "Spanish"],
      availability_for: ["Collaboration", "Mentorship", "Investment"],
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Ibrahim Diallo",
      profession: "Renewable Energy Engineer",
      company: "Solar Solutions West Africa",
      location: "Paris, France",
      country_of_origin: "Senegal",
      expertise: ["Solar Energy", "Grid Infrastructure", "Energy Policy"],
      bio: "Developing off-grid solar solutions for rural communities across the Sahel region. Led electrification projects reaching 100,000+ people.",
      years_experience: 10,
      education: "MSc Renewable Energy, École Polytechnique",
      languages: ["French", "Wolof", "English", "Arabic"],
      availability_for: ["Technical Consulting", "Project Partnership"],
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Dr. Fatima Al-Rashid",
      profession: "AI Research Scientist",
      company: "DeepMind",
      location: "London, UK",
      country_of_origin: "Morocco",
      expertise: ["Artificial Intelligence", "Machine Learning", "Computer Vision"],
      bio: "Leading AI research with focus on applications for African languages and contexts. Pioneer in multilingual NLP for underrepresented languages.",
      years_experience: 7,
      education: "PhD Computer Science, Oxford University",
      languages: ["Arabic", "French", "English"],
      availability_for: ["Research Collaboration", "Mentorship", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Chinedu Okwu",
      profession: "Investment Banking VP",
      company: "J.P. Morgan",
      location: "New York, USA",
      country_of_origin: "Nigeria",
      expertise: ["Investment Banking", "Capital Markets", "Private Equity"],
      bio: "Specializing in African infrastructure and energy deals. Raised $2B+ in financing for African projects over the past 5 years.",
      years_experience: 9,
      education: "MBA Harvard Business School, BSc Economics University of Lagos",
      languages: ["English", "Igbo", "Yoruba"],
      availability_for: ["Investment", "Mentorship", "Deal Sourcing"],
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Aminata Koné",
      profession: "Fashion Designer & Entrepreneur",
      company: "Kente Couture",
      location: "Milan, Italy",
      country_of_origin: "Ivory Coast",
      expertise: ["Fashion Design", "Sustainable Fashion", "Brand Marketing"],
      bio: "Bridging African heritage with contemporary fashion. Featured in Vogue Africa and Milan Fashion Week. Champion of ethical fashion practices.",
      years_experience: 6,
      education: "Fashion Design, Istituto Marangoni Milan",
      languages: ["French", "English", "Italian", "Baoulé"],
      availability_for: ["Creative Collaboration", "Mentorship", "Brand Partnerships"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true
    },
    {
      full_name: "Dr. Kofi Mensah",
      profession: "Public Health Researcher",
      company: "World Health Organization",
      location: "Geneva, Switzerland",
      country_of_origin: "Ghana",
      expertise: ["Epidemiology", "Global Health", "Health Policy"],
      bio: "Leading WHO initiatives on infectious disease prevention in Africa. Expert on health systems strengthening and pandemic preparedness.",
      years_experience: 14,
      education: "PhD Public Health, Johns Hopkins; MD University of Ghana",
      languages: ["English", "Twi", "French", "German"],
      availability_for: ["Policy Consulting", "Research Collaboration", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Zara Kimani",
      profession: "EdTech Product Manager",
      company: "Google for Education",
      location: "Dublin, Ireland",
      country_of_origin: "Kenya",
      expertise: ["Product Management", "Educational Technology", "User Experience"],
      bio: "Designing educational products for emerging markets. Former teacher turned tech PM, passionate about democratizing quality education.",
      years_experience: 7,
      education: "MSc Computer Science, Trinity College Dublin; BEd Kenyatta University",
      languages: ["English", "Swahili", "French"],
      availability_for: ["Product Consulting", "Mentorship", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Mamadou Traoré",
      profession: "Microfinance Executive",
      company: "Oikocredit",
      location: "Amsterdam, Netherlands",
      country_of_origin: "Mali",
      expertise: ["Microfinance", "Impact Investing", "Financial Inclusion"],
      bio: "Driving financial inclusion across West Africa through innovative microfinance solutions. 15+ years empowering small businesses and farmers.",
      years_experience: 15,
      education: "MBA INSEAD, Economics University of Bamako",
      languages: ["French", "Bambara", "English", "Dutch"],
      availability_for: ["Impact Investment", "Consulting", "Mentorship"],
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Aisha Bello",
      profession: "Cybersecurity Consultant",
      company: "Deloitte Cyber",
      location: "London, UK",
      country_of_origin: "Nigeria",
      expertise: ["Cybersecurity", "Risk Management", "Compliance"],
      bio: "Protecting African businesses from cyber threats. Specialized in fintech security and regulatory compliance across emerging markets.",
      years_experience: 8,
      education: "MSc Cybersecurity, Imperial College London",
      languages: ["English", "Hausa", "Yoruba"],
      availability_for: ["Security Consulting", "Training", "Mentorship"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Tunde Adebayo",
      profession: "Venture Capital Partner",
      company: "TLcom Capital",
      location: "Lagos, Nigeria",
      country_of_origin: "Nigeria",
      expertise: ["Venture Capital", "Startup Scaling", "Tech Investments"],
      bio: "Investing in African tech startups with global ambitions. Portfolio includes 20+ companies across fintech, healthtech, and logistics.",
      years_experience: 11,
      education: "MBA Stanford GSB, Engineering University of Ibadan",
      languages: ["English", "Yoruba", "French"],
      availability_for: ["Investment", "Startup Mentorship", "Board Advisory"],
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    },
    {
      full_name: "Fatouma Diop",
      profession: "International Development Manager",
      company: "African Development Bank",
      location: "Abidjan, Ivory Coast",
      country_of_origin: "Senegal",
      expertise: ["Development Finance", "Infrastructure", "Project Management"],
      bio: "Managing multi-million dollar infrastructure projects across Africa. Expert in sustainable development and climate finance mechanisms.",
      years_experience: 13,
      education: "MSc Development Economics, LSE",
      languages: ["French", "Wolof", "English", "Portuguese"],
      availability_for: ["Development Consulting", "Project Partnerships", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Yemi Adeyemi",
      profession: "Data Scientist",
      company: "Meta",
      location: "Menlo Park, USA",
      country_of_origin: "Nigeria",
      expertise: ["Data Science", "Machine Learning", "Product Analytics"],
      bio: "Building ML models for global products used by billions. Focused on algorithmic fairness and representation in AI systems.",
      years_experience: 6,
      education: "PhD Statistics, Stanford University",
      languages: ["English", "Yoruba"],
      availability_for: ["Technical Mentorship", "Data Consulting", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    },
    {
      full_name: "Khadija Noor",
      profession: "Sustainable Finance Director",
      company: "Standard Chartered",
      location: "Dubai, UAE",
      country_of_origin: "Somalia",
      expertise: ["Sustainable Finance", "ESG Investing", "Islamic Finance"],
      bio: "Leading sustainable finance initiatives across Africa and Middle East. Pioneer in green sukuk and climate finance instruments.",
      years_experience: 12,
      education: "MBA INSEAD, Islamic Finance INCEIF Malaysia",
      languages: ["English", "Somali", "Arabic", "French"],
      availability_for: ["Finance Advisory", "ESG Consulting", "Investment"],
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false
    }
  ];

  // Generate additional diverse professionals
  const additionalNames = [
    "Bola Ogundipe", "Aminata Konaté", "Emeka Okonkwo", "Safiya Umar", "Kwesi Boateng",
    "Mariam Sesay", "Joseph Mbeki", "Halima Yusuf", "Victor Nkomo", "Aishah Rahman",
    "Samuel Gyamfi", "Naima Osman", "Collins Mutua", "Zahra Benali", "Godwin Achebe",
    "Maryam Suleiman", "Peter Osei", "Kadiatou Barry", "Francis Maina", "Layla Farah",
    "Emmanuel Asante", "Rukayya Garba", "Michael Ochieng", "Yasmin Abdullahi", "Daniel Opoku",
    "Salamatu Jalloh", "Richard Agyei", "Aminata Diallo", "Philip Wambua", "Fatou Ndiaye",
    "Isaac Akoto", "Habiba Moussa", "George Mutindi", "Aicha Touré", "Anthony Mensah"
  ];

  const professions = [
    { title: "Software Engineer", company: "Microsoft", expertise: ["Full Stack Development", "Cloud Computing", "DevOps"] },
    { title: "Product Marketing Manager", company: "Stripe", expertise: ["Product Marketing", "Growth Strategy", "Market Research"] },
    { title: "Climate Finance Analyst", company: "Green Climate Fund", expertise: ["Climate Finance", "Carbon Markets", "Environmental Economics"] },
    { title: "Digital Marketing Director", company: "Uber", expertise: ["Digital Marketing", "Brand Strategy", "Performance Marketing"] },
    { title: "Renewable Energy Consultant", company: "Shell", expertise: ["Renewable Energy", "Energy Transition", "Project Finance"] },
    { title: "Healthcare Administrator", company: "Partners In Health", expertise: ["Healthcare Management", "Global Health", "Operations"] },
    { title: "Legal Counsel", company: "Baker McKenzie", expertise: ["Corporate Law", "M&A", "Africa Practice"] },
    { title: "Supply Chain Manager", company: "Maersk", expertise: ["Supply Chain", "Logistics", "Operations Management"] },
    { title: "Social Impact Consultant", company: "Accenture Development Partnerships", expertise: ["Social Impact", "Development", "Strategy"] },
    { title: "Architecture Principal", company: "Foster + Partners", expertise: ["Architecture", "Urban Planning", "Sustainable Design"] },
    { title: "Film Producer", company: "Netflix", expertise: ["Film Production", "Content Strategy", "African Cinema"] },
    { title: "Biotechnology Researcher", company: "Novartis", expertise: ["Biotechnology", "Drug Discovery", "Clinical Research"] },
    { title: "Trade Finance Manager", company: "Afreximbank", expertise: ["Trade Finance", "Export Credit", "Risk Management"] },
    { title: "UX Design Lead", company: "Airbnb", expertise: ["User Experience", "Design Systems", "Research"] },
    { title: "Sustainability Manager", company: "Unilever", expertise: ["Sustainability", "CSR", "Environmental Strategy"] }
  ];

  const locations = [
    "London, UK", "New York, USA", "Toronto, Canada", "Berlin, Germany", "Paris, France",
    "Dubai, UAE", "Singapore", "Sydney, Australia", "Amsterdam, Netherlands", "Stockholm, Sweden",
    "Zurich, Switzerland", "Madrid, Spain", "Brussels, Belgium", "Vienna, Austria", "Copenhagen, Denmark"
  ];

  const countries = [
    "Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "Uganda", "Tanzania", "Rwanda",
    "Senegal", "Morocco", "Egypt", "Tunisia", "Algeria", "Cameroon", "Ivory Coast", "Mali",
    "Burkina Faso", "Niger", "Chad", "Gambia", "Sierra Leone", "Liberia", "Guinea", "Togo",
    "Benin", "Madagascar", "Mauritius", "Botswana", "Namibia", "Zambia"
  ];

  const educationLevels = [
    "PhD Economics, Harvard University", "MBA Wharton, BSc Engineering University of Lagos",
    "MSc Computer Science, Cambridge University", "JD Harvard Law, LLB University of Cape Town",
    "PhD Medicine, Johns Hopkins", "MBA INSEAD, BSc Makerere University",
    "MSc Finance, London School of Economics", "PhD Engineering, MIT",
    "MBA Stanford, BSc University of Ghana", "MSc Development, Oxford University"
  ];

  const languageCombinations = [
    ["English", "Swahili", "French"], ["English", "Yoruba", "Hausa"], ["French", "Wolof", "English"],
    ["English", "Amharic", "Arabic"], ["English", "Twi", "French"], ["Arabic", "French", "English"],
    ["English", "Igbo", "French"], ["Portuguese", "English", "French"], ["English", "Zulu", "Afrikaans"],
    ["French", "Lingala", "English"], ["English", "Somali", "Arabic"], ["English", "Shona", "Portuguese"]
  ];

  const availabilityOptions = [
    ["Mentorship", "Speaking"], ["Investment", "Advisory"], ["Collaboration", "Consulting"],
    ["Technical Support", "Mentorship"], ["Strategic Advisory", "Investment"], ["Training", "Consulting"],
    ["Project Partnership", "Mentorship"], ["Board Advisory", "Speaking"], ["Research Collaboration", "Mentorship"]
  ];

  const bioTemplates = [
    "Passionate about driving innovation and creating sustainable impact across Africa.",
    "Building bridges between African talent and global opportunities.",
    "Committed to empowering the next generation of African leaders and entrepreneurs.",
    "Leveraging technology to solve Africa's most pressing challenges.",
    "Dedicated to advancing economic development and social progress in Africa.",
    "Champion of diversity and inclusion in global corporate environments.",
    "Focused on creating scalable solutions for emerging markets.",
    "Bridging the gap between African heritage and global innovation.",
    "Committed to sustainable development and environmental stewardship.",
    "Passionate advocate for African representation in global industries."
  ];

  const additionalProfessionals = additionalNames.map((name, index) => {
    const profession = professions[index % professions.length];
    const yearsExp = 3 + (index % 15);
    
    return {
      full_name: name,
      profession: profession.title,
      company: profession.company,
      location: locations[index % locations.length],
      country_of_origin: countries[index % countries.length],
      expertise: profession.expertise,
      bio: `${profession.title} at ${profession.company}. ${bioTemplates[index % bioTemplates.length]} ${yearsExp} years of experience in driving meaningful change.`,
      years_experience: yearsExp,
      education: educationLevels[index % educationLevels.length],
      languages: languageCombinations[index % languageCombinations.length],
      availability_for: availabilityOptions[index % availabilityOptions.length],
      is_mentor: index % 3 === 0,
      is_investor: index % 5 === 0,
      looking_for_opportunities: index % 4 === 0
    };
  });

  const allProfessionals = [...professionals, ...additionalProfessionals];

  try {
    const { data, error } = await supabase
      .from('professionals')
      .insert(allProfessionals)
      .select();

    if (error) {
      console.error('Error seeding professionals:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length || 0} professionals`);
    return data;
  } catch (error) {
    console.error('Failed to seed professionals:', error);
    throw error;
  }
};

export const seedCommunities = async () => {
  const communities = [
    {
      name: "African Tech Leaders",
      description: "A community for African technology leaders and innovators sharing insights and building the future.",
      category: "Technology",
      member_count: 1250,
      is_featured: true
    },
    {
      name: "Diaspora Entrepreneurs",
      description: "Connecting African entrepreneurs in the diaspora to share resources, opportunities, and support.",
      category: "Business",
      member_count: 890,
      is_featured: true
    },
    {
      name: "Women in African Tech",
      description: "Empowering African women in technology through mentorship, networking, and career advancement.",
      category: "Technology",
      member_count: 650,
      is_featured: false
    },
    {
      name: "African Healthcare Innovation",
      description: "Advancing healthcare solutions and medical innovation across the African continent.",
      category: "Healthcare",
      member_count: 420,
      is_featured: false
    },
    {
      name: "Sustainable Energy Africa",
      description: "Promoting renewable energy and sustainable development across African communities.",
      category: "Energy",
      member_count: 380,
      is_featured: false
    },
    {
      name: "African Creative Industries",
      description: "Supporting artists, designers, and creative professionals in the African diaspora.",
      category: "Creative",
      member_count: 720,
      is_featured: false
    },
    {
      name: "Financial Inclusion Africa",
      description: "Driving financial technology and inclusion initiatives across African markets.",
      category: "Finance",
      member_count: 540,
      is_featured: true
    },
    {
      name: "African Agriculture Tech",
      description: "Modernizing agriculture through technology and sustainable farming practices.",
      category: "Agriculture",
      member_count: 310,
      is_featured: false
    },
    {
      name: "Pan-African Researchers",
      description: "Academic and industry researchers collaborating on African development challenges.",
      category: "Research",
      member_count: 280,
      is_featured: false
    },
    {
      name: "African Youth Development",
      description: "Mentoring and supporting the next generation of African leaders and innovators.",
      category: "Education",
      member_count: 950,
      is_featured: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('communities')
      .insert(communities)
      .select();

    if (error) {
      console.error('Error seeding communities:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length || 0} communities`);
    return data;
  } catch (error) {
    console.error('Failed to seed communities:', error);
    throw error;
  }
};

export const seedEvents = async () => {
  const events = [
    {
      title: "African Tech Summit 2024",
      description: "The premier technology conference bringing together African innovators from around the world.",
      type: "Conference",
      date_time: new Date('2024-07-15T09:00:00Z').toISOString(),
      location: "London, UK",
      is_virtual: false,
      attendee_count: 500,
      max_attendees: 800,
      is_featured: true,
      registration_url: "https://africantechsummit.com/register"
    },
    {
      title: "Diaspora Investment Webinar",
      description: "Learn about investment opportunities in African startups and emerging markets.",
      type: "Webinar",
      date_time: new Date('2024-06-20T18:00:00Z').toISOString(),
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 250,
      max_attendees: 500,
      is_featured: true,
      registration_url: "https://diasporainvestment.com/webinar"
    },
    {
      title: "Women in Tech Leadership Workshop",
      description: "Empowering African women in technology with leadership skills and networking opportunities.",
      type: "Workshop",
      date_time: new Date('2024-06-25T14:00:00Z').toISOString(),
      location: "Toronto, Canada",
      is_virtual: false,
      attendee_count: 80,
      max_attendees: 100,
      is_featured: false,
      registration_url: "https://womenintechleadership.com"
    },
    {
      title: "Sustainable Energy Solutions Meetup",
      description: "Discussing renewable energy innovations and sustainable development in Africa.",
      type: "Meetup",
      date_time: new Date('2024-07-05T19:00:00Z').toISOString(),
      location: "Berlin, Germany",
      is_virtual: false,
      attendee_count: 45,
      max_attendees: 60,
      is_featured: false,
      registration_url: "https://sustainableenergymeetup.com"
    },
    {
      title: "HealthTech Innovation Forum",
      description: "Exploring digital health solutions and medical technology for African healthcare.",
      type: "Forum",
      date_time: new Date('2024-08-10T10:00:00Z').toISOString(),
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 180,
      max_attendees: 300,
      is_featured: true,
      registration_url: "https://healthtechinnovation.com"
    },
    {
      title: "African Entrepreneurship Bootcamp",
      description: "Intensive training for African entrepreneurs looking to scale their businesses globally.",
      type: "Bootcamp",
      date_time: new Date('2024-09-15T09:00:00Z').toISOString(),
      location: "Paris, France",
      is_virtual: false,
      attendee_count: 30,
      max_attendees: 40,
      is_featured: false,
      registration_url: "https://entrepreneurshipbootcamp.com"
    },
    {
      title: "Financial Inclusion Summit",
      description: "Advancing financial technology and inclusion across African markets.",
      type: "Summit",
      date_time: new Date('2024-08-22T11:00:00Z').toISOString(),
      location: "Dubai, UAE",
      is_virtual: false,
      attendee_count: 300,
      max_attendees: 500,
      is_featured: true,
      registration_url: "https://financialinclusionsummit.com"
    },
    {
      title: "AgriTech Innovation Workshop",
      description: "Modernizing African agriculture through technology and innovation.",
      type: "Workshop",
      date_time: new Date('2024-07-30T15:00:00Z').toISOString(),
      location: "Virtual Event",
      is_virtual: true,
      attendee_count: 120,
      max_attendees: 200,
      is_featured: false,
      registration_url: "https://agritechinnovation.com"
    },
    {
      title: "Creative Industries Networking Night",
      description: "Connecting African creatives, artists, and designers in the diaspora.",
      type: "Networking",
      date_time: new Date('2024-06-28T18:30:00Z').toISOString(),
      location: "New York, USA",
      is_virtual: false,
      attendee_count: 75,
      max_attendees: 100,
      is_featured: false,
      registration_url: "https://creativenetworking.com"
    },
    {
      title: "Youth Leadership Development Conference",
      description: "Developing the next generation of African leaders and change-makers.",
      type: "Conference",
      date_time: new Date('2024-09-05T09:00:00Z').toISOString(),
      location: "Amsterdam, Netherlands",
      is_virtual: false,
      attendee_count: 200,
      max_attendees: 350,
      is_featured: true,
      registration_url: "https://youthleadership.com"
    }
  ];

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (error) {
      console.error('Error seeding events:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data?.length || 0} events`);
    return data;
  } catch (error) {
    console.error('Failed to seed events:', error);
    throw error;
  }
};
