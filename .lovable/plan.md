

# Plano: Corrigir Dados Zerados e Erro de Metricas Diarias

## Diagnostico Completo

Dois problemas raiz encontrados:

### Problema 1: `campaign_metrics_daily` (MV) parou de atualizar

O cron Job 6 que faz `REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_metrics_daily` esta **falhando 100% desde 4 de abril** com "statement timeout" (180s). A MV escaneia 32M+ eventos e nao consegue completar a tempo.

```text
Resultado: 76 de 113 campanhas tem dados na MV
Campanhas novas (como Leroy Merlin, criada 04/04): 0 linhas na MV
Eventos reais para Leroy Merlin: 122.040 eventos
```

Isso explica porque os cards de criativos mostram Click Button: 0, PIN Clicks: 0 -- a funcao `get_campaign_counters` le da MV vazia.

### Problema 2: `get_report_aggregated` escaneia events direto

A funcao usada na pagina de detalhes do criativo (tabela de metricas diarias) faz JOIN direto na tabela `events` (32M+ linhas), causando timeout e o erro toast "Nao foi possivel carregar as metricas diarias".

## Solucao: Converter MV para Tabela Incremental

Em vez de reconstruir a MV inteira a cada hora (impossivel com 32M+ linhas), vamos:

### 1. Converter `campaign_metrics_daily` de MV para tabela regular

- Drop da MV
- Criar tabela regular com mesma estrutura
- Popular com dados existentes da MV (76 campanhas ja processadas)

### 2. Criar funcao de refresh incremental

Nova funcao que processa apenas eventos dos ultimos 3 dias (cobrindo gaps), fazendo UPSERT (INSERT ON CONFLICT UPDATE). Cada execucao processa poucos milhares de linhas em vez de 32M.

### 3. Atualizar `get_report_aggregated` para usar a tabela

Em vez de escanear a tabela `events` diretamente, a funcao passara a ler da tabela `campaign_metrics_daily`, que e ordens de magnitude menor.

### 4. Popular dados faltantes

Funcao de backfill que processa campanhas sem dados na tabela, em lotes para evitar timeout.

## Migration SQL (resumo)

```text
1. DROP MATERIALIZED VIEW campaign_metrics_daily CASCADE
2. CREATE TABLE campaign_metrics_daily (same columns + UNIQUE constraint)
3. CREATE indexes
4. INSERT initial data from events (limited to recent 90 days, batched)
5. CREATE FUNCTION refresh_campaign_metrics_daily_incremental()
   - Processa apenas ultimos 3 dias
   - UPSERT (ON CONFLICT UPDATE)
   - Timeout 60s (vs 180s anterior)
6. UPDATE cron Job 6 to use new function
7. CREATE OR REPLACE get_report_aggregated to read from table
```

## Arquivos Modificados

1. `supabase/migrations/` -- Migration com toda a conversao
2. `src/pages/CriativoDetails.tsx` -- Atualizar `fetchDailyMetrics` para usar a tabela diretamente via query simples (fallback se RPC falhar)

## Resultado Esperado

- Refresh incremental completa em segundos (vs timeout de 180s)
- Todas as 113 campanhas terao dados atualizados
- Pagina de detalhes carrega metricas diarias sem erro
- Cards de criativos mostram dados reais (clicks, pins, page views)
- Cron Job 6 volta a funcionar com sucesso

