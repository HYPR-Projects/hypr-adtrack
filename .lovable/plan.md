

# Auditoria de Performance -- Relatorio de Diagnostico

## 1. Recursos Externos que Bloqueiam Renderizacao

### 1.1 Google Fonts -- render-blocking (ALTO IMPACTO)

`index.html` linha 14:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Apesar de usar `display=swap`, o `<link rel="stylesheet">` no `<head>` e **render-blocking**. O browser precisa baixar e parsear o CSS da Google antes de renderizar qualquer coisa. Em conexoes lentas, isso pode adicionar 200-500ms ao First Contentful Paint.

Alem disso, carrega **5 pesos** (300, 400, 500, 600, 700). Auditoria rapida nos componentes mostra uso real de `font-light` (300), `font-medium` (500), `font-semibold` (600) e `font-bold` (700). O peso 400 (normal) e implicito. Porem, `font-light` (300) aparece em zero componentes apos a limpeza anterior -- e peso morto.

**Correcao**: Usar `<link rel="preload" as="style" onload="this.rel='stylesheet'">` com fallback `<noscript>`, e remover peso 300.

### 1.2 Preload de imagem do Auth na pagina principal (MEDIO IMPACTO)

`index.html` linha 17:
```html
<link rel="preload" href="/lovable-uploads/d177fad6-08ba-4f61-b459-0f35fe3e81f4.png" as="image" fetchpriority="high">
```

Esta imagem e o **background da pagina de Auth** (login). Para usuarios ja autenticados (maioria dos acessos), essa imagem nunca sera exibida, mas consome bandwidth e compete com recursos criticos. E `fetchpriority="high"`, roubando prioridade do JS do app.

**Correcao**: Remover o preload do `index.html`. A imagem ja tem `loading="eager"` e `fetchPriority="high"` no componente `Auth.tsx` -- ela sera carregada naturalmente quando a pagina de login for acessada.

---

## 2. Imagens sem Dimensoes Definidas (CLS)

Todas as `<img>` do projeto carecem de `width` e `height` explicitos, causando Layout Shift (CLS) ate o carregamento:

| Arquivo | Imagem | Problema |
|---|---|---|
| `AppLayout.tsx` L45-49 | Logo HYPR header | `className="h-5 md:h-7"` mas sem `width`/`height` HTML. Browser nao reserva espaco. |
| `Auth.tsx` L93 | Background fullscreen | Sem `width`/`height`. Ocupara a tela toda via CSS, mas antes do load a div colapsa. |
| `Auth.tsx` L98 | Logo desktop | Sem `width`/`height`. |
| `Auth.tsx` L106 | Logo mobile | Sem `width`/`height`. |
| `ResetPassword.tsx` L108-110, L139-141 | Logo (2x) | Sem `width`/`height`. |
| `CriativoDetails.tsx` L262 | Pixel img tag (gerado) | 1x1, ja tem `width="1" height="1"` -- OK. |

**Correcao**: Adicionar atributos `width` e `height` que reflitam o aspect ratio real (ex: logo `width="120" height="28"`), mantendo o CSS responsivo via `className`. Isso permite o browser reservar espaco antes do load.

---

## 3. Imagens sem Lazy Loading

| Arquivo | Imagem | Deveria ter lazy? |
|---|---|---|
| `Auth.tsx` L93 | Background | Nao -- e above-the-fold, `loading="eager"` correto. |
| `Auth.tsx` L98 | Logo desktop | Nao -- above-the-fold. |
| `Auth.tsx` L106 | Logo mobile | Nao -- above-the-fold (condicional, mas small). |
| `AppLayout.tsx` L45 | Logo header | Nao -- always visible no header. |
| `ResetPassword.tsx` | Logos (2x) | Nao -- above-the-fold. |

**Veredicto**: Nenhuma imagem precisa de lazy loading. Todas sao above-the-fold ou logos pequenos no header. Correto como esta.

---

## 4. Polling e Event Listeners Redundantes

### 4.1 `setInterval` de 30s em CriativoDetails (JA SINALIZADO)

Linha 196: `setInterval(loadRealtimeStats, 30000)` faz RPC ao Supabase a cada 30s, mesmo com a tab em background. Consome recursos do banco sem necessidade.

Este item ja foi sinalizado na auditoria anterior como "risco medio". Mantenho a recomendacao: **remover o interval, manter apenas botao manual "Recarregar"**.

### 4.2 `usePreloadPages` -- preload redundante com lazy loading

O hook `usePreloadPages` faz `import()` de InsertionOrders, Campanhas e Criativos via `requestIdleCallback`. Porem, o App.tsx ja usa `React.lazy()` que carrega esses chunks sob demanda quando o usuario navega. O preload antecipa o download, mas:
- Consome bandwidth desnecessariamente se o usuario so acessa 1 pagina
- Para a rota `/` (InsertionOrders), o chunk ja carrega imediatamente -- preload e redundante
- As outras 2 paginas serao carregadas em ~100ms quando acessadas (chunks pequenos)

**Avaliacao**: Baixo impacto. Manter como esta (usa `requestIdleCallback`, nao bloqueia). Sinalizado apenas para consciencia.

### 4.3 Event listeners -- OK

`use-mobile.tsx` usa `matchMedia.addEventListener("change")` com cleanup correto.
`sidebar.tsx` usa `window.addEventListener("keydown")` com cleanup correto.
Nenhum caso de delegation que faria diferenca (poucos listeners, todos em componentes React com lifecycle correto).

---

## 5. CSS Nao-Critico no Head

O Vite ja faz bundle e injeta CSS via JS (module), entao nao ha `<link rel="stylesheet">` de CSS local no head -- isso e correto.

O unico CSS externo no head e o Google Fonts (item 1.1 acima).

O `index.css` com todas as variaveis CSS e carregado via import no `main.tsx`, inline pelo Vite no bundle. Nao bloqueia separadamente.

---

## Plano de Execucao

### Risco zero:
1. Remover `<link rel="preload" ...d177fad6...>` do `index.html` (imagem de Auth nao deve ser preloaded globalmente)
2. Remover peso `300` do URL do Google Fonts (nao usado)

### Risco baixo:
3. Tornar Google Fonts non-render-blocking com pattern `preload` + `onload`
4. Adicionar `width`/`height` nas `<img>` de logo em `AppLayout.tsx`, `Auth.tsx`, `ResetPassword.tsx` (reduz CLS)

### Risco medio (ja sinalizado anteriormente):
5. Remover `setInterval` de 30s em `CriativoDetails.tsx`

### Arquivos a modificar:
- `index.html` (itens 1, 2, 3)
- `src/components/layout/AppLayout.tsx` (item 4)
- `src/pages/Auth.tsx` (item 4)
- `src/pages/ResetPassword.tsx` (item 4)

