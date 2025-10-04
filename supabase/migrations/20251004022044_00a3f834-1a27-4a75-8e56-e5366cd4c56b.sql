-- RLS Policies v1.4 - Basic policies without complex checks
DROP POLICY IF EXISTS "orgs_view" ON organizations; CREATE POLICY "orgs_view" ON organizations FOR SELECT USING (true);
DROP POLICY IF EXISTS "orgs_create" ON organizations; CREATE POLICY "orgs_create" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
DROP POLICY IF EXISTS "orgs_update" ON organizations; CREATE POLICY "orgs_update" ON organizations FOR UPDATE USING (owner_user_id = auth.uid());
DROP POLICY IF EXISTS "opps_view" ON opportunities; CREATE POLICY "opps_view" ON opportunities FOR SELECT USING (true);
DROP POLICY IF EXISTS "opps_create" ON opportunities; CREATE POLICY "opps_create" ON opportunities FOR INSERT WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "opps_update" ON opportunities; CREATE POLICY "opps_update" ON opportunities FOR UPDATE USING (created_by = auth.uid());
DROP POLICY IF EXISTS "apps_view" ON opportunity_applications; CREATE POLICY "apps_view" ON opportunity_applications FOR SELECT USING (applicant_id = auth.uid());
DROP POLICY IF EXISTS "apps_create" ON opportunity_applications; CREATE POLICY "apps_create" ON opportunity_applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
DROP POLICY IF EXISTS "contributions_view" ON opportunity_contributions; CREATE POLICY "contributions_view" ON opportunity_contributions FOR SELECT USING (contributor_id = auth.uid());
DROP POLICY IF EXISTS "user_roles_view" ON user_roles; CREATE POLICY "user_roles_view" ON user_roles FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "user_roles_admin" ON user_roles; CREATE POLICY "user_roles_admin" ON user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "skills_view" ON skills; CREATE POLICY "skills_view" ON skills FOR SELECT USING (true);
DROP POLICY IF EXISTS "causes_view" ON causes; CREATE POLICY "causes_view" ON causes FOR SELECT USING (true);
INSERT INTO skills (name, category) VALUES ('JavaScript', 'technical'), ('Python', 'technical'), ('React', 'technical'), ('Design', 'creative'), ('Product Management', 'business'), ('Marketing', 'business'), ('Fundraising', 'business'), ('Legal', 'business'), ('Strategy', 'business'), ('Education', 'domain') ON CONFLICT (name) DO NOTHING;
INSERT INTO causes (name, description, icon) VALUES ('Education', 'Advancing educational opportunities across Africa', '📚'), ('Healthcare', 'Improving health outcomes and access', '🏥'), ('Climate & Environment', 'Environmental sustainability and climate action', '🌍'), ('Economic Development', 'Job creation and economic empowerment', '💼'), ('Governance', 'Strengthening democratic institutions', '⚖️'), ('Arts & Culture', 'Preserving and promoting African culture', '🎨'), ('Technology', 'Digital transformation and tech access', '💻'), ('Diaspora Engagement', 'Connecting diaspora with home communities', '🌐') ON CONFLICT (name) DO NOTHING;