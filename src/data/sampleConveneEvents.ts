export interface SampleEvent {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  attendee_count: number;
  max_attendees?: number;
  is_featured: boolean;
  is_virtual: boolean;
  created_at: string;
  banner_url?: string;
  is_curated?: boolean;
  curated_source_url?: string | null;
}

export const sampleConveneEvents: SampleEvent[] = [
  {
    id: 'curated-1',
    title: 'Africa and the African Diaspora and the World Wars Conference',
    description: 'This conference examines Africa and the African Diaspora\'s involvement in the World Wars, sponsored by Florida State University. It gathers scholars to explore historical contributions and experiences with opportunities for publication.',
    date_time: '2026-02-19T09:00:00Z',
    location: 'Tallahassee, United States',
    type: 'Conference',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: 'https://www.historians.org/event/africa-and-the-african-diaspora-and-the-world-wars/',
  },
  {
    id: 'curated-2',
    title: 'CACE 2026: Conference on African American and African Diasporic Cultures',
    description: 'The 36th annual CACE addresses Race and Education through academic panels, workshops, roundtables, keynotes, poetry, and performances. Topics include history, popular culture, mentorship, music, and mental health advocacy.',
    date_time: '2026-02-25T14:00:00Z',
    location: 'Greensboro, United States',
    type: 'Conference',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: 'https://www.uncg.edu/event/african-american-and-african-diaspora-studies-cace-2026/2026-02-25/',
  },
  {
    id: 'curated-3',
    title: '6th Annual Diaspora Africa Conference',
    description: 'Explores "Bridging the Divide: From Houston\'s Shores to Africa\'s Future." Features keynote chats, sector-specific panels on tech, energy, agribusiness, finance, creative industries, and healthcare, plus workshops on investing and entrepreneurship.',
    date_time: '2026-02-28T09:00:00Z',
    location: 'Houston, United States',
    type: 'Conference',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: 'https://www.diasporaafricaconference.com',
  },
  {
    id: 'curated-4',
    title: '25th Annual UT Austin Africa Conference',
    description: 'Focuses on Movements, Migrations, Labor & Displacements in Africa and the African Diaspora. Welcomes papers, panels, roundtables, and performances across humanities, social sciences, health, and more.',
    date_time: '2026-04-01T09:00:00Z',
    location: 'Austin, United States',
    type: 'Conference',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: 'https://calendar.utexas.edu/event/ut-austin-africa-conference-2026',
  },
  {
    id: 'curated-5',
    title: '5th Annual Festival of the Diaspora',
    description: 'Returns to San Juan, Puerto Rico, featuring a pitch competition, fashion show, exhibition hall, and the inaugural FOTD100 leadership award honoring 100 leaders across the Americas.',
    date_time: '2026-10-01T09:00:00Z',
    location: 'San Juan, Puerto Rico',
    type: 'Social',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: 'https://festivalofthediaspora.org',
  },
  {
    id: 'curated-6',
    title: 'Association for the Study of the Worldwide African Diaspora Conference',
    description: 'ASWAD\'s biennial conference brings together scholars, artists, and activists to discuss the worldwide African diaspora\'s history, culture, and contemporary experiences across disciplines.',
    date_time: '2026-11-12T09:00:00Z',
    location: 'United States',
    type: 'Conference',
    attendee_count: 0,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-02-28T00:00:00Z',
    banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop',
    is_curated: true,
    curated_source_url: null,
  },
];
