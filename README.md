# Lembranças para 2030

Arquivo público e interativo da memória política do Brasil, organizado por estado.

> **Lema:** Não esqueceremos o que a extrema direita fez neste país.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mapa SVG interativo + Framer Motion
- Conteúdo: Google Sheets (CSV publicado) com fallback em `src/data/items.json`
- Sugestões: Google Forms (`NEXT_PUBLIC_SUGGEST_FORM_URL`)

## Como rodar

```bash
# Node 20+
cp .env.example .env.local
# edite as variáveis
npm install
npm run dev
```

```bash
npm run build && npm start
npm test
```

## Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUGGEST_FORM_URL` | Client | URL do Google Forms de sugestão |
| `NEXT_PUBLIC_FORM_ENTRY_UF` | Client | `entry.XXXX` do campo Estado (pré-preenchimento) |
| `NEXT_PUBLIC_FORM_ENTRY_TIPO` | Client | `entry.XXXX` do campo Tipo (opcional) |
| `SHEET_CSV_URL` | **Servidor** | CSV da aba **publicados** |
| `REVALIDATE_SECRET` | Servidor | Bearer/secret para `POST /api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | Client | URL canônica (SEO) |

Na Vercel: Project → Settings → Environment Variables.  
**Nunca** prefixe `SHEET_CSV_URL` com `NEXT_PUBLIC_` — a URL da planilha não pode ir para o browser.

---

## 1. Google Forms (sugestões)

1. Crie um Form com os campos alinhados à planilha (tipo, estado, data, título, descrição, link da fonte, nome da fonte, mídia, crédito, temas, nome opcional).
2. Em **Respostas**, vincule a uma planilha do Google Sheets.
3. Copie o link de envio do formulário → `NEXT_PUBLIC_SUGGEST_FORM_URL`.
4. (Opcional) Abra o formulário, inspecione o HTML e anote `name="entry.123…"` dos campos Estado e Tipo → `NEXT_PUBLIC_FORM_ENTRY_UF` / `NEXT_PUBLIC_FORM_ENTRY_TIPO`.

Se `NEXT_PUBLIC_SUGGEST_FORM_URL` estiver vazia, os botões **Sugerir** são ocultados.

Pré-preenchimento (estado vazio do painel):

```
${FORM_URL}?usp=pp_url&${ENTRY_UF}=${encodeURIComponent(nomeDoEstado)}
```

Helper: `src/lib/suggest.ts` → `getSuggestUrl({ uf, categoria })`.

---

## 2. Planilha e aba "publicados"

### Fluxo de moderação

1. Respostas do Forms caem na aba padrão (ex.: **Form Responses 1**) com status implícito *pending*.
2. Crie uma aba **publicados**.
3. Copie/filtre apenas linhas aprovadas (adicione coluna `status` = `published`, ou use `FILTER`/`QUERY` apontando para a aba de respostas).
4. Publique **somente** a aba **publicados** como CSV:
   - Arquivo → Compartilhar → **Publicar na Web**
   - Escolha a aba **publicados** e formato **CSV**
   - Copie a URL (`…/pub?gid=…&single=true&output=csv`) → `SHEET_CSV_URL`

O site busca o CSV no servidor com `fetch(..., { next: { revalidate: 300 } })` (cache ~5 min) e faz parse com PapaParse. Linhas inválidas são descartadas com `console.warn` — nunca derrubam o site. Se a URL faltar ou a rede falhar, usa `src/data/items.json`.

### Cabeçalhos esperados

O mapeamento usa o **nome** do cabeçalho (normalizado: minúsculas, sem acento), nunca a posição da coluna.

| Cabeçalho (normalizado começa com / contém) | Campo |
|---|---|
| carimbo de data | `createdAt` |
| tipo de conteudo | `category` |
| estado | `uf` |
| data em que o fato | `date` |
| titulo | `title` |
| descricao | `description` |
| link da fonte original | `sourceUrl` |
| nome da fonte | `sourceName` |
| link para o conteudo de midia | `mediaUrl` |
| credito | `credit` |
| temas | `tags` |
| seu nome ou | `contributor` |
| link_arquivado / link arquivado | `archiveUrl` |
| status | `status` (só `published` entra) |

### Regras de conversão (`lib/sheet-mapper.ts`)

- **category:** Notícia→`noticia`, Imagem→`imagem`, Áudio→`audio`, Vídeo→`video`
- **uf:** nome do estado → sigla; “Nacional (Brasil inteiro)” → `BR`
- **date:** `DD/MM/YYYY` ou `YYYY-MM-DD` → `YYYY-MM-DD` (inválida = descarta linha)
- **tags:** separadas por vírgula → array normalizado
- **id:** sha1 curto de `sourceUrl + date + title`
- **URLs:** só `http:` / `https:`
- **mídia:** YouTube / Vimeo / Google Drive / arquivo direto — ver `lib/media.ts`

---

## 3. Revalidação sob demanda

Após aprovar um item na planilha, force o cache:

```bash
curl -X POST "https://seu-dominio/api/revalidate" \
  -H "Authorization: Bearer $REVALIDATE_SECRET"
```

ou

```bash
curl -X POST "https://seu-dominio/api/revalidate?secret=$REVALIDATE_SECRET"
```

Isso chama `revalidateTag('sheet-items')` e `revalidatePath('/')`.

API de leitura (sem expor a URL da planilha): `GET /api/items`.

---

## Estrutura

```
src/
  app/                 # /, /sobre, /api/items, /api/revalidate
  components/          # mapa, drawer, SuggestLink, cards…
  data/items.json      # fallback / exemplos [EXEMPLO]
  lib/
    content.ts         # filtros sobre a lista já carregada
    load-content.ts    # fetch CSV (server-only)
    sheet-mapper.ts    # conversão de linhas
    media.ts           # embeds YouTube/Vimeo/Drive
    suggest.ts         # URL do Forms
```

## Solução de problemas

| Sintoma | O que checar |
|---|---|
| Item não aparece | Está na aba **publicados**? `status=published`? |
| Item some no log | Data inválida, URL sem http(s), tipo/estado não reconhecidos (`console.warn` no servidor) |
| Site com dados de exemplo | `SHEET_CSV_URL` ausente ou fetch falhou → fallback JSON |
| Mudança demora a aparecer | Cache ISR de 5 min — use `/api/revalidate` |
| Botão Sugerir sumiu | Defina `NEXT_PUBLIC_SUGGEST_FORM_URL` |
| Pré-preenchimento não funciona | Confira `NEXT_PUBLIC_FORM_ENTRY_UF` (`entry.…`) e o rótulo do estado no Forms |

## URL compartilhável

`/?uf=SP&cat=video&de=2020-01-01&ate=2022-12-31&q=…&tag=…&ordem=antigos`
