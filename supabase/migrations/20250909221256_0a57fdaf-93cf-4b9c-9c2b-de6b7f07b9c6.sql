-- Remove unique constraint on campaigns.short_token to allow duplicates
ALTER TABLE public.campaigns 
DROP CONSTRAINT IF EXISTS campaigns_short_token_unique;