
## Plano: Corrigir Bugs de Relatórios

### Problema 1: Dados mostram apenas até 06/01/2026

**Causa raiz:** A materialized view `campaign_metrics_daily` não está sendo atualizada automaticamente. Ela contém dados agregados da tabela `events`, mas o refresh não está sendo executado.

**Dados verificados:**
- Tabela `events`: 38.789 eventos em 27/01, 8.883 eventos hoje (28/01) para Panasonic
- View `campaign_metrics_daily`: último registro em 06/01/2026

**Solução:** Criar uma edge function para refresh periódico da view materializada que será chamada via cron job ou manualmente.

### Problema 2: Loading infinito ao selecionar datas

**Causa raiz:** O componente `DateRangePicker` está definido **dentro** da função `Reports`. Isso causa:
1. A cada render do Reports, DateRangePicker é uma nova função
2. O Calendar é remontado repetidamente
3. Callbacks internos são recriados, causando comportamento instável

**Solução:** Mover `DateRangePicker` para fora do componente ou usar `useCallback`/memo adequadamente.

---

## Mudanças Necessárias

### 1. Edge Function para Refresh (Nova)

**Arquivo:** `supabase/functions/refresh-metrics/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await supabase.rpc('refresh_campaign_metrics')
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true, refreshed_at: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2. Corrigir DateRangePicker em Reports.tsx

**Arquivo:** `src/pages/Reports.tsx`

**Mudança:** Extrair DateRangePicker para um componente separado memoizado ou definir fora do render.

```typescript
// ANTES (linhas 425-511): DateRangePicker definido dentro de Reports
const Reports = () => {
  // ...
  const DateRangePicker = () => { // Recriado a cada render!
    // ...
  }
}

// DEPOIS: Componente separado ou memoizado
const DateRangePicker = memo(({ 
  dateRange, 
  onDateSelect 
}: { 
  dateRange: DateRange | undefined;
  onDateSelect: (range: DateRange | undefined) => void;
}) => {
  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  }, []);

  // ... resto da implementação
});
```

### 3. Estabilizar useReportEvents.tsx

**Arquivo:** `src/hooks/useReportEvents.tsx`

**Mudança:** Usar JSON.stringify para comparação estável de dateRange no useCallback.

```typescript
// Linhas 65-73 e 322
const effectiveDateRange = useMemo(() => {
  if (dateRange?.from && dateRange?.to) {
    return { from: dateRange.from, to: dateRange.to };
  }
  const to = new Date();
  const from = subDays(to, 30);
  return { from, to };
}, [dateRange?.from?.getTime(), dateRange?.to?.getTime()]); // Comparar por timestamp

// Linha 322: usar valores primitivos nas dependências
}, [
  JSON.stringify(selectedCampaignIds), 
  effectiveDateRange.from.getTime(), 
  effectiveDateRange.to.getTime(), 
  groupBy, 
  JSON.stringify(selectedDimensions)
]);
```

---

## Detalhes Técnicos

### Arquivos Modificados:
1. **`supabase/functions/refresh-metrics/index.ts`** (novo) - Edge function para refresh
2. **`src/pages/Reports.tsx`** - Extrair DateRangePicker para componente memoizado
3. **`src/hooks/useReportEvents.tsx`** - Estabilizar dependências do useCallback

### Ordem de Execução:
1. Criar edge function `refresh-metrics`
2. Deploy da function
3. Chamar function para atualizar dados imediatamente
4. Corrigir DateRangePicker
5. Estabilizar useReportEvents

### Resultado Esperado:
- Dados de Panasonic aparecerão de 01/01 até 28/01 (hoje)
- Seleção de datas não causará mais loading infinito
- Preview do relatório carregará rapidamente sem flicker
