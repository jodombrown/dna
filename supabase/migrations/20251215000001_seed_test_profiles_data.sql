-- Migration: Seed 5 complete test profiles for FoR testing
-- These profiles will be accessible at /dna/{username}
--
-- Profiles:
-- 1. /dna/amara_okonkwo - Fintech Entrepreneur (Nigeria/UK)
-- 2. /dna/dr_kwame_asante - Clean Energy Researcher (Ghana/Canada)
-- 3. /dna/fatima_diallo - Cultural Entrepreneur (Senegal/France)
-- 4. /dna/david_mwangi - Healthcare Innovator (Kenya/Germany)
-- 5. /dna/zara_temba - EdTech Founder (South Africa/USA)

-- First, ensure test account columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_test_account') THEN
    ALTER TABLE public.profiles ADD COLUMN is_test_account BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'auto_connect_enabled') THEN
    ALTER TABLE public.profiles ADD COLUMN auto_connect_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Delete existing test profiles if they exist (for re-running)
DELETE FROM public.posts WHERE author_id IN (
  'test-profile-001-amara-fintech',
  'test-profile-002-kwame-energy',
  'test-profile-003-fatima-culture',
  'test-profile-004-david-health',
  'test-profile-005-zara-education'
);

DELETE FROM public.connections WHERE requester_id IN (
  'test-profile-001-amara-fintech',
  'test-profile-002-kwame-energy',
  'test-profile-003-fatima-culture',
  'test-profile-004-david-health',
  'test-profile-005-zara-education'
) OR recipient_id IN (
  'test-profile-001-amara-fintech',
  'test-profile-002-kwame-energy',
  'test-profile-003-fatima-culture',
  'test-profile-004-david-health',
  'test-profile-005-zara-education'
);

DELETE FROM public.profiles WHERE id IN (
  'test-profile-001-amara-fintech',
  'test-profile-002-kwame-energy',
  'test-profile-003-fatima-culture',
  'test-profile-004-david-health',
  'test-profile-005-zara-education'
);

-- ============================================================
-- INSERT 5 TEST PROFILES
-- ============================================================

INSERT INTO public.profiles (
  id, username, email, full_name, first_name, last_name, display_name,
  headline, professional_role, company, bio, intro_text,
  avatar_url, banner_url,
  location, current_city, current_country, country_of_origin,
  diaspora_origin, diaspora_status, diaspora_story, diaspora_networks,
  ethnic_heritage, african_causes, engagement_intentions, return_intentions, africa_visit_frequency,
  profession, industry, years_experience, years_in_diaspora,
  skills, interests, impact_areas, focus_areas, regional_expertise,
  mentorship_areas, available_for, professional_sectors, industries, languages,
  website_url, linkedin_url, twitter_url, instagram_url, github_url, intro_video_url,
  user_type, selected_pillars, verification_status,
  is_public, is_seeded, is_test_account, auto_connect_enabled,
  onboarding_completed, profile_completeness_score, agrees_to_values
) VALUES

-- PROFILE 1: AMARA OKONKWO - Fintech Entrepreneur
(
  'test-profile-001-amara-fintech',
  'amara_okonkwo',
  'amara.test@dna-platform.test',
  'Amara Okonkwo',
  'Amara',
  'Okonkwo',
  'Amara Okonkwo',
  'Building Financial Inclusion for African Communities | Fintech Founder | Impact Investor',
  'CEO & Co-founder',
  'AfriPay Technologies',
  E'Passionate fintech entrepreneur with 10+ years of experience building payment solutions that bridge the financial gap between the African diaspora and their home communities.\n\nAfter witnessing my grandmother struggle to receive remittances in rural Nigeria, I founded AfriPay to create seamless, affordable cross-border payment solutions. Today, we serve over 500,000 users across 15 African countries.\n\nI believe financial inclusion is the foundation for sustainable development in Africa. Through AfriPay, we''ve reduced remittance fees by 70% and enabled micro-investments that are transforming communities.\n\nWhen I''m not building products, I mentor young African entrepreneurs and invest in early-stage startups focused on financial services and agricultural technology.',
  'Building the future of African financial services from London. Always excited to connect with fellow entrepreneurs working on impact-driven solutions for our communities.',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=400&fit=crop',
  'London, United Kingdom',
  'London',
  'United Kingdom',
  'Nigeria',
  'Nigeria',
  'First-Gen',
  'Moved to London for my MBA at LSE in 2012. What started as a temporary move became a launching pad for my mission to transform financial services for Africans worldwide.',
  ARRAY['Nigeria', 'West Africa', 'UK African Diaspora'],
  ARRAY['Igbo', 'Nigerian'],
  ARRAY['Financial Inclusion', 'Youth Entrepreneurship', 'Digital Infrastructure'],
  ARRAY['Mentorship', 'Investment', 'Partnerships'],
  'Planning to relocate back within 5 years',
  '4-6 times per year',
  'Entrepreneur',
  'Financial Technology',
  10,
  12,
  ARRAY['Fintech', 'Product Strategy', 'Fundraising', 'Team Leadership', 'Cross-border Payments', 'Mobile Money', 'Financial Modeling', 'Regulatory Compliance'],
  ARRAY['African Innovation', 'Financial Inclusion', 'Mentorship', 'Tech Policy', 'Angel Investing', 'Women in Tech'],
  ARRAY['Financial Inclusion', 'Economic Empowerment', 'Technology Access'],
  ARRAY['Mobile Payments', 'Remittances', 'Micro-investments'],
  ARRAY['West Africa', 'East Africa', 'United Kingdom'],
  ARRAY['Startup Fundraising', 'Product Development', 'Fintech Regulations'],
  ARRAY['Mentoring', 'Speaking', 'Advisory', 'Investing'],
  ARRAY['Fintech', 'Financial Services', 'Technology'],
  ARRAY['Financial Technology', 'Banking', 'Payments'],
  ARRAY['English', 'Igbo', 'Yoruba', 'French'],
  'https://afripay-tech.example.com',
  'https://linkedin.com/in/amaraokonkwo-test',
  'https://twitter.com/amara_fintech_test',
  'https://instagram.com/amara_okonkwo_test',
  NULL,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'founder',
  ARRAY['collaborate', 'contribute'],
  'soft_verified',
  true, true, true, true,
  true, 100, true
),

-- PROFILE 2: DR. KWAME ASANTE - Clean Energy Researcher
(
  'test-profile-002-kwame-energy',
  'dr_kwame_asante',
  'kwame.test@dna-platform.test',
  'Dr. Kwame Asante',
  'Kwame',
  'Asante',
  'Dr. Kwame Asante',
  'Renewable Energy Researcher | Solar Technology Expert | Sustainable Development Advocate',
  'Senior Research Scientist',
  'University of Toronto Energy Institute',
  E'Award-winning research scientist specializing in renewable energy solutions tailored for African markets. With 15+ years of experience and 25 published papers, my work focuses on developing affordable solar technology for rural electrification.\n\nBorn in Kumasi, Ghana, I''ve witnessed firsthand how lack of electricity limits opportunities. This drives my research on low-cost solar solutions that can power schools, health clinics, and small businesses across Africa.\n\nMy recent breakthrough in solar panel efficiency has reduced costs by 40% while improving durability for tropical climates. Currently leading a $5M research project funded by the Gates Foundation to deploy this technology across Ghana and Kenya.\n\nI''m passionate about training the next generation of African scientists and regularly host research interns from universities across the continent.',
  'Dedicated to developing clean energy solutions that can transform African communities. Looking to collaborate on research and implementation projects.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=400&fit=crop',
  'Toronto, Canada',
  'Toronto',
  'Canada',
  'Ghana',
  'Ghana',
  'First-Gen',
  'Came to Canada for my PhD at University of Toronto in 2009. After completing my doctorate, I stayed to continue research but maintain strong ties with Ghanaian universities and regularly collaborate on projects in West Africa.',
  ARRAY['Ghana', 'West Africa', 'Canadian African Diaspora'],
  ARRAY['Akan', 'Ghanaian'],
  ARRAY['Climate Change', 'Rural Electrification', 'STEM Education'],
  ARRAY['Research Collaboration', 'Technology Transfer', 'Mentorship'],
  'Planning split time between Canada and Ghana',
  '3-4 times per year',
  'Research Scientist',
  'Clean Energy',
  15,
  14,
  ARRAY['Solar Technology', 'Research & Development', 'Grant Writing', 'Data Analysis', 'Project Management', 'Technical Writing', 'Lab Management', 'Policy Analysis'],
  ARRAY['Climate Change', 'Sustainable Development', 'Education', 'Policy Advocacy', 'Youth Mentorship', 'Technology Transfer'],
  ARRAY['Climate Action', 'Energy Access', 'Education'],
  ARRAY['Solar Energy', 'Rural Electrification', 'Sustainable Technology'],
  ARRAY['Ghana', 'Kenya', 'West Africa', 'East Africa'],
  ARRAY['Research Methodology', 'Grant Writing', 'Academic Publishing'],
  ARRAY['Research Collaboration', 'Speaking', 'Consulting', 'Mentoring'],
  ARRAY['Clean Energy', 'Academia', 'Research'],
  ARRAY['Renewable Energy', 'Higher Education', 'Climate Tech'],
  ARRAY['English', 'Twi', 'French'],
  'https://kwameasante-research.example.com',
  'https://linkedin.com/in/drkwameasante-test',
  'https://twitter.com/kwame_energy_test',
  'https://instagram.com/dr_kwame_test',
  'https://github.com/kwame-energy-test',
  NULL,
  'professional',
  ARRAY['contribute', 'connect'],
  'fully_verified',
  true, true, true, true,
  true, 100, true
),

-- PROFILE 3: FATIMA DIALLO - Cultural Entrepreneur
(
  'test-profile-003-fatima-culture',
  'fatima_diallo',
  'fatima.test@dna-platform.test',
  'Fatima Diallo',
  'Fatima',
  'Diallo',
  'Fatima Diallo',
  'Creative Director | African Art Curator | Cultural Entrepreneur | Building Bridges Through Art',
  'Creative Director & Founder',
  'Afrique Moderne Gallery',
  E'Creative director and cultural entrepreneur on a mission to bring African contemporary art to global audiences. Founder of Afrique Moderne, a gallery network with locations in Paris, Dakar, and soon, New York.\n\nBorn in Saint-Louis, Senegal, I grew up surrounded by the vibrant artistic traditions of West Africa. After studying art history at the Sorbonne, I realized that African artists were severely underrepresented in the global art market.\n\nOver the past 12 years, I''ve curated 50+ exhibitions featuring emerging and established African artists, generating over $10M in sales and helping launch the careers of 100+ artists from across the continent.\n\nMy newest initiative, the African Creators Fund, provides grants and mentorship to young African artists and artisans, helping them build sustainable creative businesses.',
  'Bridging African creativity with global audiences. Passionate about empowering the next generation of African artists and creatives.',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop',
  'Paris, France',
  'Paris',
  'France',
  'Senegal',
  'Senegal',
  'First-Gen',
  E'Arrived in Paris at 18 for university and fell in love with the city''s art scene. Now I split my time between Paris and Dakar, using both cities as platforms to showcase African creativity to the world.',
  ARRAY['Senegal', 'West Africa', 'French African Diaspora'],
  ARRAY['Wolof', 'Senegalese'],
  ARRAY['Cultural Preservation', 'Youth Empowerment', 'Creative Economy'],
  ARRAY['Artist Partnerships', 'Cultural Exchange', 'Investment'],
  'Maintaining dual presence',
  '6+ times per year',
  'Cultural Entrepreneur',
  'Arts & Culture',
  12,
  17,
  ARRAY['Creative Direction', 'Art Curation', 'Cultural Programming', 'Community Building', 'Event Production', 'Brand Development', 'Fundraising', 'Artist Management'],
  ARRAY['African Art', 'Cultural Preservation', 'Youth Mentorship', 'Creative Economy', 'Fashion', 'Design'],
  ARRAY['Cultural Preservation', 'Economic Empowerment', 'Youth Development'],
  ARRAY['Contemporary Art', 'Cultural Exchange', 'Artist Development'],
  ARRAY['Senegal', 'West Africa', 'France', 'North America'],
  ARRAY['Art Business', 'Gallery Management', 'Cultural Entrepreneurship'],
  ARRAY['Collaboration', 'Speaking', 'Exhibitions', 'Cultural Consulting'],
  ARRAY['Arts & Culture', 'Creative Industries', 'Non-profit'],
  ARRAY['Fine Art', 'Galleries', 'Cultural Organizations'],
  ARRAY['French', 'Wolof', 'English', 'Arabic'],
  'https://afriquemoderne.example.com',
  'https://linkedin.com/in/fatimadiallo-test',
  'https://twitter.com/fatima_culture_test',
  'https://instagram.com/fatima_diallo_art_test',
  NULL,
  'https://vimeo.com/test-video-fatima',
  'founder',
  ARRAY['connect', 'contribute'],
  'soft_verified',
  true, true, true, true,
  true, 100, true
),

-- PROFILE 4: DAVID MWANGI - Healthcare Innovator
(
  'test-profile-004-david-health',
  'david_mwangi',
  'david.test@dna-platform.test',
  'David Mwangi',
  'David',
  'Mwangi',
  'David Mwangi',
  'Healthcare Innovation Consultant | Digital Health Pioneer | Former WHO Program Manager',
  'Healthcare Innovation Consultant',
  'HealthBridge Africa Consulting',
  E'Healthcare innovation consultant with 18 years of experience transforming healthcare delivery systems across Africa. Former WHO program manager who led the implementation of digital health initiatives reaching 20 million people.\n\nGrowing up in Nairobi, I saw how healthcare access could mean the difference between life and death. This drove me to pursue medicine and public health, eventually leading to roles at WHO and various ministries of health across East Africa.\n\nIn 2020, I founded HealthBridge Africa to help governments and organizations implement sustainable digital health solutions. Our telemedicine platform now serves 500+ rural health facilities in Kenya, Uganda, and Tanzania.\n\nI''m particularly passionate about maternal and child health, having designed programs that reduced maternal mortality by 30% in pilot regions.',
  E'Working to revolutionize healthcare delivery across Africa through innovative digital solutions and policy reform. Let''s connect and collaborate!',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop',
  'Berlin, Germany',
  'Berlin',
  'Germany',
  'Kenya',
  'Kenya',
  'First-Gen',
  'Moved to Geneva for WHO work in 2010, then relocated to Berlin in 2018 to be closer to major health tech innovation hubs while maintaining deep ties to East African health systems.',
  ARRAY['Kenya', 'East Africa', 'German African Diaspora'],
  ARRAY['Kikuyu', 'Kenyan'],
  ARRAY['Healthcare Access', 'Maternal Health', 'Digital Infrastructure'],
  ARRAY['Consulting', 'Partnerships', 'Knowledge Sharing'],
  'Regular engagement, potential relocation in 5+ years',
  '5-7 times per year',
  'Healthcare Consultant',
  'Healthcare Technology',
  18,
  13,
  ARRAY['Digital Health', 'Program Management', 'Policy Development', 'Stakeholder Engagement', 'Healthcare Systems', 'Telemedicine', 'Data Analytics', 'Grant Management'],
  ARRAY['Global Health', 'Healthcare Access', 'Digital Innovation', 'Policy Reform', 'Maternal Health', 'Health Equity'],
  ARRAY['Healthcare Access', 'Maternal Health', 'Digital Health'],
  ARRAY['Telemedicine', 'Health Policy', 'mHealth Solutions'],
  ARRAY['Kenya', 'East Africa', 'Sub-Saharan Africa', 'Germany'],
  ARRAY['Healthcare Management', 'WHO Career Paths', 'Health Tech Startups'],
  ARRAY['Consulting', 'Advisory', 'Speaking', 'Partnerships'],
  ARRAY['Healthcare', 'Technology', 'International Development'],
  ARRAY['Healthcare Technology', 'Public Health', 'Consulting'],
  ARRAY['English', 'Swahili', 'German', 'French'],
  'https://healthbridge-africa.example.com',
  'https://linkedin.com/in/davidmwangi-test',
  'https://twitter.com/david_health_test',
  'https://instagram.com/david_mwangi_test',
  NULL,
  NULL,
  'professional',
  ARRAY['contribute', 'collaborate'],
  'fully_verified',
  true, true, true, true,
  true, 100, true
),

-- PROFILE 5: ZARA TEMBA - EdTech Founder
(
  'test-profile-005-zara-education',
  'zara_temba',
  'zara.test@dna-platform.test',
  'Zara Temba',
  'Zara',
  'Temba',
  'Zara Temba',
  'EdTech Founder | MIT PhD Candidate | Democratizing Education Across Africa',
  'Founder & PhD Candidate',
  'LearnAfrica Platform / MIT',
  E'EdTech entrepreneur and MIT PhD candidate building the future of education for African youth. Founder of LearnAfrica, a mobile-first learning platform that has reached 2 million students across 10 African countries.\n\nBorn in Soweto, South Africa, I was one of the lucky ones who had access to quality education. But I saw too many of my peers fall behind due to lack of resources. This inequality drives everything I do.\n\nAt MIT, I''m researching adaptive learning algorithms that can personalize education for students with varying backgrounds and resources. My goal is to create technology that makes quality education accessible to every child in Africa, regardless of their circumstances.\n\nLearnAfrica has partnered with 500+ schools and provides free content in 12 African languages. We''ve also trained 5,000+ teachers in digital pedagogy.',
  'Passionate about solving education access challenges across Africa. Always eager to learn from experienced professionals and find research collaborations.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop',
  'Boston, USA',
  'Boston',
  'United States',
  'South Africa',
  'South Africa',
  'First-Gen',
  'Came to the US in 2019 on a full scholarship to MIT. Founded LearnAfrica during the pandemic when I saw how COVID-19 was devastating education access across Africa. Planning to return after completing my PhD.',
  ARRAY['South Africa', 'Southern Africa', 'US African Diaspora'],
  ARRAY['Zulu', 'South African'],
  ARRAY['Education Access', 'Digital Literacy', 'Youth Empowerment'],
  ARRAY['Research Collaboration', 'Partnerships', 'Fundraising'],
  'Definite return after PhD completion',
  '2-3 times per year',
  'Entrepreneur & Researcher',
  'Education Technology',
  5,
  4,
  ARRAY['EdTech', 'Machine Learning', 'Mobile Development', 'User Experience Design', 'Research', 'Product Management', 'Curriculum Development', 'Data Science'],
  ARRAY['Educational Access', 'Digital Learning', 'Teacher Empowerment', 'Youth Development', 'AI in Education', 'Social Entrepreneurship'],
  ARRAY['Education', 'Digital Literacy', 'Youth Development'],
  ARRAY['Adaptive Learning', 'Mobile Education', 'Teacher Training'],
  ARRAY['South Africa', 'Southern Africa', 'Pan-African'],
  ARRAY['EdTech Startups', 'PhD Applications', 'Social Entrepreneurship'],
  ARRAY['Collaboration', 'Research Partnerships', 'Speaking', 'Mentoring'],
  ARRAY['Education', 'Technology', 'Social Enterprise'],
  ARRAY['Education Technology', 'Higher Education', 'Software'],
  ARRAY['English', 'Zulu', 'Xhosa', 'Afrikaans'],
  'https://learnafrica.example.com',
  'https://linkedin.com/in/zaratemba-test',
  'https://twitter.com/zara_edtech_test',
  'https://instagram.com/zara_temba_test',
  'https://github.com/zara-edtech-test',
  'https://www.youtube.com/watch?v=test-zara-intro',
  'founder',
  ARRAY['connect', 'contribute'],
  'soft_verified',
  true, true, true, true,
  true, 100, true
);

-- ============================================================
-- INSERT POSTS FOR EACH PROFILE
-- ============================================================

-- AMARA's Posts
INSERT INTO public.posts (author_id, content, post_type, privacy_level, is_seeded) VALUES
('test-profile-001-amara-fintech', E'Just closed our Series A! We raised $12M to scale AfriPay across West Africa.\n\nThis funding will help us:\n- Expand to 5 new countries\n- Reduce remittance fees to under 1%\n- Launch our micro-investment feature\n\nGrateful to our investors who believe in financial inclusion for African communities. The journey continues!\n\n#Fintech #AfricanInnovation #SeriesA', 'celebration', 'public', true),
('test-profile-001-amara-fintech', E'Question for the community: What''s the biggest barrier to financial inclusion you''ve seen in your home country?\n\nFor us in Nigeria, it''s been:\n1. Lack of ID documentation\n2. Low smartphone penetration in rural areas\n3. Trust issues with digital platforms\n\nWould love to hear from others working on this challenge.', 'question', 'public', true),
('test-profile-001-amara-fintech', 'The team that''s making it happen! So proud of this incredible group of talented Africans building the future of financial services. Our Lagos office just hit 50 team members!', 'image', 'public', true);

-- KWAME's Posts
INSERT INTO public.posts (author_id, content, post_type, privacy_level, image_url, is_seeded) VALUES
('test-profile-002-kwame-energy', E'Published our latest research findings on solar panel efficiency in tropical climates!\n\nKey highlights:\n- 40% cost reduction while maintaining performance\n- 25-year durability in high-humidity environments\n- Optimized for off-grid rural installations\n\nPaper is now available in Nature Energy. #SolarEnergy #Research #CleanEnergy', 'update', 'public', NULL, true),
('test-profile-002-kwame-energy', 'Field installation day in Northern Ghana! Our team just completed installing solar panels at Tamale Community Health Center. This installation will power essential medical equipment 24/7.', 'image', 'public', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop', true),
('test-profile-002-kwame-energy', E'Researchers and practitioners in the clean energy space - I''d love your input!\n\nWe''re designing our next-gen solar controllers for rural Africa. What features would make the biggest difference?', 'question', 'public', NULL, true);

-- FATIMA's Posts
INSERT INTO public.posts (author_id, content, post_type, privacy_level, image_url, is_seeded) VALUES
('test-profile-003-fatima-culture', E'"Voices of the Diaspora" exhibition opening was a huge success!\n\nOver 500 attendees came to celebrate African contemporary art at our Paris gallery. Featured works from 25 artists across 12 African countries.\n\n#AfricanArt #Diaspora #CulturalExchange', 'celebration', 'public', NULL, true),
('test-profile-003-fatima-culture', 'Behind the scenes at Afrique Moderne Gallery as we prepare for our upcoming exhibition. Each piece tells a story of identity, heritage, and the evolving African narrative.', 'image', 'public', 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop', true),
('test-profile-003-fatima-culture', E'Announcing the African Creators Fund!\n\nAfter 12 years in the art world, I''m launching an initiative to support emerging African artists with:\n- $50,000 in annual grants\n- 6-month mentorship programs\n- Exhibition opportunities\n- Business development training', 'update', 'public', NULL, true);

-- DAVID's Posts
INSERT INTO public.posts (author_id, content, post_type, privacy_level, image_url, is_seeded) VALUES
('test-profile-004-david-health', E'Our telemedicine platform just reached a major milestone: 500 health facilities connected across Kenya, Uganda, and Tanzania!\n\nImpact so far:\n- 2 million patient consultations\n- 30% reduction in referral delays\n- 5,000 healthcare workers trained\n\n#DigitalHealth #Telemedicine', 'update', 'public', NULL, true),
('test-profile-004-david-health', 'Visiting Kisumu County Hospital to see our telemedicine system in action. This nurse is conducting a remote consultation with a specialist in Nairobi.', 'image', 'public', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop', true),
('test-profile-004-david-health', E'Question for the healthcare innovation community:\n\nWhat''s the biggest challenge you face when implementing digital health solutions in African contexts?\n\nWe''ve encountered: connectivity, power reliability, digital literacy, and system integration issues.', 'question', 'public', NULL, true);

-- ZARA's Posts
INSERT INTO public.posts (author_id, content, post_type, privacy_level, image_url, is_seeded) VALUES
('test-profile-005-zara-education', E'LearnAfrica just hit 2 MILLION students!!!\n\nWhen I started this during the pandemic, I never imagined we''d reach so many learners. Now we''re in:\n- 10 African countries\n- 500+ partner schools\n- 12 languages\n\nEvery student deserves access to quality education. #EdTech #EducationForAll', 'celebration', 'public', NULL, true),
('test-profile-005-zara-education', 'Visited one of our partner schools in Soweto last week. Seeing students use LearnAfrica to learn coding, math, and science fills me with so much hope.', 'image', 'public', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop', true),
('test-profile-005-zara-education', E'Exciting news from my PhD research!\n\nOur adaptive learning algorithm has shown promising results:\n- 40% improvement in learning outcomes\n- 60% reduction in time to mastery\n- Works even with intermittent connectivity\n\n#EdTech #AI #Research', 'update', 'public', NULL, true);

-- ============================================================
-- INSERT CONNECTIONS BETWEEN PROFILES
-- ============================================================

INSERT INTO public.connections (requester_id, recipient_id, status, message) VALUES
('test-profile-001-amara-fintech', 'test-profile-002-kwame-energy', 'accepted', 'Hi Kwame! I''ve been following your solar energy work in Ghana. AfriPay is exploring financial solutions for energy access - would love to discuss potential collaboration on pay-as-you-go solar financing.'),
('test-profile-001-amara-fintech', 'test-profile-003-fatima-culture', 'accepted', 'Fatima, your work promoting African artists is inspiring! I''m interested in how AfriPay could help facilitate international art sales and artist payments. Let''s connect!'),
('test-profile-001-amara-fintech', 'test-profile-005-zara-education', 'accepted', 'Hi Zara! Saw your MIT Tech Review feature - congrats! I think there''s interesting overlap between financial literacy and LearnAfrica. Would love to explore adding fintech education content.'),
('test-profile-002-kwame-energy', 'test-profile-004-david-health', 'accepted', 'David, your work on healthcare infrastructure in East Africa aligns perfectly with our solar solutions for health facilities. Let''s discuss how we can work together on rural health electrification.'),
('test-profile-002-kwame-energy', 'test-profile-005-zara-education', 'accepted', 'Zara, our Solar Schools project in Ghana has transformed education outcomes. I''d love to share learnings and explore how LearnAfrica content could complement electrified schools.'),
('test-profile-003-fatima-culture', 'test-profile-004-david-health', 'pending', 'Hi David! I''m exploring how art therapy could complement digital health initiatives. Your work in East Africa is impressive - would love to discuss cultural approaches to health and wellbeing.'),
('test-profile-003-fatima-culture', 'test-profile-005-zara-education', 'accepted', 'Zara, LearnAfrica could be a great platform for art education! I''d love to discuss developing African art history and creative content for your students.'),
('test-profile-004-david-health', 'test-profile-005-zara-education', 'accepted', 'Zara, health education is crucial for our telemedicine programs. Would love to discuss how LearnAfrica could help train community health workers and educate patients.');
