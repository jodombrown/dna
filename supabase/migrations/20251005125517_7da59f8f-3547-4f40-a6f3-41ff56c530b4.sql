-- Replace causes with the 6 Capitals pathways
TRUNCATE TABLE public.causes CASCADE;

INSERT INTO public.causes (name, description, icon) VALUES
  ('Financial Capital', 'I want to fund ideas, support ventures, or invest in Africa''s future.', '💰'),
  ('Knowledge Capital', 'I want to share my experience, mentor others, or teach what I know.', '📘'),
  ('Human Capital', 'I want to volunteer my time, coach entrepreneurs, or help hands-on.', '🧑🏽‍💼'),
  ('Social Capital', 'I want to connect people, open doors, or build partnerships.', '🤝'),
  ('Cultural Capital', 'I want to celebrate and promote Africa''s creativity, art, and heritage.', '🎭'),
  ('Influence Capital', 'I want to use my platform or voice to advocate and shape perceptions.', '🌍');