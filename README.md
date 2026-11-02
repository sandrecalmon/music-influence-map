# Music Influence Map

Um mapa interativo de influências musicais. Protótipo inicial centrado no R.E.M.

## Rodar localmente

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abra o endereço indicado pelo Vite.

## Publicar no Cloudflare Pages

1. Envie o conteúdo **desta pasta** para a raiz do repositório GitHub.
2. No Cloudflare, acesse **Workers & Pages → Create → Pages → Connect to Git** (os nomes dos menus podem mudar).
3. Selecione o repositório `music-influence-map`.
4. Framework preset: **Vite**; build command: **`npm run build`**; output directory: **`dist`**.
5. Publique. Cada push posterior na branch principal poderá gerar um novo deploy.

## Dados

- `src/data/artists.json`: artistas, com IDs estáveis.
- `src/data/influences.json`: conexões direcionadas (`source` influenciou `target`).
- `confidence`: classificação editorial preliminar, não uma medição estatística.
- `evidenceUrl`: link de referência. Nem todas as fontes são comprovação primária individualizada; confira a nota da relação.
- `kind: "continuity"`: relação de continuidade artística, não influência declarada.

Este MVP inclui 19 artistas e 20 conexões, para validar a experiência antes de expandir para 60. As relações são uma curadoria inicial e devem ser revisadas antes de serem apresentadas como conclusões definitivas.

## Próximas melhorias

- Ampliar de 19 para 60 artistas com referências individualizadas.
- Melhorar filtros e persistir o estado do grafo na URL.
- Adicionar modo de encontrar caminhos entre artistas.

## Licença

Nenhuma licença definida por enquanto.
