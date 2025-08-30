-- Ensure campaign_groups table has proper foreign key to insertion_orders
ALTER TABLE public.campaign_groups 
ADD CONSTRAINT fk_campaign_groups_insertion_order 
FOREIGN KEY (insertion_order_id) REFERENCES public.insertion_orders(id) ON DELETE CASCADE;

-- Ensure campaigns table has proper foreign key to campaign_groups
ALTER TABLE public.campaigns 
ADD CONSTRAINT fk_campaigns_campaign_group 
FOREIGN KEY (campaign_group_id) REFERENCES public.campaign_groups(id) ON DELETE CASCADE;

-- Update campaigns table to make campaign_group_id NOT NULL (new campaigns must belong to a campaign group)
-- First, create a default campaign group for existing campaigns without one
INSERT INTO public.campaign_groups (id, name, description, user_id, insertion_order_id, status)
SELECT 
  gen_random_uuid(),
  'Grupo Padrão - ' || io.client_name,
  'Grupo criado automaticamente para campanhas existentes',
  c.user_id,
  c.insertion_order_id,
  'active'
FROM public.campaigns c
LEFT JOIN public.insertion_orders io ON c.insertion_order_id = io.id
WHERE c.campaign_group_id IS NULL
AND c.insertion_order_id IS NOT NULL
GROUP BY c.user_id, c.insertion_order_id, io.client_name;

-- Update campaigns without campaign_group_id to use the default groups
UPDATE public.campaigns 
SET campaign_group_id = (
  SELECT cg.id 
  FROM public.campaign_groups cg 
  WHERE cg.insertion_order_id = campaigns.insertion_order_id 
  AND cg.name LIKE 'Grupo Padrão%'
  LIMIT 1
)
WHERE campaign_group_id IS NULL;

-- Now make campaign_group_id NOT NULL
ALTER TABLE public.campaigns 
ALTER COLUMN campaign_group_id SET NOT NULL;