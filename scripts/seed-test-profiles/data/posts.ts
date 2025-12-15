/**
 * DNA Platform - Test Posts Data
 *
 * Multiple posts per profile including:
 * - Text posts (updates, questions, celebrations)
 * - Image posts
 * - Video posts
 * - Link posts
 *
 * NON-PRODUCTION: All posts marked with is_seeded = true
 */

import { TEST_PROFILE_IDS } from '../constants';

// Sample image URLs for posts
const POST_IMAGES = {
  FINTECH_TEAM: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
  FINTECH_APP: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
  SOLAR_PANELS: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  LAB_WORK: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
  ART_GALLERY: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop',
  AFRICAN_ART: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop',
  HEALTH_CLINIC: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
  TELEMEDICINE: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
  CLASSROOM: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
  STUDENTS: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
  CONFERENCE: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
};

export interface TestPost {
  author_id: string;
  content: string;
  post_type: string;
  privacy_level: string;
  image_url?: string;
  link_url?: string;
  link_title?: string;
  link_description?: string;
  link_metadata?: Record<string, unknown>;
  is_seeded: boolean;
}

export const testPosts: TestPost[] = [
  // ============================================================
  // AMARA OKONKWO (Fintech) - 5 Posts
  // ============================================================

  // Post 1: Text update (celebration)
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    content: `Just closed our Series A! We raised $12M to scale AfriPay across West Africa.

This funding will help us:
- Expand to 5 new countries
- Reduce remittance fees to under 1%
- Launch our micro-investment feature

Grateful to our investors who believe in financial inclusion for African communities. The journey continues!

#Fintech #AfricanInnovation #SeriesA`,
    post_type: 'celebration',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 2: Image post
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    content: `The team that's making it happen! So proud of this incredible group of talented Africans building the future of financial services.

Our Lagos office just hit 50 team members, and we're hiring across engineering, product, and operations. If you're passionate about fintech and financial inclusion, let's talk!`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.FINTECH_TEAM,
    is_seeded: true,
  },

  // Post 3: Link post
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    content: `Honored to be featured in TechCrunch's coverage of African fintech startups to watch. The article highlights how diaspora-led startups are transforming financial services across the continent.

Read the full article here:`,
    post_type: 'link',
    privacy_level: 'public',
    link_url: 'https://techcrunch.example.com/african-fintech-2024',
    link_title: 'African Fintech Startups to Watch in 2024',
    link_description: 'The next wave of innovation in African financial services is being led by diaspora entrepreneurs who understand both global best practices and local needs.',
    link_metadata: {
      provider_name: 'TechCrunch',
      is_video: false,
    },
    is_seeded: true,
  },

  // Post 4: Question/discussion post
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    content: `Question for the community: What's the biggest barrier to financial inclusion you've seen in your home country?

For us in Nigeria, it's been:
1. Lack of ID documentation
2. Low smartphone penetration in rural areas
3. Trust issues with digital platforms

Would love to hear from others working on this challenge. What solutions have worked in your context?`,
    post_type: 'question',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 5: Video post
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    content: `Watch our new explainer video on how AfriPay is making remittances easier and cheaper for African families.

Every year, Africans in the diaspora send over $50 billion home. Too much of that goes to fees. We're changing that.

Share this with someone who sends money home!`,
    post_type: 'video',
    privacy_level: 'public',
    link_url: 'https://www.youtube.com/watch?v=example-afripay',
    link_title: 'AfriPay - Remittances Made Simple',
    link_description: 'See how AfriPay is reducing remittance fees and helping African families receive more of the money sent by loved ones abroad.',
    link_metadata: {
      embed_type: 'video',
      provider_name: 'YouTube',
      is_video: true,
      thumbnail_url: POST_IMAGES.FINTECH_APP,
    },
    is_seeded: true,
  },

  // ============================================================
  // DR. KWAME ASANTE (Clean Energy) - 5 Posts
  // ============================================================

  // Post 1: Text update
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    content: `Published our latest research findings on solar panel efficiency in tropical climates!

Key highlights:
- 40% cost reduction while maintaining performance
- 25-year durability in high-humidity environments
- Optimized for off-grid rural installations

Paper is now available in Nature Energy. Happy to share insights with anyone working on renewable energy solutions for Africa.

#SolarEnergy #Research #CleanEnergy`,
    post_type: 'update',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 2: Image post
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    content: `Field installation day in Northern Ghana! Our team just completed installing solar panels at Tamale Community Health Center.

This installation will:
- Power essential medical equipment 24/7
- Enable cold chain storage for vaccines
- Reduce operating costs by 60%

12 more health facilities to go in this phase. The impact is real and measurable.`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.SOLAR_PANELS,
    is_seeded: true,
  },

  // Post 3: Link post
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    content: `Excited to announce our $5M Gates Foundation grant to scale solar solutions across Ghana and Kenya.

This three-year project will bring reliable electricity to:
- 50 rural health clinics
- 100 schools
- 500 small businesses

Read the press release:`,
    post_type: 'link',
    privacy_level: 'public',
    link_url: 'https://gatesfoundation.example.com/press/solar-africa',
    link_title: 'Gates Foundation Funds Solar Energy Project in Ghana and Kenya',
    link_description: 'New initiative aims to bring reliable, affordable solar power to rural communities across West and East Africa.',
    link_metadata: {
      provider_name: 'Gates Foundation',
      is_video: false,
    },
    is_seeded: true,
  },

  // Post 4: Question post
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    content: `Researchers and practitioners in the clean energy space - I'd love your input!

We're designing our next-gen solar controllers for rural Africa. What features would make the biggest difference?

Currently considering:
- Mobile money integration for pay-as-you-go
- Remote monitoring capabilities
- Multi-language interface
- Load balancing for community sharing

What else should we prioritize?`,
    post_type: 'question',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 5: Image post (lab)
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    content: `Late nights in the lab are worth it when you're working on something meaningful.

Testing our new solar cell design that could make solar energy even more accessible across Africa. Preliminary results are promising!

Big thanks to my research team and the interns from University of Ghana who joined us this summer.`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.LAB_WORK,
    is_seeded: true,
  },

  // ============================================================
  // FATIMA DIALLO (Culture) - 5 Posts
  // ============================================================

  // Post 1: Celebration post
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    content: `"Voices of the Diaspora" exhibition opening was a huge success!

Over 500 attendees came to celebrate African contemporary art at our Paris gallery. Featured works from 25 artists across 12 African countries.

Special thanks to everyone who made this possible. Art connects us to our roots and builds bridges across continents.

#AfricanArt #Diaspora #CulturalExchange`,
    post_type: 'celebration',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 2: Image post
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    content: `Behind the scenes at Afrique Moderne Gallery as we prepare for our upcoming exhibition.

Each piece tells a story of identity, heritage, and the evolving African narrative. Our artists are creating powerful works that challenge stereotypes and celebrate the richness of African culture.

Exhibition opens next Friday. Mark your calendars!`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.ART_GALLERY,
    is_seeded: true,
  },

  // Post 3: Video post
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    content: `Watch our documentary short: "The New African Renaissance"

We spent 6 months traveling across Senegal, Ghana, Nigeria, and South Africa documenting the explosion of contemporary African art.

This film features interviews with 15 artists who are redefining what African art means in the 21st century.`,
    post_type: 'video',
    privacy_level: 'public',
    link_url: 'https://vimeo.com/example-african-renaissance',
    link_title: 'The New African Renaissance - Documentary',
    link_description: 'A journey through the contemporary African art scene, featuring emerging and established artists across the continent.',
    link_metadata: {
      embed_type: 'video',
      provider_name: 'Vimeo',
      is_video: true,
      thumbnail_url: POST_IMAGES.AFRICAN_ART,
    },
    is_seeded: true,
  },

  // Post 4: Update post
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    content: `Announcing the African Creators Fund!

After 12 years in the art world, I'm launching an initiative to support emerging African artists with:
- $50,000 in annual grants
- 6-month mentorship programs
- Exhibition opportunities
- Business development training

Applications open next month. Share this with artists who might benefit!`,
    post_type: 'update',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 5: Link post
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    content: `Featured in Artnet News: "How Diaspora Gallerists Are Reshaping the African Art Market"

The article explores how galleries like Afrique Moderne are creating new pathways for African artists to reach global collectors.

African art sales grew 150% last year. We're just getting started!`,
    post_type: 'link',
    privacy_level: 'public',
    link_url: 'https://artnet.example.com/african-art-diaspora',
    link_title: 'Diaspora Gallerists Reshaping African Art Market',
    link_description: 'A new generation of galleries founded by African diaspora members is transforming how the world discovers and collects African contemporary art.',
    link_metadata: {
      provider_name: 'Artnet News',
      is_video: false,
    },
    is_seeded: true,
  },

  // ============================================================
  // DAVID MWANGI (Healthcare) - 5 Posts
  // ============================================================

  // Post 1: Update post
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    content: `Our telemedicine platform just reached a major milestone: 500 health facilities connected across Kenya, Uganda, and Tanzania!

Impact so far:
- 2 million patient consultations
- 30% reduction in referral delays
- 5,000 healthcare workers trained

Digital health is not the future - it's the present. And Africa is leading the way.

#DigitalHealth #Telemedicine #HealthcareInnovation`,
    post_type: 'update',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 2: Image post
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    content: `Visiting Kisumu County Hospital to see our telemedicine system in action.

This nurse is conducting a remote consultation with a specialist in Nairobi, helping a patient who would otherwise have to travel 6 hours for care.

Technology bringing healthcare to those who need it most.`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.TELEMEDICINE,
    is_seeded: true,
  },

  // Post 3: Question post
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    content: `Question for the healthcare innovation community:

What's the biggest challenge you face when implementing digital health solutions in African contexts?

We've encountered:
1. Internet connectivity issues
2. Power reliability
3. Healthcare worker digital literacy
4. Integration with existing systems

How have you addressed these? Looking for innovative solutions to share with our network.`,
    post_type: 'question',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 4: Link post
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    content: `Proud to share our latest research published in The Lancet Digital Health:

"Telemedicine in Rural East Africa: A Three-Year Impact Assessment"

Key finding: Telemedicine reduced maternal mortality by 30% in our pilot regions through early risk detection and specialist consultations.

Full paper available here:`,
    post_type: 'link',
    privacy_level: 'public',
    link_url: 'https://lancet.example.com/digital-health/telemedicine-africa',
    link_title: 'Telemedicine in Rural East Africa: Impact Assessment',
    link_description: 'A comprehensive study showing how telemedicine is transforming healthcare outcomes in underserved communities.',
    link_metadata: {
      provider_name: 'The Lancet',
      is_video: false,
    },
    is_seeded: true,
  },

  // Post 5: Image post
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    content: `Training day at Nakuru Rural Health Center!

Our team spent the week training 30 community health workers on using mobile health tools. These frontline workers are the backbone of African healthcare systems.

Investing in people is just as important as investing in technology.`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.HEALTH_CLINIC,
    is_seeded: true,
  },

  // ============================================================
  // ZARA TEMBA (Education) - 5 Posts
  // ============================================================

  // Post 1: Celebration post
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    content: `LearnAfrica just hit 2 MILLION students!!!

When I started this during the pandemic, I never imagined we'd reach so many learners. Now we're in:
- 10 African countries
- 500+ partner schools
- 12 languages

Every student deserves access to quality education. We're just getting started.

#EdTech #EducationForAll #AfricanInnovation`,
    post_type: 'celebration',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 2: Image post
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    content: `Visited one of our partner schools in Soweto last week. Seeing students use LearnAfrica to learn coding, math, and science fills me with so much hope.

These kids are brilliant. They just need access to the right tools. That's what we're building.

Big thanks to the amazing teachers who make it all possible!`,
    post_type: 'image',
    privacy_level: 'public',
    image_url: POST_IMAGES.STUDENTS,
    is_seeded: true,
  },

  // Post 3: Update post
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    content: `Exciting news from my PhD research!

Our adaptive learning algorithm has shown promising results:
- 40% improvement in learning outcomes
- 60% reduction in time to mastery
- Works even with intermittent connectivity

The AI adapts to each student's learning style and pace. Next step: large-scale pilot across our partner schools.

#EdTech #AI #Research`,
    post_type: 'update',
    privacy_level: 'public',
    is_seeded: true,
  },

  // Post 4: Link post
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    content: `Honored to be featured in MIT Technology Review's "35 Innovators Under 35"!

The article highlights how LearnAfrica is using AI to personalize education for African students. Still can't believe this is real!

Thank you to everyone who believed in this vision from day one.`,
    post_type: 'link',
    privacy_level: 'public',
    link_url: 'https://technologyreview.example.com/innovators-2024',
    link_title: 'MIT Technology Review: 35 Innovators Under 35',
    link_description: 'Meet the young innovators who are solving the world\'s biggest challenges with technology.',
    link_metadata: {
      provider_name: 'MIT Technology Review',
      is_video: false,
    },
    is_seeded: true,
  },

  // Post 5: Question post
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    content: `Calling all educators and EdTech folks!

We're expanding LearnAfrica's content to cover more vocational skills. What skills do you think are most important for African youth today?

Currently considering:
- Digital marketing
- Basic coding
- Financial literacy
- Agriculture technology
- Renewable energy basics

What would you add? What's most needed in your community?`,
    post_type: 'question',
    privacy_level: 'public',
    is_seeded: true,
  },
];

export default testPosts;
