import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log('🌱 Starting DNA platform seeding...');

  try {
    // First, create some test profiles (these would normally be created via auth signup)
    const profiles = [
      {
        id: 'user-1',
        email: 'amara@example.com',
        full_name: 'Amara Okafor',
        display_name: 'Amara Okafor',
        bio: 'Fintech entrepreneur focused on rural financial inclusion across West Africa.',
        location: 'Lagos, Nigeria',
        country_of_origin: 'Nigeria',
        current_country: 'Nigeria',
        diaspora_networks: ['Nigeria', 'West Africa'],
        professional_sectors: ['Fintech', 'Financial Services'],
        skills: ['Mobile Payments', 'Financial Inclusion', 'Product Strategy'],
        interests: ['Rural Development', 'Digital Banking', 'Microfinance'],
        is_public: true,
        is_seeded: true
      },
      {
        id: 'user-2',
        email: 'kwame@example.com',
        full_name: 'Kwame Asante',
        display_name: 'Kwame Asante',
        bio: 'Tech event organizer and community builder connecting African tech talent globally.',
        location: 'Toronto, Canada',
        country_of_origin: 'Ghana',
        current_country: 'Canada',
        diaspora_networks: ['Ghana', 'Canada'],
        professional_sectors: ['Technology', 'Event Management'],
        skills: ['Community Building', 'Event Planning', 'Network Development'],
        interests: ['Tech Events', 'Developer Communities', 'Pan-African Tech'],
        is_public: true,
        is_seeded: true
      },
      {
        id: 'user-3',
        email: 'fatima@example.com',
        full_name: 'Fatima Al-Rashid',
        display_name: 'Fatima Al-Rashid',
        bio: 'Renewable energy engineer working on sustainable power solutions for African communities.',
        location: 'Cairo, Egypt',
        country_of_origin: 'Egypt',
        current_country: 'Egypt',
        diaspora_networks: ['Egypt', 'North Africa'],
        professional_sectors: ['Renewable Energy', 'Engineering'],
        skills: ['Solar Engineering', 'Project Management', 'Sustainable Development'],
        interests: ['Clean Energy', 'Rural Electrification', 'Climate Solutions'],
        is_public: true,
        is_seeded: true
      },
      {
        id: 'user-4',
        email: 'david@example.com',
        full_name: 'David Mukasa',
        display_name: 'David Mukasa',
        bio: 'Software architect bridging tech talent between the diaspora and home countries.',
        location: 'London, UK',
        country_of_origin: 'Uganda',
        current_country: 'United Kingdom',
        diaspora_networks: ['Uganda', 'East Africa', 'UK'],
        professional_sectors: ['Software Development', 'Technology'],
        skills: ['Software Architecture', 'Team Leadership', 'Remote Collaboration'],
        interests: ['Tech Talent', 'Remote Work', 'Software Engineering'],
        is_public: true,
        is_seeded: true
      },
      {
        id: 'user-5',
        email: 'aisha@example.com',
        full_name: 'Aisha Diallo',
        display_name: 'Aisha Diallo',
        bio: 'EdTech innovator developing digital learning solutions for African students.',
        location: 'Dakar, Senegal',
        country_of_origin: 'Senegal',
        current_country: 'Senegal',
        diaspora_networks: ['Senegal', 'West Africa'],
        professional_sectors: ['Education Technology', 'Software Development'],
        skills: ['EdTech', 'Mobile App Development', 'User Experience Design'],
        interests: ['Digital Education', 'Youth Development', 'Language Learning'],
        is_public: true,
        is_seeded: true
      }
    ];

    console.log('📝 Inserting profiles...');
    await supabase.from('profiles').insert(profiles);

    // Posts
    const posts = [
      {
        author_id: 'user-1',
        content: "How can we drive fintech adoption in rural Africa? I've been working on mobile payment solutions and would love to hear from others in this space. What challenges are you seeing?",
        pillar: 'collaborate',
        post_type: 'text',
        tags: ['fintech', 'rural', 'mobile-payments'],
        visibility: 'public',
        is_seeded: true
      },
      {
        author_id: 'user-2',
        content: "Here's a visual recap of our Lagos tech summit! Amazing to see so many African tech leaders in one room. The energy was incredible! 🚀",
        pillar: 'connect',
        post_type: 'media',
        media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        tags: ['events', 'tech', 'lagos', 'networking'],
        visibility: 'public',
        is_seeded: true
      },
      {
        author_id: 'user-3',
        content: "Solar for Schools project update: We've successfully installed panels in 12 schools in Northern Ghana! The impact on learning hours has been remarkable. Next phase: 13 more schools. #SolarEnergy #Education",
        pillar: 'contribute',
        post_type: 'text',
        tags: ['solar', 'education', 'ghana', 'impact'],
        visibility: 'public',
        is_seeded: true
      },
      {
        author_id: 'user-4',
        content: 'Building the Diaspora Talent Bridge: Connecting software engineers in Toronto with startups in Rwanda. Remote collaboration is the future of African tech growth!',
        pillar: 'collaborate',
        post_type: 'text',
        tags: ['diaspora', 'tech-talent', 'remote-work', 'rwanda'],
        visibility: 'public',
        is_seeded: true
      },
      {
        author_id: 'user-5',
        content: 'Excited to announce our new EdTech platform for African students! Making quality education accessible through technology. Beta testing starts next month. Who wants to be part of the pilot program?',
        pillar: 'contribute',
        post_type: 'text',
        tags: ['edtech', 'education', 'beta', 'students'],
        visibility: 'public',
        is_seeded: true
      }
    ];

    console.log('📱 Inserting posts...');
    await supabase.from('posts').insert(posts);

    // Events
    const events = [
      {
        title: 'Diaspora Investor Roundtable',
        description: 'A virtual roundtable for Diaspora-based angel investors to discuss investment opportunities in African startups. Join us for insights on due diligence, market trends, and portfolio strategies.',
        location: 'Virtual (Zoom)',
        date_time: '2025-08-10T14:00:00Z',
        is_virtual: true,
        is_featured: true,
        type: 'roundtable',
        max_attendees: 50,
        created_by: 'user-1',
        is_seeded: true
      },
      {
        title: 'AfroTech Nairobi Meetup',
        description: 'Connect with tech leaders and Afro innovators in Nairobi. Networking session followed by panel discussions on the future of African tech ecosystems.',
        location: 'Nairobi Innovation Hub, Kenya',
        date_time: '2025-08-20T18:00:00Z',
        is_virtual: false,
        is_featured: true,
        type: 'meetup',
        max_attendees: 100,
        created_by: 'user-2',
        is_seeded: true
      },
      {
        title: 'Renewable Energy Summit',
        description: 'Annual summit focusing on renewable energy solutions for African communities. Featuring case studies, technical workshops, and funding opportunities.',
        location: 'Cape Town, South Africa',
        date_time: '2025-09-15T09:00:00Z',
        is_virtual: false,
        is_featured: true,
        type: 'summit',
        max_attendees: 200,
        created_by: 'user-3',
        is_seeded: true
      },
      {
        title: 'Remote Work for Africa Webinar',
        description: 'Learn how to build successful remote work partnerships between diaspora professionals and African companies. Tools, best practices, and legal considerations.',
        location: 'Virtual (Microsoft Teams)',
        date_time: '2025-08-25T16:00:00Z',
        is_virtual: true,
        type: 'webinar',
        max_attendees: 300,
        created_by: 'user-4',
        is_seeded: true
      },
      {
        title: 'EdTech Innovation Workshop',
        description: 'Hands-on workshop for educators and developers interested in creating digital learning solutions for African students. Bring your ideas!',
        location: 'Accra, Ghana',
        date_time: '2025-09-05T10:00:00Z',
        is_virtual: false,
        type: 'workshop',
        max_attendees: 75,
        created_by: 'user-5',
        is_seeded: true
      }
    ];

    console.log('📅 Inserting events...');
    await supabase.from('events').insert(events);

    // Contribution Cards (projects/initiatives)
    const contributionCards = [
      {
        title: 'Solar for Schools',
        description: 'Deploy solar panels to 25 schools in Northern Ghana to provide reliable electricity for extended learning hours and digital resources.',
        contribution_type: 'project',
        impact_area: 'Education & Energy',
        location: 'Northern Ghana',
        amount_needed: 50000,
        amount_raised: 28000,
        target_date: '2025-12-31',
        status: 'active',
        created_by: 'user-3',
        is_seeded: true
      },
      {
        title: 'Diaspora Talent Bridge',
        description: 'Platform connecting software engineers in the diaspora with startups and companies across Africa for remote collaboration and knowledge transfer.',
        contribution_type: 'platform',
        impact_area: 'Technology & Employment',
        location: 'Pan-African',
        amount_needed: 25000,
        amount_raised: 12000,
        target_date: '2025-10-31',
        status: 'active',
        created_by: 'user-4',
        is_seeded: true
      },
      {
        title: 'Rural Fintech Initiative',
        description: 'Mobile payment infrastructure and financial literacy programs for underbanked communities in rural West Africa.',
        contribution_type: 'initiative',
        impact_area: 'Financial Inclusion',
        location: 'West Africa',
        amount_needed: 75000,
        amount_raised: 45000,
        target_date: '2026-03-31',
        status: 'active',
        created_by: 'user-1',
        is_seeded: true
      },
      {
        title: 'Digital Learning Platform',
        description: 'Multilingual EdTech platform providing quality educational content for African students from primary to university level.',
        contribution_type: 'platform',
        impact_area: 'Education Technology',
        location: 'Pan-African',
        amount_needed: 40000,
        amount_raised: 18000,
        target_date: '2025-11-30',
        status: 'active',
        created_by: 'user-5',
        is_seeded: true
      },
      {
        title: 'Youth Innovation Fund',
        description: 'Micro-grants for young African entrepreneurs developing solutions to local challenges in their communities.',
        contribution_type: 'fund',
        impact_area: 'Entrepreneurship',
        location: 'Pan-African',
        amount_needed: 100000,
        amount_raised: 30000,
        target_date: '2025-12-31',
        status: 'active',
        created_by: 'user-2',
        is_seeded: true
      }
    ];

    console.log('💡 Inserting contribution cards...');
    await supabase.from('contribution_cards').insert(contributionCards);

    // Contact Requests (connections)
    const contactRequests = [
      {
        sender_id: 'user-1',
        receiver_id: 'user-2',
        purpose: 'collaboration',
        message: 'Would love to discuss potential collaboration on financial inclusion initiatives for rural communities.',
        status: 'accepted',
        is_seeded: true
      },
      {
        sender_id: 'user-3',
        receiver_id: 'user-1',
        purpose: 'collaboration',
        message: 'Interested in exploring synergies between renewable energy access and fintech solutions.',
        status: 'accepted',
        is_seeded: true
      },
      {
        sender_id: 'user-4',
        receiver_id: 'user-5',
        purpose: 'collaboration',
        message: "Your EdTech work aligns perfectly with our talent bridge initiative. Let's connect!",
        status: 'accepted',
        is_seeded: true
      },
      {
        sender_id: 'user-2',
        receiver_id: 'user-3',
        purpose: 'networking',
        message: 'Would like to invite you to speak at our next tech event about renewable energy innovation.',
        status: 'pending',
        is_seeded: true
      },
      {
        sender_id: 'user-5',
        receiver_id: 'user-1',
        purpose: 'learning',
        message: 'Interested in learning more about fintech payment systems for educational platforms.',
        status: 'accepted',
        is_seeded: true
      }
    ];

    console.log('🤝 Inserting contact requests...');
    await supabase.from('contact_requests').insert(contactRequests);

    // Comments on posts
    const comments = [
      {
        post_id: posts[0].author_id, // This would need to be the actual post ID
        author_id: 'user-2',
        content: "Great question! In Ghana, we've seen success with USSD-based solutions that work on basic feature phones.",
        is_seeded: true
      },
      {
        post_id: posts[2].author_id, // This would need to be the actual post ID  
        author_id: 'user-1',
        content: 'Amazing impact! Have you considered integrating mobile payment systems for school fees in these communities?',
        is_seeded: true
      },
      {
        post_id: posts[4].author_id, // This would need to be the actual post ID
        author_id: 'user-4',
        content: 'This is exactly what we need! Our talent bridge platform could help provide technical mentorship for your beta testing.',
        is_seeded: true
      }
    ];

    // Note: We'd need to get the actual post IDs first before inserting comments
    // console.log('💬 Inserting comments...');
    // await supabase.from('comments').insert(comments);

    console.log('✅ DNA platform seeding complete!');
    console.log('📊 Summary:');
    console.log(`  • ${profiles.length} profiles created`);
    console.log(`  • ${posts.length} posts created`);
    console.log(`  • ${events.length} events created`);
    console.log(`  • ${contributionCards.length} contribution cards created`);
    console.log(`  • ${contactRequests.length} contact requests created`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run the seeding script
if (require.main === module) {
  seed().catch(console.error);
}

export { seed };