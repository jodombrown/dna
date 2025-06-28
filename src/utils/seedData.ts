
import { supabase } from '@/integrations/supabase/client';

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
