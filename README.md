# Music Influence Map

Um mapa interativo de influências musicais. Tema claro inspirado no VS Code, com influências anteriores à esquerda, o artista selecionado ao centro e artistas influenciados à direita.

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

A base contém **200 artistas e 276 relações**: **274 verificadas nesta revisão** e duas relações antigas preservadas como pendentes. A curadoria se expande a partir da rede original, incluindo rock, punk, indie, folk e conexões com blues, soul, funk e pop. Veja [a revisão editorial](docs/editorial-review.md) e o registro de fontes em `src/data/evidence.json`.

## Próximas melhorias

- Diversificar fontes primárias e resolver as duas pendências editoriais preservadas.
- Melhorar filtros e persistir o estado do grafo na URL.
- Adicionar modo de encontrar caminhos entre artistas.

## Licença

Nenhuma licença definida por enquanto.

## Explorar o mapa

- Todos os artistas e relações são carregados de uma vez. O layout hierárquico é calculado na criação da rede e mantém ciclos no mesmo nível, sem inventar relações.
- Busque um artista ou clique em um nó: a câmera se move suavemente, preservando as posições dos demais artistas.
- O selecionado e suas conexões diretas ficam destacados; Passado/Origens e Futuro/Legado limitam o destaque à direção escolhida, mantendo o restante visível.
- Arraste o fundo para mover o mapa, use a roda do mouse para zoom ou os gestos de toque no celular.
- Ver toda a rede ajusta o enquadramento; Centralizar selecionado volta ao artista atual.
- O minimapa mostra toda a rede e o enquadramento atual. Clique ou arraste para navegar; com o minimapa em foco, as setas do teclado também movem a câmera. Ele pode ser recolhido.
- O minimapa compartilha as posições do Cytoscape e mantém uma imagem em cache: zoom e pan atualizam somente o retângulo da câmera, sem executar layout.
- Links tracejados representam continuidade artística. Clique em uma relação para consultar a nota e a fonte.
- O parâmetro `?artist=ID` abre o mapa no artista indicado, por exemplo `?artist=radiohead`.

## Testes automatizados

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm test
npm run test:coverage
npm run build
```

A suíte usa Vitest, React Testing Library, jsdom e cobertura V8. O HTML da cobertura é gerado em `coverage/index.html` e não é versionado. Confira [escopo, limites e desempenho](docs/testing.md). Para repetir o benchmark com os 200 artistas reais: `node scripts/benchmark.mjs`.

As relações exibem a natureza da evidência: declaração do artista, fonte secundária, continuidade artística ou revisão pendente. `evidenceType` e `verificationStatus` são metadados opcionais compatíveis com a estrutura anterior; os dados editoriais originais foram preservados.
