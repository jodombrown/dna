/**
 * DNA Platform - Test Stories Data (CONVEY)
 *
 * Stories for each profile using the supported story types:
 * - impact: Measurable outcomes and success stories
 * - update: Progress reports and milestones
 * - spotlight: Highlighting people, orgs, or initiatives
 * - photo_essay: Visual storytelling
 *
 * NON-PRODUCTION: All stories marked with is_seeded = true
 */

import { TEST_PROFILE_IDS } from '../constants';

// Gallery images for stories
const STORY_IMAGES = {
  FINTECH_IMPACT: [
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&h=600&fit=crop',
  ],
  SOLAR_IMPACT: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop',
  ],
  ART_GALLERY: [
    'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=600&fit=crop',
  ],
  HEALTH_JOURNEY: [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop',
  ],
  EDUCATION_IMPACT: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop',
  ],
};

export interface TestStory {
  author_id: string;
  title: string;
  subtitle: string;
  content: string;
  post_type: string;
  story_type: string;
  privacy_level: string;
  image_url?: string;
  gallery_urls?: string[];
  is_seeded: boolean;
}

export const testStories: TestStory[] = [
  // ============================================================
  // AMARA OKONKWO (Fintech) - 2 Stories
  // ============================================================

  // Story 1: Impact Story
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    title: 'How We Saved Nigerian Families $2 Million in Remittance Fees',
    subtitle: 'A year-long journey to transform how diaspora members send money home',
    content: `When my grandmother needed to receive money from my uncle in London, she would wait for days, sometimes weeks, and lose up to 15% in fees. This story was common across Nigeria and inspired me to create AfriPay.

## The Challenge

Every year, the African diaspora sends over $50 billion in remittances to their families. But traditional services charge exorbitant fees—often 7-15%—and transfers can take days.

For a family receiving $500/month, that's $75 lost to fees. Over a year, that's $900 that could have paid for:
- Three months of school fees
- Medical treatment for a sick relative
- Seeds and equipment for a small farm

## Our Solution

AfriPay built a mobile-first platform that:
1. Reduces fees to under 2%
2. Delivers funds in under 30 minutes
3. Works with mobile money across 15 African countries
4. Requires no bank account

## The Impact After One Year

**By the Numbers:**
- 150,000 active users
- $50 million transferred
- $2 million saved in fees collectively
- Average transfer time: 23 minutes
- 98% customer satisfaction

**Real Stories:**
Grace Adebayo in Lagos now receives her daughter's monthly support within minutes. "Before AfriPay, I would wait a week and lose so much to fees. Now I get an alert on my phone and can pick up the money that same day."

## What's Next

We're launching micro-investments next quarter, allowing diaspora members to invest directly in their home communities. Small investments, big impact.

The journey continues, and I'm grateful for every family we've helped along the way.`,
    post_type: 'article',
    story_type: 'impact',
    privacy_level: 'public',
    image_url: STORY_IMAGES.FINTECH_IMPACT[0],
    gallery_urls: STORY_IMAGES.FINTECH_IMPACT,
    is_seeded: true,
  },

  // Story 2: Spotlight
  {
    author_id: TEST_PROFILE_IDS.AMARA_FINTECH,
    title: 'Spotlight: The Engineers Behind AfriPay',
    subtitle: 'Meet the African talent building world-class fintech from Lagos',
    content: `Behind every great product is an amazing team. Today, I want to spotlight the engineers who make AfriPay possible.

## Building in Africa, for Africa

When I decided to build AfriPay's engineering team in Lagos, many advised against it. "Hire in London," they said. "The talent is better."

They were wrong.

## Meet the Team

**Chidi Okonkwo, CTO**
Former Google engineer who returned to Nigeria after 8 years in Silicon Valley. Chidi leads our 30-person engineering team and has built systems that handle millions of transactions daily.

"I came back because I wanted to build something that matters for my people. At Google, I worked on interesting problems. At AfriPay, I work on problems that change lives."

**Adaeze Nwosu, Lead Backend Engineer**
Self-taught engineer from Owerri who learned to code watching YouTube videos on her phone. Now she designs the APIs that power our entire platform.

**Emeka Obi, Security Lead**
Former cybersecurity consultant who ensures our users' money is safe. His team has stopped over 5,000 fraud attempts this year.

## What We've Learned

Building an engineering team in Africa taught us:
1. The talent is world-class
2. Local context matters—our engineers understand the problems deeply
3. Retention is about mission, not just salary
4. Remote-first works when you hire right

## Our Commitment

We're committed to hiring 100 more engineers in Africa over the next two years. If you're a talented engineer passionate about fintech, reach out. Let's build together.`,
    post_type: 'article',
    story_type: 'spotlight',
    privacy_level: 'public',
    image_url: STORY_IMAGES.FINTECH_IMPACT[1],
    is_seeded: true,
  },

  // ============================================================
  // DR. KWAME ASANTE (Clean Energy) - 2 Stories
  // ============================================================

  // Story 1: Impact Story
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    title: 'Lighting Up 50 Schools in Northern Ghana: A Solar Success Story',
    subtitle: 'How renewable energy is transforming education in rural communities',
    content: `Two years ago, students at Tamale Municipal School studied by candlelight. Today, they have computers, lights, and dreams of becoming engineers and doctors.

## The Problem

In Northern Ghana, only 40% of schools have reliable electricity. Without power:
- Students can't study after dark
- Computers can't be used
- Science labs can't function
- Teachers can't access digital resources

## Our Approach

The Solar Schools Initiative, funded by the Gates Foundation and implemented with local partners, brought solar power to 50 schools in the Northern and Upper East regions.

Each installation includes:
- 5kW solar panel array
- Battery storage for cloudy days
- LED lighting for 10 classrooms
- Charging stations for laptops and tablets
- Maintenance training for local technicians

## The Results After 18 Months

**Education Outcomes:**
- Study hours increased by 3 hours/day
- Pass rates improved by 25%
- Science course enrollment up 40%
- Computer literacy programs launched in all 50 schools

**Economic Impact:**
- 150 local jobs created (installation and maintenance)
- Schools save $500/month on generator fuel
- Local technicians now install systems for homes and businesses

**Sustainability:**
- 95% system uptime
- All schools have trained maintenance staff
- Community ownership ensures long-term success

## Voices from the Ground

Fatima, 15, a student at Wa Senior High: "Before solar, I couldn't study at night. My father couldn't afford candles. Now I stay after school and use the computer lab. I want to study engineering."

Mr. Alhassan, headmaster: "This is the best thing that has happened to our school. Our students believe in possibilities they never imagined before."

## What's Next

Phase 2 launches next year: 100 more schools across Ghana and Kenya. But we need partners. If you're interested in supporting education through renewable energy, let's connect.`,
    post_type: 'article',
    story_type: 'impact',
    privacy_level: 'public',
    image_url: STORY_IMAGES.SOLAR_IMPACT[0],
    gallery_urls: STORY_IMAGES.SOLAR_IMPACT,
    is_seeded: true,
  },

  // Story 2: Update
  {
    author_id: TEST_PROFILE_IDS.KWAME_ENERGY,
    title: 'Research Update: Next-Generation Solar Cells for Africa',
    subtitle: 'Q4 2024 progress report on our tropical-optimized solar technology',
    content: `As we close out an incredible year of research, I wanted to share our progress on developing solar technology specifically designed for African conditions.

## Key Achievements This Quarter

**Efficiency Breakthrough**
Our new perovskite-silicon tandem cells achieved 28.5% efficiency—a record for our lab and competitive with the best commercial cells worldwide.

**Durability Testing**
After 18 months of field testing in Ghana:
- <5% degradation (vs. 10-15% for standard panels)
- All test units operational
- Performance maintained through rainy season

**Cost Reduction**
Manufacturing cost projections:
- Current: $0.22/watt
- Next year target: $0.18/watt
- Long-term goal: $0.15/watt

## Current Projects

1. **Commercial Pilot**
Working with two Ghanaian solar installers to test our panels in real-world conditions. 500 panels deployed across 20 sites.

2. **Technology Transfer**
Training program with Kwame Nkrumah University to build local manufacturing capacity. 10 researchers completing training this year.

3. **Rural Electrification**
Designing ultra-low-cost systems for off-grid homes. Target: $100 system for basic lighting and phone charging.

## Challenges and Learnings

- Supply chain disruptions delayed some materials
- Need more data on long-term performance
- Local manufacturing requires more investment

## Coming in 2025

- Publication in Nature Energy
- Launch of manufacturing pilot in Accra
- Expansion of school electrification project

Grateful for the support of our funders, research team, and partners on the ground. The future of African energy is bright—literally.`,
    post_type: 'article',
    story_type: 'update',
    privacy_level: 'public',
    image_url: STORY_IMAGES.SOLAR_IMPACT[2],
    is_seeded: true,
  },

  // ============================================================
  // FATIMA DIALLO (Culture) - 2 Stories
  // ============================================================

  // Story 1: Photo Essay
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    title: 'A Week at the Dakar Biennale: African Art\'s Moment',
    subtitle: 'Visual journey through Africa\'s largest contemporary art event',
    content: `The Dakar Biennale, known as "Dak'Art," is the oldest and most prestigious contemporary art exhibition in Africa. This year, I spent a week immersed in the creativity, energy, and vision of African artists from across the continent and diaspora.

## Day 1: The Opening

The biennale opened with a parade through the streets of Dakar—artists, dancers, musicians celebrating African creativity. The theme this year: "Forging New Links."

## The Main Exhibition

Over 75 artists from 40 countries showcased work exploring identity, migration, tradition, and the future. Highlights included:

**"Roots and Routes" by Abdoulaye Konaté (Mali)**
A massive textile installation exploring diaspora journeys. Visitors walked through fabric tunnels representing the passages between Africa and the world.

**"Digital Ancestors" by Wanuri Kahiu (Kenya)**
An Afrofuturist video installation imagining what our ancestors would think of modern technology. Haunting and hopeful.

**"Market Day" by El Anatsui (Ghana)**
The master sculptor presented a new bottle-cap installation, shimmering like water under gallery lights.

## The Parallel Exhibitions

Beyond the main exhibition, dozens of galleries, workshops, and pop-up spaces showcased emerging artists. I discovered five artists I'll be representing at Afrique Moderne.

## The People

What struck me most was the energy of young African artists and collectors. The art market is changing—Africans are collecting African art, and that changes everything.

## Looking Forward

The biennale reminded me why I do this work. African art is having its moment, and we're just beginning to show the world what we've always known: our creativity is boundless.

Next biennale: 2026. See you there.`,
    post_type: 'article',
    story_type: 'photo_essay',
    privacy_level: 'public',
    image_url: STORY_IMAGES.ART_GALLERY[0],
    gallery_urls: STORY_IMAGES.ART_GALLERY,
    is_seeded: true,
  },

  // Story 2: Spotlight
  {
    author_id: TEST_PROFILE_IDS.FATIMA_CULTURE,
    title: 'Spotlight: Kofi Setordji, The Sculptor Transforming Waste into Wonder',
    subtitle: 'How a Ghanaian artist is turning electronic waste into powerful art',
    content: `In a world drowning in e-waste, Kofi Setordji sees beauty. His sculptures, made entirely from discarded electronics, are exhibited in galleries worldwide and have sold for over $500,000.

## The Artist

Kofi grew up in Agbogbloshie, Accra—one of the world's largest e-waste dumps. While others saw pollution, he saw raw materials. At 16, he started creating small sculptures from computer parts. Today, at 32, he's one of Africa's most celebrated artists.

## The Work

Kofi's sculptures are massive—some reaching 15 feet tall. They depict African warriors, gods, and everyday people, all made from:
- Circuit boards
- Phone screens
- Computer cables
- Hard drive platters

His most famous piece, "Digital Ancestor," sold for $180,000 at Christie's last year.

## The Message

"Every piece of e-waste was once someone's precious technology," Kofi explains. "I give it new life, new meaning. I want people to think about what we discard and who deals with the consequences."

## Supporting the Next Generation

Kofi runs a workshop in Accra where he trains young people from Agbogbloshie in art and metalworking. "Art saved me," he says. "I want to give others the same chance."

## Upcoming Exhibitions

- Paris: Afrique Moderne Gallery, March 2025
- New York: MoMA PS1, Summer 2025
- Lagos: ArtHouse Contemporary, Fall 2025

If you're a collector interested in Kofi's work, reach out. His pieces are investments in African innovation and environmental consciousness.`,
    post_type: 'article',
    story_type: 'spotlight',
    privacy_level: 'public',
    image_url: STORY_IMAGES.ART_GALLERY[1],
    is_seeded: true,
  },

  // ============================================================
  // DAVID MWANGI (Healthcare) - 2 Stories
  // ============================================================

  // Story 1: Impact Story
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    title: 'How Telemedicine Saved 150 Mothers in Rural Kenya',
    subtitle: 'A story of technology, dedication, and lives transformed',
    content: `In Turkana County, Kenya, maternal mortality was devastating. Women died from complications that could have been prevented with early detection. This is the story of how we changed that.

## The Challenge

Turkana County is vast—larger than Rwanda—with only 3 hospitals for 1 million people. Pregnant women often travel 100+ kilometers to reach care, many in labor.

Before our intervention:
- Maternal mortality: 488 per 100,000 live births
- Average distance to hospital: 85 km
- Prenatal visit rate: 35%

## Our Intervention

We deployed telemedicine units to 20 community health centers, connecting local nurses with specialists in Nairobi.

Each unit includes:
- Tablet with video consultation capability
- Portable ultrasound
- Blood pressure and vitals monitors
- Solar power backup
- Training for 3 nurses per facility

## The Results After 2 Years

**Lives Saved:**
- 150 high-risk pregnancies identified and managed remotely
- 45 emergency evacuations arranged in time
- 0 maternal deaths in facilities with telemedicine (down from 12 annually)

**System Impact:**
- Prenatal visits increased to 78%
- 5,000 remote consultations conducted
- 60 nurses trained in high-risk obstetrics

## One Mother's Story

Amina, 24, was flagged for preeclampsia during a routine telemedicine consultation. The nurse in her village noticed her blood pressure was dangerously high. Within hours, she was evacuated to Lodwar Hospital where she delivered a healthy baby via emergency C-section.

"Without that machine," she says, "my baby and I would not be here."

## What's Next

We're scaling to 100 more facilities across Kenya and expanding to maternal mental health services. Every mother deserves a safe pregnancy, no matter where she lives.

Partners welcome. Lives depend on it.`,
    post_type: 'article',
    story_type: 'impact',
    privacy_level: 'public',
    image_url: STORY_IMAGES.HEALTH_JOURNEY[0],
    gallery_urls: STORY_IMAGES.HEALTH_JOURNEY,
    is_seeded: true,
  },

  // Story 2: Update
  {
    author_id: TEST_PROFILE_IDS.DAVID_HEALTH,
    title: 'HealthBridge Africa: 2024 Year in Review',
    subtitle: 'Reflecting on a year of growth, impact, and lessons learned',
    content: `As we close out 2024, I want to share what we've accomplished, what we've learned, and where we're headed.

## By the Numbers

**Facilities Connected:** 500 (up from 200)
**Countries:** Kenya, Uganda, Tanzania
**Patient Consultations:** 2 million
**Healthcare Workers Trained:** 5,000

## Major Milestones

**Q1: East African Expansion**
Launched operations in Tanzania, partnering with 50 health facilities in rural regions. The government is now considering HealthBridge for national scale-up.

**Q2: Mental Health Integration**
Added telepsychiatry services, connecting rural areas with mental health professionals. Over 10,000 mental health consultations provided.

**Q3: AI Diagnostic Support**
Piloted AI-assisted diagnosis for common conditions. Early results show 30% improvement in diagnostic accuracy.

**Q4: Training Academy**
Launched online training platform for healthcare workers. 2,000 nurses and CHWs certified this quarter.

## Challenges

**Connectivity:** Internet reliability remains our biggest challenge. We're testing offline-capable systems.

**Sustainability:** Moving from donor funding to government budgets is slow. We need more diverse revenue streams.

**Workforce:** Digital health requires new skills. Training is essential but takes time.

## Looking Ahead to 2025

- Expand to Rwanda and Ethiopia
- Launch patient-facing mobile app
- Achieve financial sustainability in Kenya
- Publish randomized controlled trial results

Thank you to our team, partners, and funders. The journey to universal healthcare in Africa continues.`,
    post_type: 'article',
    story_type: 'update',
    privacy_level: 'public',
    image_url: STORY_IMAGES.HEALTH_JOURNEY[1],
    is_seeded: true,
  },

  // ============================================================
  // ZARA TEMBA (Education) - 2 Stories
  // ============================================================

  // Story 1: Impact Story
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    title: 'From Soweto to MIT: How LearnAfrica is Changing Lives',
    subtitle: '5 students whose journeys show the power of accessible education',
    content: `When I started LearnAfrica, I had a simple belief: every African child deserves access to quality education. Two years later, these five students show why that belief drives everything we do.

## Thabo, 17, South Africa

Thabo lives in Soweto, where his school had no computer lab. Through LearnAfrica, he learned coding on his mother's phone. This year, he won a national coding competition and received a full scholarship to University of Cape Town.

"LearnAfrica taught me that my circumstances don't define my possibilities."

## Amina, 14, Kenya

In Kibera, Amina used LearnAfrica to study after her parents couldn't afford school fees. She completed two years of curriculum in 8 months. A sponsor found through our platform is now funding her secondary education.

## Emmanuel, 16, Nigeria

Emmanuel wanted to learn science but his school had no laboratory. Our virtual labs let him conduct experiments on his phone. He's now preparing for university to study biochemistry.

## Grace, 13, Ghana

Grace has a hearing impairment. Traditional schools struggled to accommodate her. Our closed-caption videos and visual learning tools helped her thrive. She's now top of her class.

## Kweku, 15, Rwanda

Kweku is a refugee from DRC. LearnAfrica's offline mode let him continue learning in a camp with limited connectivity. He dreams of becoming a doctor to help other refugees.

## The Data Behind the Stories

These five represent 2 million students:
- 40% improvement in test scores
- 85% completion rate for courses
- 70% from families below poverty line
- 12 languages supported

## Our Commitment

Every day, we hear stories like these. They remind us why we build, why we persist, and why we believe education can transform Africa.

If you want to support a student like Thabo, Amina, Emmanuel, Grace, or Kweku, join our sponsor program. Change one life, change the world.`,
    post_type: 'article',
    story_type: 'impact',
    privacy_level: 'public',
    image_url: STORY_IMAGES.EDUCATION_IMPACT[0],
    gallery_urls: STORY_IMAGES.EDUCATION_IMPACT,
    is_seeded: true,
  },

  // Story 2: Update
  {
    author_id: TEST_PROFILE_IDS.ZARA_EDUCATION,
    title: 'Building LearnAfrica: Lessons from Scaling EdTech in Africa',
    subtitle: 'What I\'ve learned about building technology for underserved communities',
    content: `Starting LearnAfrica during a global pandemic while pursuing a PhD at MIT was crazy. But the lessons I've learned are worth sharing with anyone building for Africa.

## Lesson 1: Design for Constraints

Most EdTech assumes high-speed internet and new devices. In Africa:
- 60% of users have 2G connections
- Average phone has 1GB storage
- Data costs 10x more relative to income

We rebuilt our entire platform to work offline, use minimal data, and run on basic smartphones. Downloads: under 10MB.

## Lesson 2: Content is King, Context is Queen

We started with MIT-quality content. It flopped. Why? Examples didn't resonate, language was too formal, and cultural references were foreign.

We rebuilt with local educators, using African examples, stories, and contexts. Engagement tripled.

## Lesson 3: Teachers Are Partners, Not Obstacles

Some EdTech companies try to replace teachers. We learned to empower them.

Our teacher dashboard shows:
- Which students are struggling
- Which concepts need reinforcement
- Progress vs. curriculum standards

Teachers love it. They became our biggest advocates.

## Lesson 4: Trust Takes Time

In many communities, people are skeptical of free products. "What's the catch?"

We spent months in communities, partnering with local leaders, proving value before asking for anything. Trust = traction.

## Lesson 5: Impact Requires Sustainability

Donor funding got us started. But lasting change requires business models.

We're testing:
- School subscriptions (B2B)
- Certification fees for job-seekers
- Corporate sponsorships
- Government contracts

## What's Next

As I finish my PhD, I'm focused on:
1. AI personalization at scale
2. Teacher training integration
3. Job placement partnerships

The journey continues. Thanks for following along.`,
    post_type: 'article',
    story_type: 'update',
    privacy_level: 'public',
    image_url: STORY_IMAGES.EDUCATION_IMPACT[1],
    is_seeded: true,
  },
];

export default testStories;
