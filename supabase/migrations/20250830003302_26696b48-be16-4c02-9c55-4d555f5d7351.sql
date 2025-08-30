-- Remove the project_name column since projects are now campaigns
ALTER TABLE public.insertion_orders 
DROP COLUMN IF EXISTS project_name;