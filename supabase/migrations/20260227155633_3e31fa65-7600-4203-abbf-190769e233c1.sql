
-- CONVENE Seed Data — all trigger issues fixed

-- 1. Profile cities
UPDATE public.profiles SET current_city = 'Lagos' WHERE id = 'fbfe9f2a-be47-49a8-be9d-68a2943b4afb';
UPDATE public.profiles SET current_city = 'Accra' WHERE id = '4becc8c9-a986-45c8-a4fc-fab69dcf51ac';
UPDATE public.profiles SET current_city = 'London' WHERE id = '2c4d6c59-09fe-4542-9fbc-87d31cfaf38a';
UPDATE public.profiles SET current_city = 'New York' WHERE id = '8b369be1-9211-4dc8-af73-2b78c2b95855';
UPDATE public.profiles SET current_city = 'Lagos' WHERE id = 'cb961ebc-cc6f-4175-8d1b-1f978bd98b99';
UPDATE public.profiles SET current_city = 'Nairobi' WHERE id = '845250fb-d692-452f-8b77-dcebd0babb74';
UPDATE public.profiles SET current_city = 'Accra' WHERE id = 'bd6be44c-5dd3-46fa-a824-fc211cf74314';
UPDATE public.profiles SET current_city = 'Johannesburg' WHERE id = '2f128c6c-88a6-4250-8f14-a683b00827d8';
UPDATE public.profiles SET current_city = 'London' WHERE id = '36c58548-b070-45db-b015-a9faba5aa290';
UPDATE public.profiles SET current_city = 'Paris' WHERE id = '6a7cfa48-dd52-4963-bb06-f1f0f0a812cb';
UPDATE public.profiles SET current_city = 'Toronto' WHERE id = '182e9179-15e9-4dde-a92d-38e3ca804da9';
UPDATE public.profiles SET current_city = 'Nairobi' WHERE id = '18dd97c9-567a-47f1-b16a-c3214ef9f106';
UPDATE public.profiles SET current_city = 'Washington DC' WHERE id = '2403b754-541f-48c0-a792-32a78545c678';
UPDATE public.profiles SET current_city = 'Dubai' WHERE id = '053d4157-00fd-474c-a6ef-c782ea096d35';

-- 2. Backdate 3 events
UPDATE public.events SET start_time = '2026-02-10 17:00:00+00', end_time = '2026-02-10 20:00:00+00' WHERE id = '0c897690-8c02-476c-8f59-6a989b7f594e';
UPDATE public.events SET start_time = '2026-02-05 09:00:00+00', end_time = '2026-02-05 18:00:00+00' WHERE id = '7dee4e08-4b50-4330-8c2b-a251d483b953';
UPDATE public.events SET start_time = '2026-02-15 18:00:00+00', end_time = '2026-02-15 21:00:00+00' WHERE id = '03c4ce05-8760-4ef5-b903-959633c878a0';

-- 3. Draft + capacity adjustments
UPDATE public.events SET is_published = false WHERE id = '71128dd9-bc26-4edf-875b-6acb3ce0f86d';
UPDATE public.events SET max_attendees = 17 WHERE id = '605106a4-cb4f-457c-96d1-e66affa46974';
UPDATE public.events SET max_attendees = 15 WHERE id = '01f13425-ec5b-48be-9e9f-de87c9244924';

-- 4. Attendees
INSERT INTO public.event_attendees (event_id, user_id, status) VALUES
('01f13425-ec5b-48be-9e9f-de87c9244924','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','8b369be1-9211-4dc8-af73-2b78c2b95855','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','cb961ebc-cc6f-4175-8d1b-1f978bd98b99','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','2f128c6c-88a6-4250-8f14-a683b00827d8','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','36c58548-b070-45db-b015-a9faba5aa290','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','6a7cfa48-dd52-4963-bb06-f1f0f0a812cb','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','182e9179-15e9-4dde-a92d-38e3ca804da9','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','18dd97c9-567a-47f1-b16a-c3214ef9f106','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','2403b754-541f-48c0-a792-32a78545c678','going'),
('01f13425-ec5b-48be-9e9f-de87c9244924','053d4157-00fd-474c-a6ef-c782ea096d35','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','f2c1d415-254b-4881-99bc-988657ffc562','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','8b369be1-9211-4dc8-af73-2b78c2b95855','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','cb961ebc-cc6f-4175-8d1b-1f978bd98b99','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','2f128c6c-88a6-4250-8f14-a683b00827d8','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','36c58548-b070-45db-b015-a9faba5aa290','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','6a7cfa48-dd52-4963-bb06-f1f0f0a812cb','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','182e9179-15e9-4dde-a92d-38e3ca804da9','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','18dd97c9-567a-47f1-b16a-c3214ef9f106','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','2403b754-541f-48c0-a792-32a78545c678','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','053d4157-00fd-474c-a6ef-c782ea096d35','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','1600a02c-691c-4310-872a-79d0b42f1097','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','192c3c13-1d90-42d5-b12d-dcfe8022eec3','going'),
('605106a4-cb4f-457c-96d1-e66affa46974','5a91dc15-ead8-49df-9490-a5114446d578','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','cb961ebc-cc6f-4175-8d1b-1f978bd98b99','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','36c58548-b070-45db-b015-a9faba5aa290','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','6a7cfa48-dd52-4963-bb06-f1f0f0a812cb','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','182e9179-15e9-4dde-a92d-38e3ca804da9','going'),
('0c897690-8c02-476c-8f59-6a989b7f594e','053d4157-00fd-474c-a6ef-c782ea096d35','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','f2c1d415-254b-4881-99bc-988657ffc562','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','8b369be1-9211-4dc8-af73-2b78c2b95855','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','cb961ebc-cc6f-4175-8d1b-1f978bd98b99','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','2f128c6c-88a6-4250-8f14-a683b00827d8','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','36c58548-b070-45db-b015-a9faba5aa290','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','6a7cfa48-dd52-4963-bb06-f1f0f0a812cb','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','18dd97c9-567a-47f1-b16a-c3214ef9f106','going'),
('7dee4e08-4b50-4330-8c2b-a251d483b953','2403b754-541f-48c0-a792-32a78545c678','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','f2c1d415-254b-4881-99bc-988657ffc562','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','8b369be1-9211-4dc8-af73-2b78c2b95855','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','2f128c6c-88a6-4250-8f14-a683b00827d8','going'),
('03c4ce05-8760-4ef5-b903-959633c878a0','053d4157-00fd-474c-a6ef-c782ea096d35','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','cb961ebc-cc6f-4175-8d1b-1f978bd98b99','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('e50b2a91-2821-4b6b-a842-e7f1a48f49b1','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','8b369be1-9211-4dc8-af73-2b78c2b95855','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','f2c1d415-254b-4881-99bc-988657ffc562','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','6a7cfa48-dd52-4963-bb06-f1f0f0a812cb','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','182e9179-15e9-4dde-a92d-38e3ca804da9','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','1600a02c-691c-4310-872a-79d0b42f1097','going'),
('f41c1a80-c96b-47cb-ada6-c9376208f377','192c3c13-1d90-42d5-b12d-dcfe8022eec3','going'),
('23bdda96-b366-4e67-9be1-e305f6871ca9','2c4d6c59-09fe-4542-9fbc-87d31cfaf38a','going'),
('23bdda96-b366-4e67-9be1-e305f6871ca9','36c58548-b070-45db-b015-a9faba5aa290','going'),
('23bdda96-b366-4e67-9be1-e305f6871ca9','fbfe9f2a-be47-49a8-be9d-68a2943b4afb','going'),
('23bdda96-b366-4e67-9be1-e305f6871ca9','845250fb-d692-452f-8b77-dcebd0babb74','going'),
('23bdda96-b366-4e67-9be1-e305f6871ca9','053d4157-00fd-474c-a6ef-c782ea096d35','going'),
('6cf9baf0-7930-4fa2-99b3-b515b5383cd6','2f128c6c-88a6-4250-8f14-a683b00827d8','going'),
('6cf9baf0-7930-4fa2-99b3-b515b5383cd6','bd6be44c-5dd3-46fa-a824-fc211cf74314','going'),
('6cf9baf0-7930-4fa2-99b3-b515b5383cd6','4becc8c9-a986-45c8-a4fc-fab69dcf51ac','going'),
('6cf9baf0-7930-4fa2-99b3-b515b5383cd6','5a91dc15-ead8-49df-9490-a5114446d578','going')
ON CONFLICT DO NOTHING;
