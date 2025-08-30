-- Corrigir problemas de segurança identificados

-- 1. Corrigir search_path das funções existentes
CREATE OR REPLACE FUNCTION public.refresh_campaign_metrics_daily()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily;
  RETURN NULL;
END;
$$;

-- 2. Criar função de limpeza com search_path definido
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Remove eventos com mais de 1 ano (ajuste conforme necessário)
  DELETE FROM events 
  WHERE created_at < CURRENT_DATE - INTERVAL '365 days';
  
  -- Atualiza estatísticas das tabelas
  ANALYZE events;
  ANALYZE tags;
  ANALYZE campaigns;
END;
$$;

-- 3. Verificar e corrigir outras funções existentes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE
    SET email = excluded.email,
        updated_at = now();
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
     SET email = new.email,
         updated_at = now()
   WHERE id = new.id;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_event_type(tag_id uuid, provided_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  t text;
BEGIN
  SELECT type INTO t FROM public.tags WHERE id = tag_id;

  -- Se não achar a tag, mantém o valor informado (evita falhas em importações parciais)
  IF t IS NULL THEN
    RETURN provided_type;
  END IF;

  IF t = 'page-view' THEN
    RETURN 'page_view';
  ELSIF t = 'pin' THEN
    RETURN 'pin_click';
  ELSIF t = 'click-button' THEN
    RETURN 'click';
  ELSE
    RETURN provided_type;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.events_before_write_normalize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.event_type := public.normalize_event_type(NEW.tag_id, NEW.event_type);
  RETURN NEW;
END;
$$;