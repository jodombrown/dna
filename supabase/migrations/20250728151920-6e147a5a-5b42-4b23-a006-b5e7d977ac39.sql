-- Add is_seeded column to relevant tables
ALTER TABLE public.profiles ADD COLUMN is_seeded BOOLEAN DEFAULT false;
ALTER TABLE public.contact_requests ADD COLUMN is_seeded BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN is_seeded BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN is_seeded BOOLEAN DEFAULT false;

-- Insert seed profiles data
INSERT INTO public.profiles (
  id, full_name, email, is_seeded, created_at, updated_at, last_seen_at,
  is_public, diaspora_origin, country_of_origin, current_country
) VALUES 
('e819771f-e34b-44b5-b2e2-3171e08d4de0', 'Mary Green', 'mary35@gmail.com', true, now(), now(), '2025-07-06 02:03:18', true, 'Repat', 'Vietnam', 'Libyan Arab Jamahiriya'),
('498bfc69-758c-4d67-8d14-74433cd55b42', 'Rebecca Welch', 'welchrebecca@hotmail.com', true, now(), now(), '2025-07-22 01:33:22', true, 'Ally', 'Togo', 'Cape Verde'),
('91d87022-ddc1-4e21-ab9b-752c6210b0c3', 'Sara Johnson', 'sara93@hotmail.com', true, now(), now(), '2025-07-19 19:52:36', true, 'First-Gen', 'Congo', 'United Kingdom'),
('a6024261-5d3e-47ae-a419-631fcfdaead0', 'Hannah Brown', 'hbrown@jensen-love.com', true, now(), now(), '2025-07-05 03:21:44', true, 'Afro-Latino', 'Romania', 'Canada'),
('4dc37f74-8ca5-4cb4-a9b8-dd8866db6b3f', 'Timothy Miller', 'millertimothy@yahoo.com', true, now(), now(), '2025-07-11 06:01:51', true, 'Afro-Latino', 'Aruba', 'Saint Helena'),
('fa14579c-9056-48b2-8398-632f22092066', 'Mark Allen', 'markallen@yahoo.com', true, now(), now(), '2025-07-16 04:04:57', true, 'Afro-Latino', 'Niger', 'Indonesia'),
('5c0d232b-163a-47c4-b749-3a900513b095', 'Jacqueline Smith', 'jacqueline10@yahoo.com', true, now(), now(), '2025-07-03 06:18:50', true, 'Repat', 'Indonesia', 'Argentina'),
('298d5e7e-343a-4136-8b96-94c26a5eda9b', 'Timothy Johnson', 'timothy40@hotmail.com', true, now(), now(), '2025-07-11 11:22:30', true, 'Repat', 'Swaziland', 'Qatar'),
('cadbf9f4-5d30-4b76-949c-bfb703ab113e', 'Maureen Green', 'maureengreen@wong.com', true, now(), now(), '2025-07-03 04:16:16', true, 'First-Gen', 'New Zealand', 'Malta'),
('8f0a1aa9-7355-40c7-83ab-dbb9faeb22e9', 'Amanda Christian', 'amanda77@christian.info', true, now(), now(), '2025-07-22 12:45:24', true, 'First-Gen', 'Northern Mariana Islands', 'Svalbard & Jan Mayen Islands');

-- Insert seed contact_requests data (connections)
INSERT INTO public.contact_requests (
  id, sender_id, receiver_id, status, purpose, message, is_seeded, created_at, updated_at
) VALUES 
('af5ce423-6974-47c1-8cfe-a1b8cb40e64d', 'e26a6d64-5a66-4281-b270-20b4a3a55d45', 'cbd5287c-dcc5-4557-b5ec-a61b5147a4b9', 'accepted', 'networking', 'Seed connection', true, '2025-01-06 15:02:52', now()),
('0c2d432f-a390-4f68-821f-6a1b818a31be', '5a4504de-3550-4bbd-bbfc-abb6c30c8759', '498bfc69-758c-4d67-8d14-74433cd55b42', 'accepted', 'networking', 'Seed connection', true, '2025-04-30 06:53:00', now()),
('76e7df42-4d75-454b-931d-9ccc6d4a51c6', '91d87022-ddc1-4e21-ab9b-752c6210b0c3', 'cc46d133-0795-4041-b9c3-abb5e7c27b4b', 'accepted', 'networking', 'Seed connection', true, '2025-04-27 04:50:01', now()),
('695bab36-cc63-47b0-9660-f4d486ac95d5', '2268fd35-5a63-4072-9f95-1b4b1456694b', 'e819771f-e34b-44b5-b2e2-3171e08d4de0', 'accepted', 'networking', 'Seed connection', true, '2025-07-25 20:12:49', now()),
('84aacfeb-325a-4102-b151-7b4586075ff9', 'e26a6d64-5a66-4281-b270-20b4a3a55d45', 'ed2e03bf-7e81-414e-b101-74d4af11f9e2', 'accepted', 'networking', 'Seed connection', true, '2025-07-18 18:12:43', now());

-- Insert seed posts data
INSERT INTO public.posts (
  id, author_id, content, pillar, visibility, is_seeded, created_at, updated_at
) VALUES 
('075b9d4d-2ebd-417d-af9c-7e7aa6218fea', 'e819771f-e34b-44b5-b2e2-3171e08d4de0', 'No expect method it economy nor. Event according research amount. Understand speak international debate.', 'connect', 'public', true, '2025-02-20 22:47:07', now()),
('ced8ad82-214b-4a14-8b38-39dae1dd4f59', '234192ac-6b47-4a9b-9d0f-2627f09da3e0', 'Contain piece adult than somebody skill. Event according research amount.', 'connect', 'public', true, '2025-04-22 18:32:49', now()),
('d4ebf9d8-fac4-4df6-9ebd-ff9e8c20d9cd', 'fffb7133-1a5b-416d-8a1e-7f19c2831fda', 'Everybody real west affect. Follow its very authority traditional.', 'connect', 'public', true, '2025-06-15 08:26:59', now()),
('7f635c5a-ae27-4d2b-a6e1-be315c61088b', '015ff85d-24ab-4e82-9d32-ccafd152c244', 'Reach suggest walk surface yourself. Born white difficult close.', 'collaborate', 'public', true, '2025-03-12 13:52:27', now()),
('b0b8bb89-176e-47f7-9628-670292045631', '6957a2e5-235d-4ba0-9440-e151db353d82', 'Number too food focus with different. Save box community.', 'contribute', 'public', true, '2025-07-25 19:45:44', now());

-- Insert seed events data
INSERT INTO public.events (
  id, created_by, title, description, date_time, location, is_seeded, created_at, updated_at
) VALUES 
('cbf58b19-f771-4364-b3d1-922bba8d579f', '015ff85d-24ab-4e82-9d32-ccafd152c244', 'Assimilated zero-defect customer loyalty', 'Table can whom. Yes push baby single. Rule level organization society.', '2025-08-23 18:02:18', 'Virtual Event', true, '2025-05-31 21:06:32', now()),
('ddf0460a-6edb-4a74-b659-95ed46213563', '6957a2e5-235d-4ba0-9440-e151db353d82', 'Polarized asynchronous hub', 'Threat ball interview ok hair spend bank. With action sister.', '2025-08-23 22:04:55', 'Online', true, '2025-05-07 21:32:00', now()),
('02d55fc1-c184-4017-86db-ec9078134e4e', '1c77f6e8-042d-4af3-9109-b386f85d4387', 'Organic discrete model', 'Deal enough last newspaper. Kind quite maybe middle.', '2025-08-22 14:56:44', 'Virtual', true, '2025-02-25 07:05:31', now()),
('b27399c9-81ab-4226-a249-2080c4dfbc9f', 'e26a6d64-5a66-4281-b270-20b4a3a55d45', 'Reactive 24/7 firmware', 'Fall soldier head during young. Eye lot whose door.', '2025-08-17 16:31:34', 'Online Event', true, '2025-04-21 16:51:39', now()),
('bf0947cb-24be-424d-a74d-1597f361f93b', 'c90b4ae6-6cb4-4f58-8718-897c3a0313ac', 'Team-oriented object-oriented frame', 'Attention question the. Baby government notice.', '2025-08-01 01:40:03', 'Virtual Meeting', true, '2025-02-06 02:49:57', now());