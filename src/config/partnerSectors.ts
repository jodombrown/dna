import publicSectorHero from '@/assets/sectors/public-sector-hero.jpg';
import privateIndustryHero from '@/assets/sectors/private-industry-hero.jpg';
import hbcuHero from '@/assets/sectors/hbcu-hero.jpg';
import universityHero from '@/assets/sectors/university-hero.jpg';
import ngoHero from '@/assets/sectors/ngo-hero.jpg';
import innovationHero from '@/assets/sectors/innovation-hero.jpg';
import investorHero from '@/assets/sectors/investor-hero.jpg';
import multilateralHero from '@/assets/sectors/multilateral-hero.jpg';

export type SectorConfig = {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  iconImageUrl?: string;
  iconAlt?: string;
  shortDescription: string;
  fiveCsBullets: {
    connect: string | string[];
    convene: string | string[];
    collaborate: string | string[];
    contribute: string | string[];
    convey: string | string[];
  };
  roles: { title: string; description: string }[];
  brings: string[];
  receives: string[];
  partnershipModels: { name: string; shortDescription: string }[];
  programs: { name: string; shortDescription: string }[];
  ctaLabel: string;
  ctaLink: string;
};

export const partnerSectors: SectorConfig[] = [
  {
    slug: 'public-sector',
    name: 'Public Sector & Economic Development',
    shortDescription: 'Your policies, programs, and people need a connected diaspora. DNA gives governments a single engine to mobilize citizens, investors, and global African talent.',
    heroTitle: 'Public Sector & Economic Development',
    heroSubtitle: 'Governments everywhere want to engage the diaspora, but coordination gaps and fragmented networks make it difficult. DNA gives you a shared engine to mobilize talent, investment, and collaboration at scale.',
    heroImageUrl: publicSectorHero,
    heroImageAlt: 'Public sector and economic development partnership',
    iconImageUrl: undefined,
    iconAlt: 'Public sector icon',
    fiveCsBullets: {
      connect: 'Map and activate diaspora professionals, investors, and institutions aligned with your development priorities',
      convene: 'Host policy dialogues, investment forums, and stakeholder gatherings that turn plans into partnerships',
      collaborate: 'Co-design national diaspora strategies, sector roadmaps, and pilot programs with execution clarity',
      contribute: 'Channel diaspora capital, expertise, policy advocacy, and technical support toward your goals',
      convey: 'Share progress, celebrate wins, and inspire the next wave of diaspora engagement through storytelling'
    },
    roles: [
      { title: 'Government Officials', description: 'Ministers, directors, and policy leaders shaping diaspora engagement strategy' },
      { title: 'Economic Development Agencies', description: 'Professionals attracting investment, talent, and partnerships for national growth' },
      { title: 'Diaspora Affairs Offices', description: 'Teams coordinating government engagement with diaspora communities' },
      { title: 'City & Regional Leaders', description: 'Mayors and administrators building local diaspora connections' }
    ],
    brings: [
      'Policy frameworks, regulatory clarity, and institutional credibility',
      'Government convening power and access to domestic institutions',
      'Co-funding capacity for strategic programs and initiatives',
      'Access to domestic markets, stakeholders, and implementation pathways'
    ],
    receives: [
      'A turnkey platform to mobilize diaspora talent, capital, and networks',
      'Access to verified diaspora professionals, investors, and institutions',
      'Program design support and capacity building for diaspora engagement',
      'Impact measurement, storytelling, and global visibility for your initiatives'
    ],
    partnershipModels: [
      { name: 'National / City DNA Partner', shortDescription: 'Co-create diaspora engagement infrastructure for your city or country' }
    ],
    programs: [
      { name: 'National Diaspora Engagement Strategy', shortDescription: 'Design and implement comprehensive diaspora mobilization frameworks' },
      { name: 'Diaspora Bond Programs', shortDescription: 'Structure and execute diaspora investment attraction initiatives' },
      { name: 'City-Based Innovation Hubs', shortDescription: 'Build local talent pipelines and entrepreneurship ecosystems' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'private-industry',
    name: 'Private Industry',
    shortDescription: 'Access diaspora talent, markets, and innovation networks to drive business growth and deliver measurable social impact.',
    heroTitle: 'Your Business Strategy Needs a Diaspora Advantage',
    heroSubtitle: 'Corporations want access to African markets, diaspora talent, and innovation pipelines, but fragmented networks make it expensive and slow. DNA gives you a shared platform to mobilize partnerships, talent, and market intelligence across the 5Cs.',
    heroImageUrl: privateIndustryHero,
    heroImageAlt: 'Private industry partnership',
    iconImageUrl: undefined,
    iconAlt: 'Private industry icon',
    fiveCsBullets: {
      connect: 'Access diaspora talent for recruitment, market insights for expansion, and partners for innovation',
      convene: 'Host corporate innovation challenges, executive roundtables, and market entry missions',
      collaborate: 'Co-design accelerator programs, market strategies, and ESG initiatives with measurable outcomes',
      contribute: 'Deploy capital, mentorship, and technical expertise to diaspora entrepreneurs and communities',
      convey: 'Tell your impact story to global audiences and position your brand as a diaspora development leader'
    },
    roles: [
      { title: 'Corporate Innovation Teams', description: 'Leaders exploring new markets, partnerships, and growth opportunities in Africa' },
      { title: 'Talent Acquisition', description: 'HR professionals seeking diaspora talent for specialized roles and leadership pipelines' },
      { title: 'ESG & Impact Officers', description: 'Teams designing and measuring social impact and corporate responsibility programs' },
      { title: 'Market Expansion Leaders', description: 'Executives entering or scaling operations in African and diaspora markets' }
    ],
    brings: [
      'Capital to sponsor innovation programs, challenges, and strategic initiatives',
      'Market access, distribution networks, and customer channels',
      'Technical expertise, mentorship, and industry knowledge',
      'Brand visibility and corporate credibility'
    ],
    receives: [
      'Direct access to global diaspora talent and innovation networks',
      'End-to-end design and execution of innovation challenges and accelerators',
      'Strategic guidance for market entry, expansion, and partnership development',
      'ESG/CSR impact measurement and authentic storytelling'
    ],
    partnershipModels: [
      { name: 'Corporate Innovation Partner', shortDescription: 'Multi-year partnership for talent access, innovation, and market expansion' }
    ],
    programs: [
      { name: 'Diaspora Talent Recruitment Pipeline', shortDescription: 'Access verified diaspora professionals for executive and technical roles' },
      { name: 'Corporate Innovation Challenges', shortDescription: 'Design and execute sponsored innovation programs with diaspora entrepreneurs' },
      { name: 'Market Entry Strategy Support', shortDescription: 'Leverage diaspora networks for African market intelligence and partnerships' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'hbcus',
    name: 'HBCUs',
    shortDescription: 'Connect your students and alumni to global opportunities, research collaborations, and leadership pathways.',
    heroTitle: 'HBCUs: Tap Into Your Global Alumni Network',
    heroSubtitle: 'HBCUs want to extend their global reach, create new opportunities for students, and build stronger alumni networks, but fragmented connections make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: hbcuHero,
    heroImageAlt: 'HBCU partnership',
    iconImageUrl: undefined,
    iconAlt: 'HBCU icon',
    fiveCsBullets: {
      connect: 'Map alumni expertise, research interests, and professional networks worldwide',
      convene: 'Host virtual career fairs, research conferences, and alumni networking events',
      collaborate: 'Co-design global exchange programs, research partnerships, and leadership development initiatives',
      contribute: 'Channel alumni giving, mentorship, and expertise back to your institution',
      convey: 'Showcase HBCU success stories, global impact, and leadership contributions'
    },
    roles: [
      { title: 'University Presidents', description: 'Leaders setting the vision for global engagement and alumni relations' },
      { title: 'Provosts & Deans', description: 'Academic leaders driving international research and exchange programs' },
      { title: 'Alumni Affairs Directors', description: 'Professionals building and engaging global alumni networks' },
      { title: 'Career Services Teams', description: 'Staff connecting students to global career opportunities' }
    ],
    brings: [
      'Access to diverse student and alumni talent',
      'Research capabilities and academic expertise',
      'A legacy of leadership development and social impact',
      'Convening power within the HBCU community'
    ],
    receives: [
      'A global platform to connect with alumni, partners, and opportunities',
      'Tools to map alumni expertise and engagement',
      'Support for designing and executing global programs',
      'Increased visibility and recognition for HBCU achievements'
    ],
    partnershipModels: [
      { name: 'HBCU Global Engagement Partner', shortDescription: 'Multi-year partnership for student success, alumni engagement, and global impact' }
    ],
    programs: [
      { name: 'Global Alumni Mapping & Engagement', shortDescription: 'Identify and activate alumni networks worldwide' },
      { name: 'Student Global Exchange Programs', shortDescription: 'Create opportunities for students to study and work abroad' },
      { name: 'Research Collaboration Initiatives', shortDescription: 'Connect faculty with international research partners' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'global-universities',
    name: 'Global Universities & Education Systems',
    shortDescription: 'Mobilize your diaspora alumni, research, and innovation to address global challenges and build international partnerships.',
    heroTitle: 'Global Universities: Mobilize Your Diaspora Networks',
    heroSubtitle: 'Universities want to extend their global impact, attract international students, and build stronger research partnerships, but fragmented networks make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: universityHero,
    heroImageAlt: 'Global university partnership',
    iconImageUrl: undefined,
    iconAlt: 'Global university icon',
    fiveCsBullets: {
      connect: 'Map diaspora alumni expertise, research interests, and professional networks worldwide',
      convene: 'Host virtual career fairs, research conferences, and alumni networking events',
      collaborate: 'Co-design global exchange programs, research partnerships, and curriculum development initiatives',
      contribute: 'Channel alumni giving, mentorship, and expertise back to your institution',
      convey: 'Showcase university success stories, global impact, and leadership contributions'
    },
    roles: [
      { title: 'University Presidents', description: 'Leaders setting the vision for global engagement and alumni relations' },
      { title: 'Provosts & Deans', description: 'Academic leaders driving international research and exchange programs' },
      { title: 'International Affairs Directors', description: 'Professionals building and managing global partnerships' },
      { title: 'Research & Innovation Teams', description: 'Staff connecting researchers to international funding and collaboration' }
    ],
    brings: [
      'Access to diverse student and alumni talent',
      'Research capabilities and academic expertise',
      'A legacy of leadership development and social impact',
      'Convening power within the university community'
    ],
    receives: [
      'A global platform to connect with alumni, partners, and opportunities',
      'Tools to map alumni expertise and engagement',
      'Support for designing and executing global programs',
      'Increased visibility and recognition for university achievements'
    ],
    partnershipModels: [
      { name: 'University Global Engagement Partner', shortDescription: 'Multi-year partnership for student success, alumni engagement, and global impact' }
    ],
    programs: [
      { name: 'Global Alumni Mapping & Engagement', shortDescription: 'Identify and activate alumni networks worldwide' },
      { name: 'Student Global Exchange Programs', shortDescription: 'Create opportunities for students to study and work abroad' },
      { name: 'Research Collaboration Initiatives', shortDescription: 'Connect faculty with international research partners' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'ngos-civil-society',
    name: 'NGOs & Civil Society',
    shortDescription: 'Amplify your impact, mobilize diaspora volunteers, and build sustainable community development programs.',
    heroTitle: 'NGOs & Civil Society: Mobilize Your Diaspora Networks',
    heroSubtitle: 'NGOs want to extend their reach, mobilize diaspora volunteers, and build stronger community programs, but fragmented networks make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: ngoHero,
    heroImageAlt: 'NGO partnership',
    iconImageUrl: undefined,
    iconAlt: 'NGO icon',
    fiveCsBullets: {
      connect: 'Map diaspora expertise, volunteer interests, and community networks worldwide',
      convene: 'Host virtual town halls, community forums, and volunteer recruitment events',
      collaborate: 'Co-design community development programs, advocacy campaigns, and fundraising initiatives',
      contribute: 'Channel diaspora giving, volunteerism, and expertise back to your organization',
      convey: 'Showcase NGO success stories, community impact, and volunteer contributions'
    },
    roles: [
      { title: 'Executive Directors', description: 'Leaders setting the vision for community impact and diaspora engagement' },
      { title: 'Program Managers', description: 'Professionals designing and managing community development programs' },
      { title: 'Volunteer Coordinators', description: 'Staff recruiting and managing diaspora volunteers' },
      { title: 'Development & Fundraising Teams', description: 'Staff raising funds and building donor relationships' }
    ],
    brings: [
      'A deep understanding of community needs and challenges',
      'A network of local partners and stakeholders',
      'A commitment to social impact and community development',
      'Convening power within the community'
    ],
    receives: [
      'A global platform to connect with diaspora volunteers, donors, and partners',
      'Tools to map diaspora expertise and engagement',
      'Support for designing and executing community programs',
      'Increased visibility and recognition for NGO achievements'
    ],
    partnershipModels: [
      { name: 'NGO Community Impact Partner', shortDescription: 'Multi-year partnership for volunteer mobilization, program development, and community impact' }
    ],
    programs: [
      { name: 'Diaspora Volunteer Mobilization', shortDescription: 'Recruit and manage diaspora volunteers for community programs' },
      { name: 'Community Development Programs', shortDescription: 'Design and implement programs to address community needs' },
      { name: 'Fundraising & Donor Engagement', shortDescription: 'Raise funds and build relationships with diaspora donors' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'innovation-ecosystems',
    name: 'Innovation Ecosystems',
    shortDescription: 'Connect your hub, startups, and talent to global markets, investors, and knowledge networks.',
    heroTitle: 'Innovation Ecosystems: Go Global With Your Hub',
    heroSubtitle: 'Innovation hubs want to extend their global reach, attract international startups, and build stronger investor networks, but fragmented connections make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: innovationHero,
    heroImageAlt: 'Innovation ecosystem partnership',
    iconImageUrl: undefined,
    iconAlt: 'Innovation ecosystem icon',
    fiveCsBullets: {
      connect: 'Map diaspora expertise, investor interests, and startup networks worldwide',
      convene: 'Host virtual pitch events, investor roundtables, and startup networking events',
      collaborate: 'Co-design accelerator programs, mentorship initiatives, and market entry strategies',
      contribute: 'Channel diaspora investment, mentorship, and expertise back to your hub',
      convey: 'Showcase hub success stories, startup impact, and innovation contributions'
    },
    roles: [
      { title: 'Hub Directors', description: 'Leaders setting the vision for global engagement and startup success' },
      { title: 'Accelerator Managers', description: 'Professionals designing and managing accelerator programs' },
      { title: 'Investor Relations Teams', description: 'Staff building relationships with diaspora investors' },
      { title: 'Startup Mentors', description: 'Experts providing guidance and support to startups' }
    ],
    brings: [
      'A vibrant community of startups and innovators',
      'Access to local markets and talent',
      'A supportive ecosystem for entrepreneurship',
      'Convening power within the innovation community'
    ],
    receives: [
      'A global platform to connect with diaspora investors, mentors, and partners',
      'Tools to map diaspora expertise and engagement',
      'Support for designing and executing accelerator programs',
      'Increased visibility and recognition for hub achievements'
    ],
    partnershipModels: [
      { name: 'Innovation Hub Global Partner', shortDescription: 'Multi-year partnership for startup acceleration, investor engagement, and global impact' }
    ],
    programs: [
      { name: 'Diaspora Investor Network', shortDescription: 'Connect startups with diaspora investors' },
      { name: 'Global Accelerator Program', shortDescription: 'Design and implement accelerator programs for startups' },
      { name: 'Mentorship & Expert Support', shortDescription: 'Provide startups with mentorship and expert guidance' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'investors',
    name: 'Investors',
    shortDescription: 'Access vetted investment opportunities, talent pipelines, and market intelligence in emerging economies.',
    heroTitle: 'Investors: Find Your Next Deal in the Diaspora',
    heroSubtitle: 'Investors want to access vetted deals, tap into new markets, and find promising talent in emerging economies, but fragmented networks make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: investorHero,
    heroImageAlt: 'Investor partnership',
    iconImageUrl: undefined,
    iconAlt: 'Investor icon',
    fiveCsBullets: {
      connect: 'Map diaspora expertise, investment interests, and startup networks worldwide',
      convene: 'Host virtual pitch events, investor roundtables, and deal-sourcing events',
      collaborate: 'Co-design investment funds, mentorship initiatives, and market entry strategies',
      contribute: 'Channel diaspora investment, mentorship, and expertise to promising startups',
      convey: 'Showcase investment success stories, portfolio impact, and market opportunities'
    },
    roles: [
      { title: 'Venture Capitalists', description: 'Investors seeking high-growth startups in emerging markets' },
      { title: 'Angel Investors', description: 'Individuals investing in early-stage companies' },
      { title: 'Impact Investors', description: 'Investors seeking social and environmental impact' },
      { title: 'Fund Managers', description: 'Professionals managing investment funds' }
    ],
    brings: [
      'Capital to invest in promising startups',
      'Expertise in finance, business, and technology',
      'A network of industry contacts and partners',
      'A commitment to supporting entrepreneurship'
    ],
    receives: [
      'Access to vetted investment opportunities in emerging markets',
      'Tools to map diaspora expertise and engagement',
      'Support for designing and executing investment strategies',
      'Increased visibility and recognition for investment achievements'
    ],
    partnershipModels: [
      { name: 'Diaspora Investment Partner', shortDescription: 'Multi-year partnership for deal sourcing, investment management, and portfolio impact' }
    ],
    programs: [
      { name: 'Diaspora Investment Fund', shortDescription: 'Invest in promising startups in emerging markets' },
      { name: 'Deal Sourcing & Due Diligence', shortDescription: 'Identify and evaluate investment opportunities' },
      { name: 'Mentorship & Expert Support', shortDescription: 'Provide startups with mentorship and expert guidance' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  },
  {
    slug: 'un-sdg-multilaterals',
    name: 'UN / SDG & Multilaterals',
    shortDescription: 'Mobilize diaspora resources, expertise, and partnerships to achieve the Sustainable Development Goals.',
    heroTitle: 'UN / SDG & Multilaterals: Mobilize the Diaspora for Global Impact',
    heroSubtitle: 'Multilateral organizations want to mobilize diaspora resources, expertise, and partnerships to achieve the SDGs, but fragmented networks make it difficult. DNA gives you a shared platform to mobilize partnerships, talent, and resources across the 5Cs.',
    heroImageUrl: multilateralHero,
    heroImageAlt: 'UN/SDG partnership',
    iconImageUrl: undefined,
    iconAlt: 'UN/SDG icon',
    fiveCsBullets: {
      connect: 'Map diaspora expertise, SDG interests, and partnership networks worldwide',
      convene: 'Host virtual forums, SDG roundtables, and partnership-building events',
      collaborate: 'Co-design SDG programs, advocacy campaigns, and resource mobilization strategies',
      contribute: 'Channel diaspora resources, expertise, and partnerships to achieve the SDGs',
      convey: 'Showcase SDG success stories, impact metrics, and partnership achievements'
    },
    roles: [
      { title: 'UN Agency Directors', description: 'Leaders setting the vision for SDG achievement and diaspora engagement' },
      { title: 'SDG Program Managers', description: 'Professionals designing and managing SDG programs' },
      { title: 'Partnership Coordinators', description: 'Staff building and managing partnerships with diaspora organizations' },
      { title: 'Resource Mobilization Teams', description: 'Staff raising funds and mobilizing resources for SDG programs' }
    ],
    brings: [
      'A global mandate to achieve the Sustainable Development Goals',
      'A network of international partners and stakeholders',
      'Expertise in development, policy, and advocacy',
      'Convening power within the international community'
    ],
    receives: [
      'A global platform to connect with diaspora experts, partners, and resources',
      'Tools to map diaspora expertise and engagement',
      'Support for designing and executing SDG programs',
      'Increased visibility and recognition for SDG achievements'
    ],
    partnershipModels: [
      { name: 'SDG Diaspora Mobilization Partner', shortDescription: 'Multi-year partnership for resource mobilization, program development, and SDG impact' }
    ],
    programs: [
      { name: 'Diaspora SDG Fund', shortDescription: 'Mobilize diaspora resources for SDG programs' },
      { name: 'SDG Program Development', shortDescription: 'Design and implement programs to achieve the SDGs' },
      { name: 'Partnership Building & Engagement', shortDescription: 'Build and manage partnerships with diaspora organizations' }
    ],
    ctaLabel: 'Partner With DNA',
    ctaLink: '/partner-with-dna/start'
  }
];

export const getSectorBySlug = (slug: string): SectorConfig | undefined => {
  return partnerSectors.find(sector => sector.slug === slug);
};
