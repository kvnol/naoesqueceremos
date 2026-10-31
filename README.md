# Lembranças para 2030

Arquivo público e interativo da memória política do Brasil — organizado por estado, para que o que aconteceu não se dissolva no feed.

> **Não esqueceremos o que a extrema direita fez neste país.**

## O projeto

O mapa do Brasil reúne notícias, imagens, áudios e vídeos da última década. Cada registro aponta para uma fonte verificável. O conteúdo passa por moderação antes de aparecer no site.

- **Site:** [naoesqueceremos.vercel.app](https://naoesqueceremos.vercel.app)
- **Sugerir conteúdo:** [abrir formulário](https://docs.google.com/forms/d/e/1FAIpQLSdaa8ukjb7jCfsrxAb8z8W6HTesMo_-YGqSlGiHppuDR9MTAQ/viewform)

## Como contribuir

1. Abra o [formulário de sugestão](https://docs.google.com/forms/d/e/1FAIpQLSdaa8ukjb7jCfsrxAb8z8W6HTesMo_-YGqSlGiHppuDR9MTAQ/viewform).
2. Informe o tipo (notícia, imagem, áudio ou vídeo), o estado (ou âmbito nacional), a data, o título, a descrição e o **link da fonte original**.
3. A equipe revisa a sugestão. Só entram no arquivo itens com fonte verificável.

Também dá para sugerir a partir do próprio site, pelo botão **Sugerir**, ou na página [Sobre](https://naoesqueceremos.vercel.app/sobre).

## Critérios

- Todo conteúdo precisa de fonte original acessível.
- Priorizamos registros ligados a autoritarismo, desinformação, violência política e ataques a direitos e instituições.
- Sugestões sem fonte, enganosas ou fora do escopo não são publicadas.

## Desenvolvimento

Para quem for contribuir com código:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Detalhes de configuração estão em `.env.example`. Em dúvida, abra uma issue ou fale com quem mantém o projeto.

## Analytics (GA4)

O site usa Google Analytics 4 (`NEXT_PUBLIC_GA_ID`) com **Consent Mode v2**: por padrão `analytics_storage` fica `denied` até a pessoa aceitar o banner (preferência em `localStorage` → `ga_consent`). Em desenvolvimento os eventos não são enviados, salvo `NEXT_PUBLIC_GA_DEBUG=true`.

### Eventos customizados

Cadastre no GA4 (Admin → Eventos / Dimensões personalizadas) os parâmetros em **snake_case**. Não enviamos dados pessoais nem URLs de fontes.

| Evento | Quando | Parâmetros |
| --- | --- | --- |
| `open_state` | Abre o painel de um UF / Brasil | `uf` |
| `change_category` | Troca a aba do painel | `uf`, `category` |
| `click_source` | Clique em “Fonte original” ou “Arquivado” | `uf`, `category`, `source_name` |
| `click_suggest` | Clique em Sugerir | `location` (`header` \| `drawer_empty` \| `footer` \| `sobre`), `uf?` |
| `copy_link` | Copia o link do painel | `uf` |
| `apply_date_filter` | *(reservado — UI de data ainda não existe)* | `from`, `to` |

Dimensões sugeridas no GA4 (escopo evento): `uf`, `category`, `source_name`, `location`.

Privacidade: [/privacidade](https://naoesqueceremos.vercel.app/privacidade).
