
UPDATE public.sponsors 
SET name = 'GABA Center',
    description = 'The Diplomatic & Commercial Bridge to African Markets',
    website_url = 'https://www.gabacenter.com',
    logo_url = 'https://www.gabacenter.com/assets/gaba-logo.png'
WHERE id = '7387872e-35bc-48f8-bd03-996b49b5af7b';

UPDATE public.sponsor_placements 
SET headline = 'Your Gateway to African Economic Partnership',
    cta_url = 'https://www.gabacenter.com',
    cta_label = 'Partner With Us'
WHERE id = '363ac07d-7804-4ef4-8395-67e1dfe5f18d';
