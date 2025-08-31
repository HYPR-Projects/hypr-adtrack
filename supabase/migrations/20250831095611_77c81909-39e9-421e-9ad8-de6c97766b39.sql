
-- 1) Remover refresh automático da view materializada por evento
DROP TRIGGER IF EXISTS trigger_refresh_metrics ON public.events;
DROP FUNCTION IF EXISTS public.refresh_campaign_metrics_daily();

-- 2) Índices fundamentais (idempotentes)
CREATE INDEX IF NOT EXISTS idx_events_tag_id_created_at 
  ON public.events (tag_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_created_at 
  ON public.events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_type_created_at 
  ON public.events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_tag_type_date 
  ON public.events (tag_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tags_campaign_id 
  ON public.tags (campaign_id);

-- 3) Índices parciais por tipo de evento (escala alta)
CREATE INDEX IF NOT EXISTS idx_events_page_view_tag_date 
  ON public.events (tag_id, created_at DESC)
  WHERE event_type = 'page_view';

CREATE INDEX IF NOT EXISTS idx_events_click_tag_date 
  ON public.events (tag_id, created_at DESC)
  WHERE event_type = 'click';

CREATE INDEX IF NOT EXISTS idx_events_pin_click_tag_date 
  ON public.events (tag_id, created_at DESC)
  WHERE event_type = 'pin_click';

-- 4) Parâmetros de manutenção (mantêm a tabela eficiente em alto volume)
-- Observação: Reaplicar SET é seguro; não altera dados.
ALTER TABLE public.events 
  SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02, fillfactor = 90);

-- 5) Atualizar estatísticas para o planner
ANALYZE public.events;
ANALYZE public.tags;
