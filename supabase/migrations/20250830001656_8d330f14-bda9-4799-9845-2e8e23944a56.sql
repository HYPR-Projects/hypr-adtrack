-- Fix the security definer materialized view issue
-- Drop the problematic materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS public.campaign_metrics_daily CASCADE;

-- Recreate campaign_metrics_daily as a regular materialized view (not SECURITY DEFINER)
CREATE MATERIALIZED VIEW public.campaign_metrics_daily AS
SELECT 
  c.id as campaign_id,
  DATE(e.created_at) as metric_date,
  COUNT(CASE WHEN e.event_type = 'page_view' THEN 1 END) as page_views,
  COUNT(CASE WHEN e.event_type = 'click' THEN 1 END) as cta_clicks,
  COUNT(CASE WHEN e.event_type = 'pin_click' THEN 1 END) as pin_clicks,
  COUNT(*) as total_events
FROM campaigns c
LEFT JOIN tags t ON t.campaign_id = c.id
LEFT JOIN events e ON e.tag_id = t.id
GROUP BY c.id, DATE(e.created_at);

-- Create a unique index on the materialized view to support CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_campaign_metrics_daily_unique 
ON public.campaign_metrics_daily (campaign_id, metric_date);