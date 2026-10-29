# Lembranças para 2030

Arquivo público e interativo da memória política do Brasil (2016–2026), organizado por estado.

> **Lema:** Não esqueceremos o que a extrema direita fez neste país.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mapa do Brasil em SVG interativo
- Framer Motion (respeita `prefers-reduced-motion`)
- Conteúdo local via `src/data/items.json` + camada `src/lib/content.ts`

## Como rodar

```bash
# Node 20+ recomendado
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Estrutura

```
src/
  app/                 # rotas: /, /sobre, /sugerir
  components/          # BrazilMap, StateDrawer, DateFilter, Timeline…
  data/
    items.json         # conteúdos (só status "published" aparece)
    brazil-paths.ts    # paths SVG dos 27 estados
  lib/
    content.ts         # abstração de dados (troque o backend aqui)
    types.ts
    states.ts
    url-state.ts       # sync com query string
    suggestions.ts     # zod + submitSuggestion() mock
```

## URL compartilhável

Exemplos:

- `/?uf=SP`
- `/?uf=BR&cat=video`
- `/?uf=RJ&cat=imagem&de=2020-01-01&ate=2022-12-31`
- `/?uf=MG&q=educação&tag=educação&ordem=antigos`

Parâmetros: `uf`, `cat`, `de`, `ate`, `q`, `tag`, `ordem`.

## Trocar a fonte de dados

A UI só consome funções de `src/lib/content.ts` (`getItems`, `getCountsByUf`, `getCategoryCounts`, …).

Para migrar para Supabase / Google Sheets / Airtable:

1. Implemente as mesmas assinaturas em `content.ts` (async se precisar).
2. Ajuste os componentes clientes para `await` / React Query / SWR, se a API passar a ser remota.
3. Mantenha o formato de `ContentItem` em `lib/types.ts`.

Sugestões de conteúdo: `submitSuggestion()` em `lib/suggestions.ts` já valida com Zod e está mockada.

## Dados de exemplo

Itens com `[EXEMPLO]` no título são **fictícios**, só para testar a interface. Não trate como fatos históricos.

## Acessibilidade

- Estados do mapa focáveis por teclado (`Tab` / `Enter` / `Espaço`)
- `aria-label` com nome e contagem
- Painel com `role="dialog"`, Escape para fechar, foco inicial
- Contraste escuro com destaque âmbar/vermelho
- Animações reduzidas com `prefers-reduced-motion`
