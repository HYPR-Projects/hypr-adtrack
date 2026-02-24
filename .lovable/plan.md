

# Plano: Eliminar Job 3 e Blindar o Sistema

## Problema Encontrado

O **Job 3** (cron antigo) continua rodando a cada 5 minutos e **falhando 100% das vezes** com "statement timeout". A migration anterior para removê-lo não funcionou. Ele está consumindo conexões do banco continuamente, causando lentidão em todas as páginas.

Além disso, o **Job 4** (HTTP-based) também continua ativo e é redundante com os Jobs 5/6 novos.

Evidência dos logs do cron:
```text
Job 3: a cada 5 min -> "ERROR: canceling statement due to statement timeout" (14 falhas seguidas)
Job 4: ativo, redundante
Job 5: refresh-metrics-summary -> rodando (OK)
Job 6: refresh-metrics-daily -> ativo (OK)
```

## Solucao

### Parte 1: Remover Jobs 3 e 4 via SQL direto

Usar o SQL Editor do Supabase (nao migration, pois migrations anteriores falharam silenciosamente) para executar:

```text
SELECT cron.unschedule(3);
SELECT cron.unschedule(4);
```

Isso elimina imediatamente a contenção no banco.

### Parte 2: Adicionar resiliencia nos hooks de queries restantes

Alguns hooks ainda nao tem as mesmas protecoes que o `useCampaignsQuery`:

1. **`useInsertionOrdersQuery.tsx`** -- Adicionar `retry: 2`, `retryDelay: 1000`, `refetchOnWindowFocus: false`, `refetchOnMount: false`
2. **`useCampaignGroupsQuery.tsx`** -- Adicionar `retry: 2`, `retryDelay: 1000`, `refetchOnWindowFocus: false`, `refetchOnMount: false`
3. **`useCampaignDetailsQuery.tsx`** -- Adicionar `refetchOnWindowFocus: false`, `refetchOnMount: false`

### Parte 3: Adicionar indicador de "dados em cache" na UI

Na pagina de Reports, quando os dados vêm do cache (nao esta fazendo fetch), mostrar uma badge discreta "Dados em cache" para que o usuario saiba que os dados sao recentes mas podem nao ser em tempo real.

### Parte 4: Adicionar error boundary leve na pagina de Reports

Se o `useReportEvents` falhar depois de todos os retries, mostrar uma mensagem amigavel com botao "Tentar novamente" em vez de tela branca ou erro generico.

## Arquivos Modificados

1. `src/hooks/queries/useInsertionOrdersQuery.tsx` -- Adicionar retry e cache settings
2. `src/hooks/queries/useCampaignGroupsQuery.tsx` -- Adicionar retry e cache settings  
3. `src/hooks/queries/useCampaignDetailsQuery.tsx` -- Adicionar refetch settings
4. `src/pages/Reports.tsx` -- Adicionar tratamento de erro amigavel com botao retry
5. SQL direto no Supabase para remover Jobs 3 e 4

## Resultado Esperado

- Banco liberado da contenção do Job 3 (impacto imediato em todas as paginas)
- Todas as queries com retry automatico e cache consistente
- Erros de relatorio mostram mensagem amigavel com opcao de retry
- Sistema mais resiliente a falhas temporarias do banco

