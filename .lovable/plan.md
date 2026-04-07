

# Auditoria de Acessibilidade HTML/ARIA

## Prioridade 1 — Impacto Alto (afeta navegacao e compreensao)

### 1.1 `index.html` — lang errado
`<html lang="en">` mas todo o conteudo esta em portugues. Deve ser `lang="pt-BR"`. Afeta leitores de tela que pronunciarao todo o texto com fonetica inglesa.

### 1.2 Hierarquia de headings quebrada em todas as paginas

| Pagina | Problema |
|---|---|
| `CriativoDetails.tsx` | Unico `<h1>` no header (nome da campanha). Depois pula para `<h3>` (linhas 560, 714) sem `<h2>`. Cards de metricas usam `<div>` para titulos. |
| `Campanhas.tsx` | Nenhum `<h1>`. Primeiro heading e `<h2>` (linha 269). |
| `InsertionOrders.tsx` | Nenhum `<h1>`. Primeiro heading e `<h2>` (linha 182). |
| `Criativos.tsx` | Nenhum `<h1>`. Primeiro heading e `<h2>` (linha 322 no contextBar, 538 na lista). |
| `Reports.tsx` | Nenhum `<h1>` (a verificar, mas segue o padrao AppLayout que nao renderiza h1). |
| `Auth.tsx` | Nenhum `<h1>` visivel. `CardTitle` renderiza `<h3>` por padrao (shadcn). |

**AppLayout nao renderiza nenhum `<h1>`**. O logo e uma `<img>`. Nenhuma pagina que usa AppLayout tem heading de nivel 1. Isso e o problema raiz.

### 1.3 Inputs sem labels associados

| Arquivo | Input | Problema |
|---|---|---|
| `Campanhas.tsx` L209 | Input de busca | Tem placeholder "Buscar campanhas..." mas nenhum `<label>` associado, nem `aria-label`. O icone Search nao substitui um label. |
| `InsertionOrders.tsx` L137 | Input de busca | Idem — placeholder sem label acessivel. |
| `Criativos.tsx` L441 | Input de busca | Idem. |
| `CriativoDetails.tsx` | Nenhum input de busca, mas os Selects de DSP nao tem labels. |

Todos os `SelectTrigger` com icone + texto (ex: Building + "Insertion Order") tem texto visual, mas nenhum `aria-label` explicito. O Radix Select geralmente propaga o placeholder, entao o impacto e menor.

### 1.4 `CriativoDetails.tsx` — nao usa landmarks

A pagina reimplementa o layout sem `<header>`, `<main>`, `<nav>`. O header sticky usa `<div>` (linha 341). O conteudo usa `<div>` (linha 388). Resultado: leitores de tela nao conseguem navegar por landmarks.

Comparacao: `AppLayout` usa `<header>` e `<main>` corretamente.

---

## Prioridade 2 — Impacto Medio

### 2.1 Contraste insuficiente

| Elemento | Classes | Problema |
|---|---|---|
| `Auth.tsx` — textos sobre fundo escuro | `text-white/80`, `text-white/70`, `text-white/60` | Opacidades de 60-70% sobre imagem escura com overlay `bg-black/30` podem nao atingir ratio 4.5:1 WCAG AA. O pior caso e `placeholder:text-white/60` nos inputs. |
| `Auth.tsx` — "Esqueci minha senha" | `text-white/80 hover:text-white` | Link funcional com contraste potencialmente insuficiente. |
| Breadcrumb separadores | `text-muted-foreground/60` | Opacidade 60% sobre fundo claro. Decorativo, impacto menor. |
| Spinner de loading | `border-b-2 border-primary` | Spinner animado sem texto alternativo — usuario de leitor de tela nao sabe que esta carregando. |

### 2.2 Foco visivel

Os componentes shadcn/ui (Button, Input, Select) ja incluem `focus-visible:ring-2 focus-visible:ring-ring`. Porem:

| Elemento | Problema |
|---|---|
| `Breadcrumb.tsx` — Links | Usam `<Link>` com classes custom mas sem `focus-visible` explicito. O browser default focus pode ser suprimido pelo `rounded-md` + background. |
| `CriativoDetails.tsx` L345 | `<Link to="/criativos">` wrapping um `<Button>` — foco pode ficar no Link ou no Button, criando confusao de tab order. |
| `Auth.tsx` — "Esqueci minha senha" | `<button>` com classes custom mas sem `focus-visible` ring. |

### 2.3 Breadcrumb sem `aria-label`

`Breadcrumb.tsx` usa `<nav>` (correto) mas sem `aria-label="Navegacao"` ou equivalente. Com multiplos `<nav>` na pagina (se houver), leitores de tela nao distinguem.

---

## Prioridade 3 — Impacto Baixo

### 3.1 Tabela de metricas sem `<caption>`
`CriativoDetails.tsx` L721-767: `<Table>` de metricas diarias sem `<caption>`. Leitores de tela nao sabem o proposito da tabela sem contexto.

### 3.2 Icones decorativos sem `aria-hidden`
Icones Lucide dentro de botoes com texto (ex: `<Download className="w-4 h-4" /> Exportar CSV`) nao tem `aria-hidden="true"`. Lucide geralmente adiciona isso por padrao, mas vale confirmar.

### 3.3 Loading states sem live region
Nenhum `aria-live="polite"` nos containers de loading/skeleton. Usuarios de leitores de tela nao sabem quando o conteudo terminou de carregar.

---

## Plano de Execucao

### Risco zero:
1. `index.html` — mudar `lang="en"` para `lang="pt-BR"`
2. Adicionar `aria-label` nos 3 inputs de busca (Campanhas, InsertionOrders, Criativos)
3. Adicionar `aria-label="Navegacao estrutural"` no `<nav>` do Breadcrumb
4. Adicionar `focus-visible:ring-2 focus-visible:ring-ring` no link "Esqueci minha senha" em Auth.tsx

### Risco baixo:
5. Adicionar `<h1 className="sr-only">` em AppLayout com o titulo da pagina (usa prop `title` ou `subtitle` ja existente)
6. Converter `<div>` para `<header>` e `<main>` em CriativoDetails.tsx (landmarks)
7. Adicionar `<caption className="sr-only">` na tabela de metricas diarias
8. Adicionar `aria-live="polite"` nos containers de loading/skeleton

### Risco medio (sinalizado):
9. Melhorar contraste dos textos em Auth.tsx (subir opacidades de 60/70% para 80/90%)
10. Resolver foco duplo Link+Button em CriativoDetails (usar `asChild` ou remover wrapper)

### Arquivos a modificar:
- `index.html`
- `src/components/layout/AppLayout.tsx`
- `src/components/Breadcrumb.tsx`
- `src/pages/CriativoDetails.tsx`
- `src/pages/Campanhas.tsx`
- `src/pages/InsertionOrders.tsx`
- `src/pages/Criativos.tsx`
- `src/pages/Auth.tsx`

