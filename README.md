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

A base contém **352 artistas (53 brasileiros) e 470 relações**, das quais **468 verificadas** e duas antigas preservadas como pendentes. A expansão para até 1.000 continua por lotes auditáveis: esta entrega prioriza evidência em vez de preencher a meta. Confira [a curadoria da fase 3](docs/phase3-curation.md), [a revisão anterior](docs/editorial-review.md) e `src/data/evidence.json`.

## Próximas melhorias

- Diversificar fontes primárias e resolver as duas pendências editoriais preservadas.
- Melhorar filtros e persistir o estado do grafo na URL.
- Adicionar modo de encontrar caminhos entre artistas.

## Licença

Nenhuma licença definida por enquanto.

## Menu de televisão e versão móvel

A visualização padrão é um menu de três colunas: influências à esquerda, artista atual ao centro e influenciados à direita. As listas têm cartões alinhados de altura uniforme e rolagem independente. A coluna central mantém o artista atual e informa qual candidato está em destaque, aguardando confirmação. As colunas laterais acompanham o destaque de cima/baixo automaticamente.

No celular, a interface ocupa a altura útil da tela (`100dvh`), sem rolagem da página. O D-pad fica fixo na base, respeitando a área segura do aparelho. “Busca e detalhes” abre um painel rolável; selecionar um resultado o fecha. Os controles preservam alvos de toque de pelo menos 44 pixels, inclusive em telas baixas.

“Mapa descoberto” continua disponível como visualização opcional, com pan, zoom e minimapa fixo ao lado do D-pad. A faixa inferior é reservada aos controles. Alternar entre menu e mapa preserva seleção, URL e artistas descobertos. O menu não precisa de minimapa.

## Explorar o mapa

- Inicialmente aparecem apenas o artista do link (`?artist=radiohead`, por exemplo) e suas conexões diretas. Sem link válido, o início é R.E.M.
- A busca continua global: também encontra artistas ainda ocultos, incluindo brasileiros. Buscar ou clicar revela a vizinhança do artista e mantém as descobertas anteriores.
- **←** destaca a primeira influência do artista atual; **→** destaca o primeiro influenciado. Nenhuma seta muda o artista central. A ordenação é alfabética (`pt-BR`), com desempate por ID.
- **↓ / ↑** percorrem o destaque na coluna da direção escolhida, mantendo a lista ancorada no artista central. **Selecionar** (botão central do D-pad) ou **Enter** confirma a opção destacada; só então o centro, o painel, as descobertas e a URL são atualizados. Enter durante digitação ou sobre outros controles mantém o comportamento nativo. Ao terminar, a lista volta ao início. Antes de escolher uma direção, cima/baixo usam as influências recebidas.
- Listas vazias não mudam a seleção e exibem uma mensagem. Continuidade artística continua no mapa, tracejada, mas não entra na lista de influências.
- Os botões “Primeira influência” e “Primeiro influenciado” mostram a próxima opção. Passar o mouse ou focar um botão da lista destaca a conexão em âmbar antes de segui-la. Clicar em um cartão também apenas o destaca. Enter sobre um cartão confirma o destaque atual, inclusive após usar cima/baixo.
- As setas não são capturadas durante digitação, edição de texto, atalhos modificados ou navegação dentro do minimapa.
- O D-pad utiliza exatamente os mesmos movimentos; tem rótulos acessíveis, botões de pelo menos 44 pixels e pode ser recolhido.
- “Recolher ramos distantes” conserva apenas o artista atual e suas conexões diretas. “Reiniciar exploração” retorna ao artista inicial desta visita e limpa as descobertas. A base editorial nunca é alterada por esses controles.
- “Ver região descoberta” enquadra somente os nós revelados. “Centralizar selecionado” volta à seleção atual. Pan, roda do mouse e gestos de toque continuam disponíveis.
- Os filtros Passado/Futuro/Todas alteram o destaque, preservando todas as conexões existentes entre artistas já descobertos.
- O minimapa representa exclusivamente a região descoberta, com enquadramento sincronizado e navegação por clique/arraste/teclado. A câmera não recalcula o layout.

As posições são calculadas uma vez a partir da base completa e reutilizadas. O Cytoscape recebe incrementalmente apenas os elementos descobertos; nós ocultos não são instanciados nele nem desenhados no minimapa. Novos nós têm uma transição curta, respeitando a preferência por movimento reduzido. Ciclos e múltiplas influências continuam permitidos.

## Testes automatizados

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm test
npm run test:coverage
npm run build
```

A suíte usa Vitest, React Testing Library, jsdom e cobertura V8. O HTML da cobertura é gerado em `coverage/index.html` e não é versionado. Confira [escopo, limites e desempenho](docs/testing.md). Para repetir o benchmark com a base editorial real: `node scripts/benchmark.mjs`.

As relações exibem a natureza da evidência: declaração do artista, fonte secundária, continuidade artística ou revisão pendente. `evidenceType` e `verificationStatus` são metadados opcionais compatíveis com a estrutura anterior; os dados editoriais originais foram preservados.


## Lote de folk norte-americano

Woody Guthrie foi incluído como influência de Bob Dylan, com declaração de Dylan reproduzida pelo Smithsonian Folkways. A expansão acrescentou 23 artistas e 34 relações, incluindo Pete Seeger, Odetta, Lead Belly, Joan Baez, Phil Ochs, Tom Paxton, Ramblin' Jack Elliott e desdobramentos contemporâneos. Veja [fontes e critérios do lote](docs/folk-norte-americano.md).


## Destacar e selecionar

As setas e o D-pad apenas navegam pelas opções. O novo botão **Selecionar** confirma a entrada no artista destacado. Sem candidato válido, ele fica desabilitado. A busca global continua abrindo diretamente o resultado escolhido, assim como os cliques no mapa opcional. Nenhuma relação editorial foi alterada nesta revisão.
