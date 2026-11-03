# Testes e desempenho

- `npm test`: Vitest com React Testing Library e jsdom.
- `npm run test:coverage`: execução com instrumentação V8; relatório HTML em `coverage/index.html` e JSON em `coverage/coverage-summary.json`.
- `node scripts/benchmark.mjs`: medição reproduzível do layout real e destaque de todos os artistas em Cytoscape headless.
- `npm run build`: TypeScript e bundle de produção.

A suíte cobre integridade editorial/referencial, duplicatas, confiança e fontes, preservação da base original, conectividade da base real, busca, seleção, painel, URL válida/inválida, histórico, filtros, notas e classificação de evidência, casos sem conexões em uma direção, fit e centralização, limpeza de recursos, preservação das posições e do renderer, ciclos e múltiplos pais, minimapa com clique/arraste/teclado e atualização de enquadramento durante pan/zoom.

O minimapa é testado com o Cytoscape real em modo headless e contexto canvas simulado. Um teste com os artistas da base executa 60 atualizações da câmera, confirmando que a imagem da rede fica em cache e nenhum layout é executado. Posições e cores visuais não são usadas como snapshots. O teste da câmera verifica invariantes de centralização e sincronização, sem depender de coordenadas fixas do layout.

O relatório inclui App, Graph, Minimap, layout, navigation e o validador; exclui apenas o bootstrap `main.tsx`. JSON editorial é validado semanticamente, não contado como código executável. Limiares mínimos: 85% linhas/instruções/funções e 75% branches. A cobertura não substitui avaliação visual nem comprova veracidade histórica: a verificação das fontes é editorial.

`docs/performance.json` registra uma execução local com os dados reais. O benchmark headless mede cálculo e mudanças de destaque, não rasterização em navegador, taxa de quadros ou latência de gestos em um aparelho físico. As verificações de tempo automatizadas têm limites generosos para detectar regressões grandes sem depender da velocidade da máquina. Layout é calculado apenas quando os dados mudam; seleção, filtros, zoom e pan reutilizam a instância e as posições.

## Resultado desta revisão

Na fase 3, em 2 de novembro de 2026: **90 testes aprovados em sete arquivos**. Cobertura V8: **100% linhas, 100% instruções, 98,07% funções e 94,24% branches**, no escopo descrito acima. `npm test`, `npm run test:coverage` e `npm run build` passaram. O build mantém um aviso de chunk superior a 500 kB; ele não impede a geração do bundle.


## Exploração progressiva

A suíte também cobre as quatro setas e os quatro botões do D-pad, ordenação e desempate, listas vazias/circulares, origem da lista ancorada, proteção dos campos de edição, busca global por artista brasileiro oculto, prévia de conexões, recolhimento/reinício e preservação de posições ao remover e revelar novamente. Um teste com catálogo **sintético** de 1.000 artistas confirma que apenas dois/três artistas descobertos entram no renderer e que a instância permanece a mesma. Esses nomes sintéticos são fixtures de desempenho, nunca dados editoriais.

O benchmark atual registra o layout completo, a quantidade inicial instanciada e o tempo agregado para percorrer todos os artistas, adicionando somente elementos descobertos. Testes do minimapa confirmam a remoção e a adição de elementos no raster em cache. As medições não substituem um ensaio em dispositivo físico.


## Menu de televisão

96 testes em oito arquivos após a introdução do menu. A suíte adicional cobre as duas colunas ordenadas, alternativas da direção escolhida, prévia/foco/clique, listas vazias, visualização padrão, troca menu/mapa e abertura/fechamento de busca e detalhes. Cobertura: 100% linhas/instruções, 95,38% funções e 94,31% branches. O build passou. A tentativa de validação em Chromium neste ambiente falhou ao iniciar o processo do navegador; não foi concluído um ensaio visual em navegador real nesta revisão.


## Lote folk norte-americano

100 testes aprovados em nove arquivos. Os quatro testes novos verificam a direção Woody Guthrie → Bob Dylan, a consulta/revelação desta influência, caminhos distintos por Odetta/Pete Seeger/Lead Belly e as fontes de todas as relações do lote. Cobertura V8 mantida: 100% linhas/instruções, 95,38% funções e 94,31% branches. Build aprovado.


## Confirmação explícita de navegação

104 testes aprovados em nove arquivos. As setas apenas destacam candidatos; o artista central, o painel, a URL e o conjunto descoberto só mudam após Selecionar/Enter. Há um teste específico de The Beatles → destaque Bob Dylan → confirmação. Também são cobertos o D-pad, Enter durante busca, ativação nativa de outros controles e Enter após mudar o destaque mantendo o foco DOM no cartão anterior. Cobertura V8: 100% linhas/instruções, 98,43% funções, 93,37% branches. Build aprovado.


## Contagens e fonte na prévia

109 testes aprovados em nove arquivos; build aprovado. Casos novos verificam contagens globais do candidato, fonte correta em ambas as direções, abertura segura em nova aba e ausência de fonte sem conexão destacada. A prévia mantém o centro e a URL. Cobertura: 100% linhas/instruções, 98,43% funções e 93,12% branches.


## Expansão brasileira e Elton John

119 testes aprovados em dez arquivos após o lote de 204 artistas e 357 relações. A nova suíte valida o manifesto, a preservação integral de artistas/relações/fontes anteriores por hashes, as direções dos novos caminhos brasileiros, as evidências de Elton, a descoberta progressiva e a ordenação estável. Um teste de componente abre o link de Elton, destaca Guilherme Arantes sem mudar o centro, verifica a fonte e confirma a navegação. O caso de direção vazia agora escolhe um artista pela ausência real de relações naquela direção, pois Clara Nunes passou a ter uma influência cadastrada.

`npm test`, `npm run test:coverage` e `npm run build` aprovados. Cobertura V8: **100% linhas/instruções, 98,43% funções e 93,12% branches**. Build: 971,92 kB de JavaScript (247,76 kB gzip), com o aviso já existente de chunk acima de 500 kB. Não houve mudança de arquitetura ou dependências.

Benchmark com os 556 artistas e 827 relações: 19 nós inicialmente descobertos, layout em 10,32 ms e exploração completa em 758,31 ms nesta execução local. São medições headless, sem avaliação de FPS ou toque em um aparelho real.

## Histórico visível em colunas

130 testes aprovados em 11 arquivos. Os casos novos cobrem três avanços, retornos recursivos, troca de ramo, caminhos nas duas direções, ciclos sem colunas duplicadas, direção explícita em influências recíprocas, buscas desconectadas e descarte apenas das descobertas abandonadas. Os testes de componentes verificam colunas históricas, acesso às etapas anteriores e atualização da URL após retorno e confirmação.

Build aprovado. Cobertura V8: 100% linhas/instruções, 97,14% funções e 93,31% branches. Dados editoriais e layout do Cytoscape preservados. A validação desta revisão foi automatizada; não inclui ensaio visual em navegador ou aparelho físico.
