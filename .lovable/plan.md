

## Plano: Query Direto da Tabela Events (Sem Dependência da View)

### Problema Confirmado
- **Materialized view `campaign_metrics_daily`:** dados até 06/01/2026
- **Tabela `events`:** dados até 28/01/2026 (hoje)
- O frontend usa a RPC `get_report_from_materialized_view` que só lê da view desatualizada

### Solução: Nova RPC que Consulta Events Diretamente

Vou criar uma nova função RPC que consulta a tabela `events` diretamente, eliminando a dependência da materialized view.

---

## Mudanças

### 1. Nova Migration - RPC para Query Direto

**Arquivo:** `supabase/migrations/[timestamp]_direct_events_report_rpc.sql`

```sql
-- Create function to get report data directly from events table
CREATE OR REPLACE FUNCTION public.get_report_from_events(
  p_campaign_ids uuid[] DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_group_by text DEFAULT 'day'
)
RETURNS TABLE(
  period_start timestamp with time zone,
  campaign_id uuid,
  page_views bigint,
  cta_clicks bigint,
  pin_clicks bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  start_date_filter date;
  end_date_filter date;
BEGIN
  start_date_filter := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  end_date_filter := COALESCE(p_end_date, CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    CASE p_group_by
      WHEN 'week' THEN date_trunc('week', e.created_at)
      WHEN 'month' THEN date_trunc('month', e.created_at)
      ELSE date_trunc('day', e.created_at)
    END as period_start,
    t.campaign_id,
    SUM(CASE WHEN e.event_type = 'page_view' THEN 1 ELSE 0 END)::bigint as page_views,
    SUM(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::bigint as cta_clicks,
    SUM(CASE WHEN e.event_type = 'pin_click' THEN 1 ELSE 0 END)::bigint as pin_clicks
  FROM events e
  JOIN tags t ON e.tag_id = t.id
  WHERE (auth.uid() IS NOT NULL)
    AND (p_campaign_ids IS NULL OR t.campaign_id = ANY(p_campaign_ids))
    AND e.created_at >= start_date_filter
    AND e.created_at < (end_date_filter + INTERVAL '1 day')
  GROUP BY 
    CASE p_group_by
      WHEN 'week' THEN date_trunc('week', e.created_at)
      WHEN 'month' THEN date_trunc('month', e.created_at)
      ELSE date_trunc('day', e.created_at)
    END,
    t.campaign_id
  HAVING SUM(1) > 0
  ORDER BY period_start DESC, t.campaign_id;
END;
$$;
```

### 2. Atualizar Hook useReportEvents

**Arquivo:** `src/hooks/useReportEvents.tsx`

**Mudança:** Trocar a chamada de `get_report_from_materialized_view` para `get_report_from_events`

```typescript
// ANTES (linha 92-98):
const { data: aggregatedData, error: aggregatedError } = await supabase
  .rpc('get_report_from_materialized_view', {
    p_campaign_ids: selectedCampaignIds,
    p_start_date: startDate,
    p_end_date: endDate,
    p_group_by: groupBy
  });

// DEPOIS:
const { data: aggregatedData, error: aggregatedError } = await supabase
  .rpc('get_report_from_events', {
    p_campaign_ids: selectedCampaignIds,
    p_start_date: startDate,
    p_end_date: endDate,
    p_group_by: groupBy
  });
```

### 3. Atualizar Types do Supabase

**Arquivo:** `src/integrations/supabase/types.ts`

Adicionar a nova função RPC aos tipos TypeScript.

---

## Detalhes Técnicos

### Arquivos Modificados:
1. **Nova migration SQL** - Cria a RPC `get_report_from_events`
2. **`src/hooks/useReportEvents.tsx`** - Usa a nova RPC
3. **`src/integrations/supabase/types.ts`** - Tipos TypeScript

### Por que funciona:
- Query direto na tabela `events` = sempre dados em tempo real
- Não depende de refresh da materialized view
- Performance otimizada com os índices já existentes na tabela events
- Mantém os mesmos parâmetros e formato de retorno

### Resultado Esperado:
- Dados de 01/01/2026 até 28/01/2026 aparecerão no relatório
- Sem necessidade de ação manual no Supabase
- Filtro por data funcionará corretamente

