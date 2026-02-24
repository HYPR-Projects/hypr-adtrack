
# Plano: Restaurar Indicador de Atividade Recente (last_hour)

## Problema

A correcao anterior mudou `get_campaign_counters` para usar `campaign_metrics_daily`, o que resolveu os dados zerados. Porem, como essa view so tem granularidade diaria, o campo `last_hour` ficou fixo em 0.

Dados reais confirmam que campanhas do Boticario **estao recebendo sinais agora**:
- 1 criativo: 2.744 eventos na ultima hora
- 1 criativo: 1.097 eventos na ultima hora
- 4 outros com atividade menor

## Solucao

Alterar a funcao `get_campaign_counters` para buscar `last_hour` diretamente da tabela `events` via JOIN com `tags`, mantendo todos os outros campos (page_views, cta_clicks, pin_clicks, total_7d) vindos da `campaign_metrics_daily`.

A consulta de ultima hora e leve porque:
- Filtra apenas `created_at >= NOW() - INTERVAL '1 hour'` (poucos registros)
- Usa indice existente na coluna `created_at`
- Nao precisa escanear a tabela inteira

### SQL da funcao atualizada

```text
CREATE OR REPLACE FUNCTION get_campaign_counters(campaign_ids uuid[])
RETURNS TABLE(
  campaign_id uuid,
  page_views bigint,
  cta_clicks bigint,
  pin_clicks bigint,
  total_7d bigint,
  last_hour bigint
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
SET statement_timeout TO '10s'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uid as campaign_id,
    COALESCE(agg.page_views, 0::bigint),
    COALESCE(agg.cta_clicks, 0::bigint),
    COALESCE(agg.pin_clicks, 0::bigint),
    COALESCE(agg.total_7d, 0::bigint),
    COALESCE(lh.last_hour, 0::bigint)
  FROM unnest(campaign_ids) AS uid
  LEFT JOIN (
    SELECT
      cmd.campaign_id,
      SUM(cmd.page_views)::bigint as page_views,
      SUM(cmd.cta_clicks)::bigint as cta_clicks,
      SUM(cmd.pin_clicks)::bigint as pin_clicks,
      SUM(CASE WHEN cmd.metric_date >= CURRENT_DATE - INTERVAL '7 days'
          THEN cmd.page_views + cmd.cta_clicks + cmd.pin_clicks ELSE 0 END)::bigint as total_7d
    FROM campaign_metrics_daily cmd
    WHERE cmd.campaign_id = ANY(campaign_ids)
    GROUP BY cmd.campaign_id
  ) agg ON agg.campaign_id = uid
  LEFT JOIN (
    SELECT
      t.campaign_id,
      COUNT(*)::bigint as last_hour
    FROM events e
    JOIN tags t ON t.id = e.tag_id
    WHERE t.campaign_id = ANY(campaign_ids)
      AND e.created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY t.campaign_id
  ) lh ON lh.campaign_id = uid
  WHERE (auth.uid() IS NOT NULL);
END;
$$;
```

## Arquivos modificados

1. `supabase/migrations/` -- Nova migration para atualizar `get_campaign_counters`

## Resultado esperado

- Criativos com atividade na ultima hora mostrarao status "Ativa" e badge "Ult. hora: X" com valor real
- Criativos sem atividade recente continuarao como "Inativa"
- Metricas totais (clicks, pins, page views) continuam vindas da view materializada (rapido e confiavel)
- Timeout de 10s protege contra queries longas
