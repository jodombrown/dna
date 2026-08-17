// Ghana country page content, extracted verbatim from the Claude Design handoff
// prototype (Ghana Country Page.dc.html). Copy strings are FINAL for this round.
// Do not paraphrase or "improve" them without a design review.
//
// The DC file remains the spec of record for layout and interaction. This file
// exists so you do not have to re-derive content from 158KB of pseudo-JSX.
//
// GENERALIZATION: every value here is Ghana-specific. When this becomes the
// 54-country template, this file moves to content/countries/ghana.ts and the
// types below become the template contract.

export type PathwayId =
  | 'history' | 'culture' | 'news' | 'government' | 'investment'
  | 'real-estate' | 'tourism' | 'relocation-citizenship' | 'education' | 'community';

export type SectionType = 'lede' | 'topic' | 'memorial' | 'verify' | 'risk' | 'note' | 'photo';

export interface PathwaySection {
  type: SectionType;
  title?: string;
  body?: string;
  kicker?: string;
  items?: { t: string; d: string; num?: string }[];
  photoId?: string;
  placeholder?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  category: 'Heritage & Memory' | 'Nature & Landscape' | 'Culture & Cities' | 'Added by you';
  color: string;
  lng: number;
  lat: number;
  desc: string;
}

export interface HistoryEra {
  id: number;
  year: string;
  title: string;
  body: string;
  color: string;
  placeholder?: string;
  hasPhoto: boolean;
}

// Ghana flag palette. Per-country config at template time.
export const GHANA_FLAG = { red: '#CE1126', gold: '#FCD116', green: '#006B3F' };
export const HISTORY_RUPTURE_BG = '#0B0B0B';
export const HISTORY_TURN_ACCENT = '#B8860B';

// Mapbox geography, Ghana-specific. Per-country config at template time.
export const GHANA_MAP_CONFIG = {
  maxBounds: [[-4.2, 3.9], [1.9, 11.6]] as [[number, number], [number, number]],
  center: [-1.0, 7.6] as [number, number],
  minZoom: 4.6,
  maxZoom: 13,
  geocodeCountry: 'gh',
};

export const GHANA_MAP_LOCATIONS: MapLocation[] = [
    { id: 'accra', name: 'Accra — Independence Square', category: 'Culture & Cities', color: 'hsl(var(--c5-contribute))', lng: -0.1969, lat: 5.5490, desc: "Ghana's capital and the seat of the Black Star Gate, raised for independence in 1957." },
    { id: 'cape-coast', name: 'Cape Coast Castle', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -1.2466, lat: 5.1053, desc: 'A former slave-trading fort on the Gulf of Guinea, and one of the most visited heritage sites in West Africa.' },
    { id: 'elmina', name: 'Elmina Castle', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -1.3506, lat: 5.0843, desc: 'Built by the Portuguese in 1482, the oldest European-built structure in sub-Saharan Africa.' },
    { id: 'assin-manso', name: 'Assin Manso', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -1.35, lat: 5.62, desc: 'Site of the Slave River and the Ancestral Slave Wall of Return, where two diaspora descendants were reburied in 1998.' },
    { id: 'kakum', name: 'Kakum National Park', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: -1.3833, lat: 5.35, desc: "Home to one of Africa's few rainforest canopy walkways, in the Central Region." },
    { id: 'kumasi', name: 'Kumasi — Manhyia Palace', category: 'Culture & Cities', color: 'hsl(var(--c5-contribute))', lng: -1.6146, lat: 6.6968, desc: 'Seat of the Ashanti king and the historic capital of the Ashanti Kingdom.' },
    { id: 'akosombo', name: 'Akosombo Dam & Lake Volta', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: 0.0567, lat: 6.2966, desc: 'The dam that created Lake Volta, one of the largest man-made lakes in the world.' },
    { id: 'mole', name: 'Mole National Park', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: -1.85, lat: 9.7333, desc: "Ghana's largest wildlife refuge, home to elephants and over 300 recorded bird species." },
    { id: 'tamale', name: 'Tamale', category: 'Culture & Cities', color: 'hsl(var(--c5-contribute))', lng: -0.8393, lat: 9.4008, desc: 'The largest city in northern Ghana and a hub of Dagomba heritage.' },
    { id: 'wli', name: 'Wli Waterfalls', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: 0.5667, lat: 7.1167, desc: 'The tallest waterfall in West Africa, in the Agumatsa Wildlife Sanctuary.' },
    { id: 'osu-castle', name: 'Osu Castle (Fort Christiansborg)', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -0.1739, lat: 5.5486, desc: 'A seaside fort in Accra built by the Danish in the 1660s, later the seat of government for decades.' },
    { id: 'aburi', name: 'Aburi Botanical Gardens', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: -0.1667, lat: 5.85, desc: 'Cool hillside gardens outside Accra, planted in 1890 and home to towering rubber and silk cotton trees.' },
    { id: 'paga', name: 'Paga Crocodile Ponds', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: -1.1167, lat: 10.9833, desc: 'Sacred ponds near the Burkina Faso border where crocodiles have lived alongside the community for generations.' },
    { id: 'larabanga', name: 'Larabanga Mosque', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -1.85, lat: 9.2167, desc: 'A Sudanese-style mud-and-timber mosque near Mole, among the oldest in West Africa.' },
    { id: 'bonwire', name: 'Bonwire', category: 'Culture & Cities', color: 'hsl(var(--c5-contribute))', lng: -1.4667, lat: 6.7167, desc: 'The Ashanti village credited as the birthplace of kente cloth, still home to its weavers.' },
    { id: 'ada-foah', name: 'Ada Foah', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: 0.6333, lat: 5.7833, desc: 'Where the Volta River meets the Atlantic, a landscape of sandbars, estuary, and fishing villages.' },
    { id: 'nzulezu', name: 'Nzulezu Stilt Village', category: 'Heritage & Memory', color: 'var(--color-primary)', lng: -2.5667, lat: 5.0333, desc: 'A village built entirely on stilts over Lake Tadane, inhabited for centuries by the Nzema people.' },
    { id: 'tafi-atome', name: 'Tafi Atome Monkey Sanctuary', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: 0.4667, lat: 7.1333, desc: 'A Volta Region forest where Mona monkeys have been protected as sacred for generations.' },
    { id: 'bosumtwi', name: 'Lake Bosumtwi', category: 'Nature & Landscape', color: 'var(--color-accent)', lng: -1.4167, lat: 6.5, desc: "Ghana's only natural lake, formed by a meteorite impact and held sacred by the Ashanti." },
    { id: 'jamestown', name: 'Jamestown, Accra', category: 'Culture & Cities', color: 'hsl(var(--c5-contribute))', lng: -0.2167, lat: 5.5333, desc: 'A historic fishing quarter in Accra, known for its lighthouse, boxing gyms, and the annual Chale Wote festival.' },
  ];

export const AFRICAN_COUNTRIES: [string, string][] = [
    ['Nigeria', 'west-africa/nigeria'], ['Senegal', 'west-africa/senegal'], ["Cote d'Ivoire", 'west-africa/cote-divoire'], ['Togo', 'west-africa/togo'], ['Benin', 'west-africa/benin'], ['Burkina Faso', 'west-africa/burkina-faso'], ['Liberia', 'west-africa/liberia'], ['Sierra Leone', 'west-africa/sierra-leone'], ['Mali', 'west-africa/mali'], ['Gambia', 'west-africa/gambia'], ['Guinea', 'west-africa/guinea'], ['Niger', 'west-africa/niger'],
    ['Kenya', 'east-africa/kenya'], ['Ethiopia', 'east-africa/ethiopia'], ['Tanzania', 'east-africa/tanzania'], ['Uganda', 'east-africa/uganda'], ['Rwanda', 'east-africa/rwanda'], ['Somalia', 'east-africa/somalia'],
    ['South Africa', 'southern-africa/south-africa'], ['Zimbabwe', 'southern-africa/zimbabwe'], ['Botswana', 'southern-africa/botswana'], ['Zambia', 'southern-africa/zambia'], ['Namibia', 'southern-africa/namibia'], ['Mozambique', 'southern-africa/mozambique'],
    ['Egypt', 'north-africa/egypt'], ['Morocco', 'north-africa/morocco'], ['Algeria', 'north-africa/algeria'], ['Tunisia', 'north-africa/tunisia'],
    ['Cameroon', 'central-africa/cameroon'], ['DR Congo', 'central-africa/dr-congo'], ['Congo', 'central-africa/congo'], ['Gabon', 'central-africa/gabon'], ['Angola', 'central-africa/angola'],
  ];

export const SECTIONS_BY_PATHWAY: Record<PathwayId, PathwaySection[]> = {
    'history': [],
    'culture': [
      { type: "lede", body: "Culture in Ghana is not preserved behind glass. It is spoken, cooked, worn, and released on streaming platforms every Friday." },
      { type: "topic", title: "Language", body: "English is official. Twi and the Akan family carry daily life for millions, alongside Ga, Ewe, Dagbani, and dozens more. Learning a greeting is the cheapest ticket home." },
      { type: "topic", title: "Tradition and authority", body: "Chieftaincy remains a living institution, from the Asantehene's court to town stools. Festivals like Homowo, Aboakyer, and Akwasidae mark the calendar, and a child's day name, Kofi, Ama, Kwame, tells you the weekday they arrived." },
      { type: "topic", title: "The table", body: "Jollof worth arguing about, waakye at breakfast, banku with tilapia, fufu with light soup, kelewele after dark. Food is the first language most returnees recover." },
      { type: "topic", title: "Now playing", body: "Highlife became hiplife became a pipeline into global afrobeats. Ghana's musicians, filmmakers, and designers are exporting culture in real time. A younger diaspora often meets Ghana here first, and that counts as heritage too." },
      { type: "photo", photoId: "culture", placeholder: "Drop a photo: a festival, a kitchen, a stage" },
    ],
    'news': [
      { type: "lede", body: "Not a feed. A briefing. Stories chosen for someone reading from Atlanta, London, or Kingston, with the context a headline never carries." },
      { type: "topic", title: "What we cover", body: "Three lanes, each chosen for what it means to someone living abroad.", items: [
        { t: "Business and economy.", d: "Where the cedi, markets, and major projects are moving." },
        { t: "Policy and government.", d: "Changes in law and administration that reach the diaspora directly." },
        { t: "Community.", d: "What DNA members and chapters from Ghana are doing." },
      ] },
      { type: "note", body: "Every story is dated and sourced. If it cannot be verified, it does not run." },
    ],
    'government': [
      { type: "lede", body: "How Ghana is governed, how it reaches you, and how to reach it back." },
      { type: "topic", title: "The structure", body: "A unitary presidential republic under the 1992 constitution. An elected president, a single-chamber Parliament, an independent judiciary, and a two-party rhythm that has transferred power peacefully since 1993." },
      { type: "topic", title: "Current administration", body: "Officeholders change, and stale information here would cost this page its credibility. Administration details are published with a verification date and updated after every election and reshuffle." },
      { type: "note", body: "Last verified: pending first editorial review. This stamp updates after every election and reshuffle." },
      { type: "topic", title: "Region 17, since December 2025", body: "Ghana's President formally declared the African diaspora the country's seventeenth region, structural rather than symbolic. Every Ghanaian abroad, and every person of African descent, now has a direct stake in Ghana's development. The Embassy of Ghana in Washington coordinates the US side of the network." },
      { type: "topic", title: "Policy that reaches you", body: "The three provisions every diaspora member should know by name.", items: [
        { t: "Dual citizenship.", d: "Recognized under the Citizenship Act, 2000. Ghana does not make you choose." },
        { t: "Right of Abode.", d: "Indefinite residence for persons of African descent, distinct from citizenship." },
        { t: "Diaspora voting.", d: "Provided for in law under ROPAA; implementation is still unfolding." },
        { t: "Region 17.", d: "Declared by President Mahama in December 2025: the global diaspora is now formally Ghana's seventeenth region, with a direct line to the Embassy network and national development planning." },
      ] },
      { type: "topic", title: "Reaching Ghana", body: "Embassies and consulates worldwide, the Diaspora Affairs Office at the Office of the President, and the ministries a returnee actually needs. The verified directory publishes here." },
    ],
    'investment': [
      { type: "lede", body: "Ghana wants diaspora capital, and it says so formally. This pathway shows the opportunity and names the risk, because a page that only sells is not one you should trust." },
      { type: "topic", title: "The macro picture", body: "Ghana's economy is recovering with real force: 5.5% real GDP growth projected for 2025, inflation down to 3.8% from 12.1% a year earlier, and a Fitch upgrade to B- after completing debt restructuring. A market of over 30 million people, host of the AfCFTA secretariat, and eight successful elections since 1992 with peaceful transitions of power. Real progress, and real currency pressure both belong in your model." },
      { type: "topic", title: "Where capital is invited", body: "The sectors actively courting diaspora investment, as identified by the Embassy's Region 17 initiative and the Ghana Investment Promotion Centre.", items: [
        { t: "Agribusiness.", d: "From cocoa processing to food logistics." },
        { t: "Technology.", d: "Accra's startup and fintech corridor." },
        { t: "Manufacturing and energy.", d: "AfCFTA positioning and industrial zones." },
        { t: "Tourism and property.", d: "Heritage travel and the housing demand it creates." },
      ] },
      { type: "topic", title: "Formal instruments", body: "The Ghana Investment Promotion Centre registers and protects foreign investment, and diaspora-directed instruments like bonds appear as government programs. Formal always beats informal here." },
      { type: "risk", title: "Read this before you wire anything", items: [
        { t: "Currency risk.", d: "The cedi moves. Price your returns in the currency you will actually spend." },
        { t: "Regulatory risk.", d: "Rules change between administrations. Anything worth doing has paperwork you can verify." },
        { t: "Fraud patterns.", d: "Guaranteed returns, pressure to send money through relatives, and deals that cannot survive a lawyer's phone call. All three target the diaspora specifically." },
      ] },
    ],
    'real-estate': [
      { type: "verify", kicker: "Before anything else", title: "Verify the title before money moves", body: "Land fraud against diaspora buyers is common, expensive, and built on one assumption: that you will not check. Check.", items: [
        { num: "01", t: "Search the title.", d: "A records search at the Lands Commission confirms who actually owns what you are being sold." },
        { num: "02", t: "Survey the plot.", d: "A licensed surveyor confirms the boundaries match the documents." },
        { num: "03", t: "Hire your own lawyer.", d: "Yours, not the seller's, and not a relative doing you a favor." },
        { num: "04", t: "See it, or send someone you trust.", d: "Every step above happens before any money moves. No exceptions for family." },
      ] },
      { type: "topic", title: "How land actually works", body: "Most land in Ghana is customary, held by stools, skins, and families, and most transactions are long leaseholds rather than freehold. Neither fact is a problem. Not knowing them is." },
      { type: "topic", title: "Buying from abroad", body: "Expect a leasehold, a registered deed, and a process measured in months. Anything moving faster than that is a signal, not a convenience." },
      { type: "topic", title: "Family land", body: "Many diaspora members are not buying, they are inheriting, and family land carries its own rules and its own disputes. Document everything early, while the elders who know the history can still speak to it." },
      { type: "topic", title: "Managing from a distance", body: "Property management, tenancy, and construction oversight can all run from abroad, under the same rule as everything else on this page: verified professionals, written agreements." },
    ],
    'tourism': [
      { type: "lede", body: "For most visitors Ghana is a destination. For the diaspora it is a pilgrimage first, and a great trip second." },
      { type: "topic", title: "The pilgrimage", body: "Cape Coast and Elmina ask something of you. Go with a guide who understands the history, give the day nothing else, and do not schedule a beach afternoon behind it. Many describe the Door of No Return as the moment the word diaspora stopped being abstract." },
      { type: "topic", title: "Homecoming seasons", body: "The Year of Return became Beyond the Return, and December in Accra is now a global gathering. Book months ahead, or come in the green season and have the country to yourself." },
      { type: "topic", title: "The practical part", body: "The logistics, minus the guesswork.", items: [
        { t: "Visas.", d: "Most travelers need one in advance; homecoming seasons have brought waiver windows. Check current rules before booking." },
        { t: "Getting there.", d: "Direct routes connect Accra to US, UK, and European hubs." },
        { t: "Timing.", d: "December for the gathering, the rest of the year for the country." },
      ] },
      { type: "topic", title: "Beyond the coast", body: "Kakum's canopy walk, Mole's elephants, Lake Volta, the Ada estuary, and Kumasi, still a royal capital." },
      { type: "photo", photoId: "tourism", placeholder: "Drop a photo: the coast, Kakum canopy walk, or December in Accra" },
    ],
    'relocation-citizenship': [
      { type: "lede", body: "This is the high-stakes pathway. Everything here deserves a lawyer's confirmation, and this page will always tell you when it is describing law rather than giving advice." },
      { type: "topic", title: "Dual citizenship", body: "Ghana recognizes dual citizenship under the Citizenship Act, 2000. The application runs through the Ministry of the Interior, and you keep the passport you already hold." },
      { type: "topic", title: "Right of Abode", body: "Distinct from citizenship and widely confused with it: an indefinite right to live and work in Ghana for persons of African descent. Fewer rights than a citizen, far more than a visa." },
      { type: "topic", title: "Visas and residency", body: "Long-stay visas, work permits, and residence permits run through the Ghana Immigration Service, each with its own renewals and requirements." },
      { type: "topic", title: "Moving with a family", body: "International and private schools in Accra and Kumasi, NHIS plus private healthcare, and the honest texture of a move: power, traffic, and paperwork are real, and so is the life on the other side of them." },
      { type: "topic", title: "The working reality", body: "Salaries are local, opportunity is structural. Diaspora professionals land in tech, finance, health, education, and their own ventures, and remote work has rewritten the math of moving." },
    ],
    'education': [
      { type: "lede", body: "Knowledge is the one thing the diaspora can send home without a wire transfer, and Ghana sends plenty back." },
      { type: "topic", title: "Mentor from where you are", body: "An hour a week from a diaspora engineer, nurse, or founder lands directly in a Ghanaian career. Contribution does not require relocation." },
      { type: "topic", title: "Teach and exchange", body: "Semester exchanges, sabbaticals, and visiting posts at Ghana's universities, and Ghanaian scholars traveling the other way." },
      { type: "topic", title: "Scholarships, both directions", body: "Funding for Ghanaian students abroad and for diaspora students studying in Ghana. Both lists publish here as they are verified." },
      { type: "topic", title: "Heritage programs for youth", body: "Summer and gap-year programs built for diaspora teenagers meeting Ghana for the first time." },
      { type: "topic", title: "Institutional partnerships", body: "School-to-school and university-to-university links, the infrastructure version of everything above." },
    ],
    'community': [
      { type: "lede", body: "Nine pathways of information, and then this: the people. This is where reading about Ghana becomes joining it." },
      { type: "topic", title: "The community right now", body: "DNA's Ghana community is at its founding moment. Every member, chapter, and leader shown here will be real, and the earliest names are the ones this page will remember.", items: [
        { t: "Members.", d: "Be one of the first DNA members from Ghana." },
        { t: "Chapters.", d: "Be the first to convene your city." },
        { t: "Leaders.", d: "Named and pictured here as chapters form." },
      ] },
      { type: "topic", title: "Member stories", body: "The most persuasive thing this page will ever hold is a first-person account from someone who did the thing you are considering. The first story could be yours." },
    ],
  };

export const GHANA_HISTORY_ERAS: HistoryEra[] = [
    { id: 1, year: 'Before 1471', title: 'Sovereign ground', body: 'Long before Europe named it the Gold Coast, the Ashanti, Fante, Ga, Ewe, and Dagomba peoples built kingdoms, courts, and trade routes that moved gold across the Sahara. Kumasi was a capital of real consequence while much of the world had never heard of it.', color: '#006B3F', placeholder: 'Ashanti gold regalia or historic Kumasi', hasPhoto: true },
    { id: 2, year: '1471–1957', title: 'The Gold Coast, and the resistance to it', body: 'European forts rose along the coast from the 1400s, and colonial rule followed. So did resistance: the Anglo-Ashanti wars, and in 1900 Yaa Asantewaa, a queen mother, leading an army against the British Empire itself.', color: '#2b2b2b', placeholder: 'A coastal fort or castle exterior', hasPhoto: true },
    { id: 3, year: '1957', title: 'First', body: 'Kwame Nkrumah declared Ghana\'s independence meaningless unless linked to the total liberation of Africa. Ghana went first in sub-Saharan Africa. The rest of the continent followed.', color: '#CE1126', placeholder: 'Independence declaration, 1957, archival', hasPhoto: true },
    { id: 4, year: '1957–2018', title: 'Building the republic', body: 'Coups, recoveries, and the long work of self-government. Since 1993 the Fourth Republic has held through peaceful transfers of power, a record most of the world still underestimates.', color: '#FCD116', hasPhoto: false },
  ];
export const GHANA_HISTORY_RUPTURE = { kicker: "The diaspora's own origin story", title: 'The Door of No Return', body: 'Cape Coast and Elmina castles stand on Ghana\'s shore as the last African ground millions of ancestors touched before the Atlantic. If your family\'s story passes through that crossing, it may pass through these doors. This is not a chapter in Ghana\'s history. For many people reading this page, it is the beginning of their own.', placeholder: 'Cape Coast Castle, the Door of No Return' };
export const GHANA_HISTORY_TURN = { year: '2019 → 2025', title: 'The Return, then Region 17', body: 'The Year of Return marked 400 years since 1619 and invited the diaspora home. In December 2025, President Mahama took that invitation and made it structural: he declared the global diaspora Ghana\'s seventeenth region, a formal seat alongside Ghana\'s sixteen administrative regions. The door the trade forced open now opens permanently, and it has an address.' };
