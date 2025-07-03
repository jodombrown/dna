import { supabase } from '@/integrations/supabase/client';

// Realistic African diaspora names and data
const firstNames = [
  'Amara', 'Kwame', 'Zara', 'Obi', 'Nkem', 'Asha', 'Tunde', 'Kemi', 'Yemi', 'Efe',
  'Adanna', 'Kofi', 'Nia', 'Taiwo', 'Folake', 'Emeka', 'Amina', 'Seun', 'Damilola', 'Chinwe'
];

const lastNames = [
  'Okafor', 'Johnson', 'Williams', 'Adebayo', 'Okoye', 'Mensah', 'Asante', 'Kone', 'Diallo', 'Mwangi',
  'Otieno', 'Lubanga', 'Banda', 'Phiri', 'Tembo', 'Nkomo', 'Chikwanha', 'Moyo', 'Sibanda', 'Dube'
];

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 
  'Senegal', 'Ivory Coast', 'Cameroon', 'Botswana', 'Zambia', 'Zimbabwe', 'Mali'
];

const cities = [
  'Lagos', 'Accra', 'Nairobi', 'Cape Town', 'Kampala', 'Dar es Salaam', 'Kigali', 'Addis Ababa',
  'Dakar', 'Abidjan', 'Yaoundé', 'Gaborone', 'Lusaka', 'Harare', 'Bamako', 'London', 'New York',
  'Toronto', 'Berlin', 'Paris', 'Dubai', 'Atlanta', 'Houston', 'Los Angeles', 'Washington DC'
];

const professions = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager',
  'Financial Analyst', 'Consultant', 'Entrepreneur', 'Doctor', 'Lawyer', 'Teacher', 'Researcher',
  'Journalist', 'Artist', 'NGO Director', 'Investment Banker', 'Architect', 'Civil Engineer'
];

const companies = [
  'Flutterwave', 'Andela', 'Paystack', 'Jumia', 'Konga', 'Interswitch', 'Cowrywise', 'PiggyVest',
  'Seamfix', 'SystemSpecs', 'Microsoft', 'Google', 'Meta', 'Amazon', 'McKinsey', 'Deloitte',
  'PwC', 'KPMG', 'World Bank', 'African Development Bank', 'UN', 'UNICEF'
];

const tags = [
  'tech', 'fintech', 'startup', 'healthcare', 'education', 'agriculture', 'climate', 'finance',
  'innovation', 'ai', 'blockchain', 'mobile-money', 'e-commerce', 'logistics', 'renewable-energy',
  'youth-development', 'women-empowerment', 'entrepreneurship', 'digital-transformation', 'sustainability'
];

const impactAreas = [
  'Education & Skills Development', 'Healthcare Innovation', 'Financial Inclusion', 
  'Climate & Environment', 'Youth Empowerment', 'Women in Tech', 'Agricultural Technology',
  'Digital Infrastructure', 'Entrepreneurship', 'Cultural Preservation'
];

const avatarImages = [
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  'https://images.unsplash.com/photo-1472396961693-142e6e269027',
  'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
  'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'
];

const postImages = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  'https://images.unsplash.com/photo-1721322800607-8c38375eef04'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(daysAgo: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

export async function seedDemoData() {
  console.log('Starting data seeding...');
  
  try {
    // 1. Create demo users with different roles
    const demoUsers = [];
    for (let i = 0; i < 15; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      
      // Assign roles
      let userRole = 'user';
      if (i === 0) userRole = 'admin';
      else if (i <= 2) userRole = 'moderator';
      else if (i <= 5) userRole = 'organization';

      const user = {
        email,
        full_name: fullName,
        display_name: fullName,
        bio: `${getRandomElement(professions)} passionate about ${getRandomElement(impactAreas)} in Africa.`,
        location: `${getRandomElement(cities)}, ${getRandomElement(countries)}`,
        profession: getRandomElement(professions),
        company: getRandomElement(companies),
        avatar_url: getRandomElement(avatarImages),
        user_role: userRole,
        skills: getRandomElements(tags, 3),
        interests: getRandomElements(tags, 4),
        interest_tags: getRandomElements(tags, 3),
        current_country: getRandomElement(countries),
        is_public: true,
        onboarding_completed_at: getRandomDate(90),
        created_at: getRandomDate(90),
        updated_at: getRandomDate(30)
      };
      
      demoUsers.push(user);
    }

    // Insert users
    const { data: insertedUsers, error: usersError } = await supabase
      .from('profiles')
      .insert(demoUsers)
      .select();

    if (usersError) throw usersError;
    console.log(`✓ Created ${insertedUsers.length} demo users`);

    // 2. Create verified organizations
    const organizations = [
      {
        name: 'AfriTech Foundation',
        description: 'Empowering African youth through technology education and innovation.',
        website_url: 'https://afritech.org',
        contact_email: 'contact@afritech.org',
        verification_status: 'approved',
        verified_at: getRandomDate(60),
        created_by: insertedUsers[1].id,
        logo_url: getRandomElement(avatarImages)
      },
      {
        name: 'Diaspora Investment Network',
        description: 'Connecting African diaspora investors with high-impact opportunities.',
        website_url: 'https://diasporainvest.com',
        contact_email: 'hello@diasporainvest.com',
        verification_status: 'approved',
        verified_at: getRandomDate(45),
        created_by: insertedUsers[2].id,
        logo_url: getRandomElement(avatarImages)
      },
      {
        name: 'GreenAfrica Initiative',
        description: 'Promoting sustainable development and climate solutions across Africa.',
        website_url: 'https://greenafrica.org',
        contact_email: 'info@greenafrica.org',
        verification_status: 'approved',
        verified_at: getRandomDate(30),
        created_by: insertedUsers[3].id,
        logo_url: getRandomElement(avatarImages)
      }
    ];

    const { data: insertedOrgs, error: orgsError } = await supabase
      .from('organizations')
      .insert(organizations)
      .select();

    if (orgsError) throw orgsError;
    console.log(`✓ Created ${insertedOrgs.length} verified organizations`);

    // 3. Create posts
    const posts = [];
    for (let i = 0; i < 20; i++) {
      const author = getRandomElement(insertedUsers);
      const postTags = getRandomElements(tags, 2);
      
      const postContents = [
        `Just launched a new fintech solution that will revolutionize mobile payments in Africa! 🚀 #${postTags[0]} #${postTags[1]}`,
        `Attended an amazing conference on African innovation today. The future is bright! ✨`,
        `Looking for partnerships in the renewable energy space. Let's build a sustainable Africa together 🌱`,
        `Proud to announce our expansion into 3 new African markets this quarter! 📈`,
        `The youth are the backbone of Africa's digital transformation. Investing in education is key 🎓`,
        `Building bridges between diaspora communities and local entrepreneurs 🌍`,
        `Climate tech is the future - excited about new opportunities in this space 🌿`,
        `Just completed my MBA and ready to contribute to Africa's growth story! 💪`,
        `Women in tech are changing the narrative. Proud to be part of this movement 👩‍💻`,
        `AgriTech solutions can feed Africa and create millions of jobs. Who's with me? 🌾`
      ];

      posts.push({
        user_id: author.id,
        content: getRandomElement(postContents),
        hashtags: postTags,
        image_url: Math.random() > 0.6 ? getRandomElement(postImages) : null,
        likes_count: Math.floor(Math.random() * 50),
        comments_count: Math.floor(Math.random() * 15),
        shares_count: Math.floor(Math.random() * 10),
        created_at: getRandomDate(30),
        updated_at: getRandomDate(30)
      });
    }

    const { data: insertedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(posts)
      .select();

    if (postsError) throw postsError;
    console.log(`✓ Created ${insertedPosts.length} posts`);

    // 4. Create events
    const events = [
      {
        title: 'African Diaspora Tech Summit 2025',
        description: 'Connecting African tech professionals worldwide for innovation and collaboration.',
        date_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Lagos, Nigeria',
        is_virtual: false,
        max_attendees: 500,
        created_by: insertedUsers[0].id,
        image_url: getRandomElement(postImages)
      },
      {
        title: 'Fintech Innovation Workshop',
        description: 'Exploring the future of financial services in Africa.',
        date_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Virtual',
        is_virtual: true,
        max_attendees: 200,
        created_by: insertedUsers[1].id,
        image_url: getRandomElement(postImages)
      },
      {
        title: 'Climate Tech Hackathon',
        description: '48-hour hackathon to build solutions for climate challenges.',
        date_time: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Nairobi, Kenya',
        is_virtual: false,
        max_attendees: 100,
        created_by: insertedUsers[2].id,
        image_url: getRandomElement(postImages)
      },
      {
        title: 'Women in Tech Networking',
        description: 'Empowering African women in technology and entrepreneurship.',
        date_time: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Accra, Ghana',
        is_virtual: false,
        max_attendees: 150,
        created_by: insertedUsers[3].id,
        image_url: getRandomElement(postImages)
      },
      {
        title: 'Diaspora Investment Forum',
        description: 'Connecting diaspora investors with African startups.',
        date_time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Virtual',
        is_virtual: true,
        max_attendees: 300,
        created_by: insertedUsers[4].id,
        image_url: getRandomElement(postImages)
      }
    ];

    const { data: insertedEvents, error: eventsError } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (eventsError) throw eventsError;
    console.log(`✓ Created ${insertedEvents.length} events`);

    // 5. Create job posts
    const jobPosts = [
      {
        title: 'Senior Software Engineer',
        company: 'AfriTech Foundation',
        description: 'Build scalable solutions for African tech education platform.',
        location: 'Lagos, Nigeria (Remote friendly)',
        job_type: 'full-time',
        salary_range: '$60,000 - $90,000',
        tags: ['react', 'nodejs', 'typescript', 'aws'],
        posted_by: insertedUsers[0].id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Product Manager',
        company: 'Diaspora Investment Network',
        description: 'Lead product strategy for diaspora investment platform.',
        location: 'Nairobi, Kenya',
        job_type: 'full-time',
        salary_range: '$70,000 - $100,000',
        tags: ['product-management', 'fintech', 'strategy'],
        posted_by: insertedUsers[1].id,
        expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Climate Tech Researcher',
        company: 'GreenAfrica Initiative',
        description: 'Research and develop climate solutions for African markets.',
        location: 'Cape Town, South Africa',
        job_type: 'full-time',
        salary_range: '$50,000 - $75,000',
        tags: ['research', 'climate-tech', 'sustainability'],
        posted_by: insertedUsers[2].id,
        expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'UX Designer',
        company: 'AfriTech Foundation',
        description: 'Design user experiences for African-focused tech products.',
        location: 'Remote',
        job_type: 'contract',
        salary_range: '$40,000 - $65,000',
        tags: ['ux-design', 'figma', 'user-research'],
        posted_by: insertedUsers[3].id,
        expires_at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Data Scientist',
        company: 'Diaspora Investment Network',
        description: 'Analyze investment patterns and market opportunities.',
        location: 'Accra, Ghana',
        job_type: 'full-time',
        salary_range: '$65,000 - $95,000',
        tags: ['python', 'machine-learning', 'data-analysis'],
        posted_by: insertedUsers[4].id,
        expires_at: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: insertedJobs, error: jobsError } = await supabase
      .from('job_posts')
      .insert(jobPosts)
      .select();

    if (jobsError) throw jobsError;
    console.log(`✓ Created ${insertedJobs.length} job posts`);

    // 6. Create initiatives
    const initiatives = [
      {
        title: 'Code for Africa Bootcamp',
        description: 'Free coding bootcamp for African youth to learn software development.',
        impact_area: 'Education & Skills Development',
        creator_id: insertedUsers[0].id
      },
      {
        title: 'Green Energy for Rural Communities',
        description: 'Bringing solar power to remote African villages.',
        impact_area: 'Climate & Environment',
        creator_id: insertedUsers[1].id
      },
      {
        title: 'African Women Entrepreneurs Fund',
        description: 'Microcredit program for women-owned businesses.',
        impact_area: 'Women Empowerment',
        creator_id: insertedUsers[2].id
      },
      {
        title: 'Digital Health Network',
        description: 'Telemedicine platform for underserved communities.',
        impact_area: 'Healthcare Innovation',
        creator_id: insertedUsers[3].id
      },
      {
        title: 'Agricultural Technology Hub',
        description: 'Innovation center for smart farming solutions.',
        impact_area: 'Agricultural Technology',
        creator_id: insertedUsers[4].id
      }
    ];

    const { data: insertedInitiatives, error: initiativesError } = await supabase
      .from('initiatives')
      .insert(initiatives)
      .select();

    if (initiativesError) throw initiativesError;
    console.log(`✓ Created ${insertedInitiatives.length} initiatives`);

    // 7. Create newsletters
    const newsletters = [
      {
        title: 'African Tech Weekly',
        summary: 'Latest developments in African technology ecosystem.',
        content: 'This week in African tech: Major funding rounds, new startup launches, and policy updates affecting the tech landscape across the continent.',
        category: 'Africa Tech',
        tags: ['tech', 'startups', 'funding'],
        featured_image_url: getRandomElement(postImages),
        is_published: true,
        publication_date: getRandomDate(7),
        created_by: insertedUsers[0].id
      },
      {
        title: 'Diaspora Investment Insights',
        summary: 'Investment opportunities and market analysis for diaspora investors.',
        content: 'Market analysis shows increasing opportunities in fintech, agritech, and renewable energy sectors across African markets.',
        category: 'Business & Finance',
        tags: ['investment', 'diaspora', 'markets'],
        featured_image_url: getRandomElement(postImages),
        is_published: true,
        publication_date: getRandomDate(14),
        created_by: insertedUsers[1].id
      },
      {
        title: 'Climate Solutions Africa',
        summary: 'Sustainable development and climate action updates.',
        content: 'Highlighting innovative climate solutions being developed across Africa and opportunities for collaboration.',
        category: 'Environment',
        tags: ['climate', 'sustainability', 'innovation'],
        featured_image_url: getRandomElement(postImages),
        is_published: true,
        publication_date: getRandomDate(21),
        created_by: insertedUsers[2].id
      },
      {
        title: 'Women in African Business',
        summary: 'Stories and insights from women entrepreneurs across Africa.',
        content: 'Celebrating the achievements of women entrepreneurs and exploring challenges and opportunities in various sectors.',
        category: 'Diaspora Stories',
        tags: ['women', 'entrepreneurship', 'business'],
        featured_image_url: getRandomElement(postImages),
        is_published: true,
        publication_date: getRandomDate(28),
        created_by: insertedUsers[3].id
      },
      {
        title: 'Youth Innovation Spotlight',
        summary: 'Showcasing young African innovators and their projects.',
        content: 'This month we highlight young innovators who are solving local problems with technology and creativity.',
        category: 'Innovation',
        tags: ['youth', 'innovation', 'technology'],
        featured_image_url: getRandomElement(postImages),
        is_published: false,
        created_by: insertedUsers[4].id
      }
    ];

    const { data: insertedNewsletters, error: newslettersError } = await supabase
      .from('newsletters')
      .insert(newsletters)
      .select();

    if (newslettersError) throw newslettersError;
    console.log(`✓ Created ${insertedNewsletters.length} newsletters`);

    // 8. Create contributions
    const contributions = [];
    for (let i = 0; i < 15; i++) {
      const user = getRandomElement(insertedUsers);
      const types = ['post', 'event', 'job', 'initiative', 'newsletter'];
      const type = getRandomElement(types);
      
      let target_id, target_title;
      switch (type) {
        case 'post':
          const post = getRandomElement(insertedPosts);
          target_id = post.id;
          target_title = 'Social Post';
          break;
        case 'event':
          const event = getRandomElement(insertedEvents);
          target_id = event.id;
          target_title = event.title;
          break;
        case 'job':
          const job = getRandomElement(insertedJobs);
          target_id = job.id;
          target_title = job.title;
          break;
        case 'initiative':
          const initiative = getRandomElement(insertedInitiatives);
          target_id = initiative.id;
          target_title = initiative.title;
          break;
        case 'newsletter':
          const newsletter = getRandomElement(insertedNewsletters);
          target_id = newsletter.id;
          target_title = newsletter.title;
          break;
      }

      contributions.push({
        user_id: user.id,
        type,
        target_id,
        target_title,
        created_at: getRandomDate(60)
      });
    }

    const { data: insertedContributions, error: contributionsError } = await supabase
      .from('contributions')
      .insert(contributions)
      .select();

    if (contributionsError) throw contributionsError;
    console.log(`✓ Created ${insertedContributions.length} contributions`);

    // 9. Create some follows
    const follows = [];
    for (let i = 0; i < 20; i++) {
      const follower = getRandomElement(insertedUsers);
      const target = getRandomElement(insertedUsers);
      
      if (follower.id !== target.id) {
        follows.push({
          follower_id: follower.id,
          target_type: 'user',
          target_id: target.id
        });
      }
    }

    const { data: insertedFollows, error: followsError } = await supabase
      .from('follows')
      .insert(follows)
      .select();

    if (followsError) throw followsError;
    console.log(`✓ Created ${insertedFollows.length} follows`);

    // 10. Create saved items
    const savedItems = [];
    for (let i = 0; i < 10; i++) {
      const user = getRandomElement(insertedUsers);
      const types = ['post', 'event', 'job', 'initiative'];
      const type = getRandomElement(types);
      
      let target_id;
      switch (type) {
        case 'post':
          target_id = getRandomElement(insertedPosts).id;
          break;
        case 'event':
          target_id = getRandomElement(insertedEvents).id;
          break;
        case 'job':
          target_id = getRandomElement(insertedJobs).id;
          break;
        case 'initiative':
          target_id = getRandomElement(insertedInitiatives).id;
          break;
      }

      savedItems.push({
        user_id: user.id,
        target_type: type,
        target_id
      });
    }

    const { data: insertedSavedItems, error: savedItemsError } = await supabase
      .from('saved_items')
      .insert(savedItems)
      .select();

    if (savedItemsError) throw savedItemsError;
    console.log(`✓ Created ${insertedSavedItems.length} saved items`);

    console.log('🎉 Demo data seeding completed successfully!');
    
    return {
      users: insertedUsers.length,
      organizations: insertedOrgs.length,
      posts: insertedPosts.length,
      events: insertedEvents.length,
      jobs: insertedJobs.length,
      initiatives: insertedInitiatives.length,
      newsletters: insertedNewsletters.length,
      contributions: insertedContributions.length,
      follows: insertedFollows.length,
      savedItems: insertedSavedItems.length
    };

  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

export async function clearDemoData() {
  console.log('Clearing demo data...');
  
  try {
    // Clear in reverse order to handle dependencies
    await supabase.from('saved_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('follows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('contributions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('newsletters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('initiatives').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('job_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('organization_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().like('email', '%@example.com');
    
    console.log('✓ Demo data cleared successfully');
  } catch (error) {
    console.error('Error clearing demo data:', error);
    throw error;
  }
}