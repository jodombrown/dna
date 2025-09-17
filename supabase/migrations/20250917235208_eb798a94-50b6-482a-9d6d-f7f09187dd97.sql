-- Create hierarchical geographic structure for DNA platform
-- Continent → Region → Country → Province/City

-- CONTINENTS (e.g., Africa, Europe, etc.)
CREATE TABLE continents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- REGIONS (e.g., North Africa, West Africa, East Africa, etc.)
CREATE TABLE regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  continent_id UUID NOT NULL REFERENCES continents(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, continent_id)
);

-- COUNTRIES (linked to region)
CREATE TABLE countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  iso_code TEXT UNIQUE, -- for mapping/standardization
  capital TEXT,
  population BIGINT,
  description TEXT,
  flag_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, region_id)
);

-- PROVINCES / CITIES (linked to country)
CREATE TABLE provinces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  province_type TEXT DEFAULT 'province', -- province, city, state, etc.
  population INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, country_id)
);

-- ECONOMIC INDICATORS (works at region, country, or province level)
CREATE TABLE economic_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES regions(id),
  country_id UUID REFERENCES countries(id),
  province_id UUID REFERENCES provinces(id),
  indicator_type TEXT NOT NULL, -- GDP, inflation, FDI, remittances, etc.
  value NUMERIC NOT NULL,
  unit TEXT, -- $, %, etc.
  year INTEGER NOT NULL,
  month INTEGER, -- optional, if monthly
  source TEXT, -- World Bank, IMF, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- INNOVATION DATA (startups, hubs, accelerators)
CREATE TABLE innovation_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES countries(id),
  province_id UUID REFERENCES provinces(id),
  name TEXT NOT NULL, -- startup, hub, program
  organization_type TEXT NOT NULL, -- startup, accelerator, hub, vc, etc.
  sector TEXT,
  description TEXT,
  founded_year INTEGER,
  website TEXT,
  logo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  funding_amount NUMERIC,
  funding_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DIASPORA DATA (remittances + projects/stories)
CREATE TABLE diaspora_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID REFERENCES countries(id),
  project_name TEXT,
  story_title TEXT,
  story_content TEXT,
  diaspora_name TEXT,
  diaspora_location TEXT, -- where diaspora is based
  remittance_value NUMERIC, -- optional if story-based
  currency TEXT DEFAULT 'USD',
  project_type TEXT, -- investment, remittance, social_impact, etc.
  year INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- POLITICAL DIGEST (monthly or quarterly summaries)
CREATE TABLE political_digest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  risk_level TEXT DEFAULT 'medium', -- low, medium, high
  policy_changes TEXT,
  elections_upcoming BOOLEAN DEFAULT FALSE,
  reforms_highlight TEXT,
  report_date DATE NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NEWSLETTER SUBSCRIPTIONS (for regional updates)
CREATE TABLE newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  region_interest UUID REFERENCES regions(id),
  country_interests UUID[], -- array of country IDs
  subscription_type TEXT DEFAULT 'monthly', -- monthly, quarterly
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- MONTHLY REPORTS (aggregated insights)
CREATE TABLE monthly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES regions(id),
  country_id UUID REFERENCES countries(id),
  report_month INTEGER NOT NULL,
  report_year INTEGER NOT NULL,
  economic_summary TEXT,
  innovation_highlight TEXT,
  political_summary TEXT,
  diaspora_spotlight TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(region_id, country_id, report_month, report_year)
);

-- Enable RLS on all tables
ALTER TABLE continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE innovation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaspora_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE political_digest ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Public read access for most data (since this is for public landing pages)
CREATE POLICY "Public can read continents" ON continents FOR SELECT USING (true);
CREATE POLICY "Public can read regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Public can read countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Public can read provinces" ON provinces FOR SELECT USING (true);
CREATE POLICY "Public can read economic indicators" ON economic_indicators FOR SELECT USING (true);
CREATE POLICY "Public can read innovation data" ON innovation_data FOR SELECT USING (true);
CREATE POLICY "Public can read published diaspora data" ON diaspora_data FOR SELECT USING (featured = true);
CREATE POLICY "Public can read published political digest" ON political_digest FOR SELECT USING (true);
CREATE POLICY "Public can read published monthly reports" ON monthly_reports FOR SELECT USING (is_published = true);

-- Newsletter subscriptions - users can manage their own
CREATE POLICY "Users can create newsletter subscriptions" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own subscriptions" ON newsletter_subscriptions FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin policies for content management
CREATE POLICY "Admins can manage all data" ON continents FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage regions" ON regions FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage countries" ON countries FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage provinces" ON provinces FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage economic indicators" ON economic_indicators FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage innovation data" ON innovation_data FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage diaspora data" ON diaspora_data FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage political digest" ON political_digest FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can manage monthly reports" ON monthly_reports FOR ALL USING (is_admin_user(auth.uid()));
CREATE POLICY "Admins can view all newsletter subscriptions" ON newsletter_subscriptions FOR SELECT USING (is_admin_user(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_countries_region ON countries(region_id);
CREATE INDEX idx_provinces_country ON provinces(country_id);
CREATE INDEX idx_economic_indicators_country ON economic_indicators(country_id);
CREATE INDEX idx_economic_indicators_date ON economic_indicators(year, month);
CREATE INDEX idx_innovation_data_country ON innovation_data(country_id);
CREATE INDEX idx_diaspora_data_country ON diaspora_data(country_id);
CREATE INDEX idx_political_digest_country ON political_digest(country_id);
CREATE INDEX idx_political_digest_date ON political_digest(report_date);
CREATE INDEX idx_monthly_reports_region_date ON monthly_reports(region_id, report_year, report_month);

-- Insert initial data for Africa and North Africa
INSERT INTO continents (name, description) VALUES 
('Africa', 'The African continent - home to 54 countries and vibrant diaspora communities worldwide');

INSERT INTO regions (name, continent_id, description) VALUES 
('North Africa', (SELECT id FROM continents WHERE name = 'Africa'), 'Countries in Northern Africa including Morocco, Algeria, Tunisia, Libya, Egypt, and Sudan');

-- Insert North African countries
INSERT INTO countries (name, region_id, iso_code, capital, population, description) VALUES 
('Morocco', (SELECT id FROM regions WHERE name = 'North Africa'), 'MA', 'Rabat', 37000000, 'Kingdom of Morocco - gateway between Africa and Europe'),
('Algeria', (SELECT id FROM regions WHERE name = 'North Africa'), 'DZ', 'Algiers', 45000000, 'People''s Democratic Republic of Algeria - largest country in Africa'),
('Tunisia', (SELECT id FROM regions WHERE name = 'North Africa'), 'TN', 'Tunis', 12000000, 'Republic of Tunisia - birthplace of the Arab Spring'),
('Libya', (SELECT id FROM regions WHERE name = 'North Africa'), 'LY', 'Tripoli', 7000000, 'State of Libya - oil-rich North African nation'),
('Egypt', (SELECT id FROM regions WHERE name = 'North Africa'), 'EG', 'Cairo', 105000000, 'Arab Republic of Egypt - ancient civilization meets modern innovation'),
('Sudan', (SELECT id FROM regions WHERE name = 'North Africa'), 'SD', 'Khartoum', 45000000, 'Republic of Sudan - crossroads of Africa and the Arab world');