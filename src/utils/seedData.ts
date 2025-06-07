
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
      bio: "Leading fintech innovation across Africa and Europe. Former Goldman Sachs VP turned entrepreneur.",
      years_experience: 12,
      education: "PhD Computer Science, MIT",
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
      bio: "Pioneering sustainable agriculture solutions for smallholder farmers across West Africa.",
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
      bio: "Building digital health solutions to improve healthcare access in rural Africa.",
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
      bio: "Developing off-grid solar solutions for rural communities across the Sahel region.",
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
      bio: "Leading AI research with focus on applications for African languages and contexts.",
      years_experience: 7,
      education: "PhD Computer Science, Oxford University",
      languages: ["Arabic", "French", "English"],
      availability_for: ["Research Collaboration", "Mentorship", "Speaking"],
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false
    }
    // Adding 45 more professionals to reach 50 total
  ];

  // Add 45 more professionals with varying backgrounds
  const additionalProfessionals = Array.from({ length: 45 }, (_, index) => {
    const names = [
      "Chike Okwu", "Amina Hassan", "Kofi Mensah", "Zara Kimani", "Mamadou Traore",
      "Aisha Bello", "Tunde Adebayo", "Fatouma Diop", "Yemi Adeyemi", "Khadija Noor",
      "Bola Ogundipe", "Aminata Kone", "Emeka Okonkwo", "Safiya Umar", "Kwesi Boateng",
      "Mariam Sesay", "Joseph Mbeki", "Halima Yusuf", "Victor Nkomo", "Aishah Rahman",
      "Samuel Gyamfi", "Naima Osman", "Collins Mutua", "Zahra Benali", "Godwin Achebe",
      "Maryam Suleiman", "Peter Osei", "Kadiatou Barry", "Francis Maina", "Layla Farah",
      "Emmanuel Asante", "Rukayya Garba", "Michael Ochieng", "Yasmin Abdullahi", "Daniel Opoku",
      "Salamatu Jalloh", "Richard Agyei", "Aminata Diallo", "Philip Wambua", "Fatou Ndiaye",
      "Isaac Akoto", "Habiba Moussa", "George Mutindi", "Aicha Toure", "Anthony Mensah"
    ];

    const professions = [
      "Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "Marketing Director",
      "Business Analyst", "Operations Manager", "Sales Director", "HR Manager", "Finance Manager",
      "Legal Advisor", "Project Manager", "Consultant", "Entrepreneur", "Academic Researcher"
    ];

    const companies = [
      "Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix", "Spotify", "Uber", "Airbnb",
      "McKinsey", "BCG", "Deloitte", "PwC", "JP Morgan", "Goldman Sachs", "Standard Chartered",
      "Barclays", "Vodafone", "MTN", "Safaricom", "African Development Bank", "World Bank",
      "UN", "WHO", "USAID", "African Union", "Startup Incubator", "VC Fund", "Tech Accelerator"
    ];

    const locations = [
      "London, UK", "New York, USA", "Toronto, Canada", "Berlin, Germany", "Paris, France",
      "Dubai, UAE", "Singapore", "Sydney, Australia", "Amsterdam, Netherlands", "Stockholm, Sweden"
    ];

    const countries = [
      "Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "Uganda", "Tanzania", "Rwanda",
      "Senegal", "Morocco", "Egypt", "Tunisia", "Algeria", "Cameroon", "Ivory Coast"
    ];

    const expertiseOptions = [
      ["Software Development", "Cloud Computing", "DevOps"],
      ["Data Science", "Machine Learning", "Analytics"],
      ["Digital Marketing", "Brand Strategy", "Growth Hacking"],
      ["Product Strategy", "User Research", "Agile"],
      ["Financial Analysis", "Risk Management", "Investment"],
      ["Operations", "Supply Chain", "Logistics"],
      ["Human Resources", "Talent Acquisition", "Leadership"],
      ["Legal", "Compliance", "Corporate Law"],
      ["Healthcare", "Public Health", "Medical Research"],
      ["Education", "Training", "Curriculum Development"]
    ];

    return {
      full_name: names[index % names.length],
      profession: professions[index % professions.length],
      company: companies[index % companies.length],
      location: locations[index % locations.length],
      country_of_origin: countries[index % countries.length],
      expertise: expertiseOptions[index % expertiseOptions.length],
      bio: `Experienced professional with ${5 + (index % 15)} years in the industry. Passionate about driving innovation and creating impact.`,
      years_experience: 5 + (index % 15),
      education: "University Graduate",
      languages: ["English"],
      availability_for: index % 3 === 0 ? ["Mentorship"] : index % 3 === 1 ? ["Collaboration"] : ["Consulting"],
      is_mentor: index % 4 === 0,
      is_investor: index % 6 === 0,
      looking_for_opportunities: index % 3 === 0
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
