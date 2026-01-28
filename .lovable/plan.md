
## Plano: Corrigir Lógica de Status dos Criativos

### Problema Identificado
As campanhas Panasonic têm `end_date: 2026-01-08`, mas hoje é 2026-01-28. A lógica atual prioriza as datas sobre a atividade real, então mesmo com 726+ eventos na última hora, aparecem como "Inativa".

### Solução
Priorizar a atividade recente (`last_hour > 0`) sobre as datas de término. Se o criativo está recebendo tráfego, ele está ativo.

### Mudanças

**Arquivo: `src/hooks/queries/useCampaignsQuery.tsx` (linhas 95-111)**

Lógica atual:
```
if (now < startDate) → scheduled
else if (now > endDate) → expired  ← PROBLEMA: ignora atividade!
else → baseado em last_hour
```

Nova lógica:
```
if (last_hour > 0) → active  ← PRIORIZA atividade recente
else if (now < startDate) → scheduled
else if (now > endDate) → expired
else → paused
```

Código:
```typescript
// Lógica de status baseada em datas + atividade recente
const now = new Date();
const startDate = new Date(campaign.start_date);
const endDate = new Date(campaign.end_date);

let derivedStatus: 'active' | 'paused' | 'scheduled' | 'expired';

// PRIORIDADE 1: Se tem atividade na última hora, está ativo
if (metrics.last_hour > 0) {
  derivedStatus = 'active';
} else if (now < startDate) {
  // Campanha ainda não começou
  derivedStatus = 'scheduled';
} else if (now > endDate) {
  // Campanha já finalizou e sem atividade recente
  derivedStatus = 'expired';
} else {
  // Campanha no período válido, mas sem atividade
  derivedStatus = 'paused';
}
```

### Detalhes Técnicos

**Arquivo alterado:** `src/hooks/queries/useCampaignsQuery.tsx`

**Linhas:** 95-111

**Comportamento após a mudança:**
- Criativo com 726 eventos na última hora → **Ativa** (verde)
- Criativo expirado SEM eventos recentes → **Inativa** (cinza)
- Criativo agendado para o futuro → **Inativa** (cinza)
- Criativo dentro do período mas sem eventos → **Inativa** (cinza)

### Resultado Esperado
Os criativos Panasonic que têm "Últ. hora: 726" e "Últ. hora: 1043" passarão a mostrar "Ativa" em vez de "Inativa".
