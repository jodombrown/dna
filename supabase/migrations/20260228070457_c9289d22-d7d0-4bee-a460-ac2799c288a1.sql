-- Remove old seeded/mock events (non-curated), keeping only the real Perplexity-curated events
DELETE FROM events WHERE is_curated IS DISTINCT FROM true;