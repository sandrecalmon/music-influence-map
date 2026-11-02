# Testes e desempenho

- `npm test`: Vitest com React Testing Library e jsdom.
- `npm run test:coverage`: execução com instrumentação V8; relatório HTML em `coverage/index.html` e JSON em `coverage/coverage-summary.json`.
- `node scripts/benchmark.mjs`: medição reproduzível do layout real e destaque de todos os artistas em Cytoscape headless.
- `npm run build`: TypeScript e bundle de produção.

A suíte cobre integridade editorial/referencial, duplicatas, confiança e fontes, preservação da base original, conectividade dos 200 artistas, busca, seleção, painel, URL válida/inválida, histórico, filtros, notas e classificação de evidência, casos sem conexões em uma direção, fit e centralização, limpeza de recursos, preservação das posições e do renderer, ciclos e múltiplos pais, minimapa com clique/arraste/teclado e atualização de enquadramento durante pan/zoom.

O minimapa é testado com o Cytoscape real em modo headless e contexto canvas simulado. Um teste com os 200 artistas executa 60 atualizações da câmera, confirmando que a imagem da rede fica em cache e nenhum layout é executado. Posições e cores visuais não são usadas como snapshots. O teste da câmera verifica invariantes de centralização e sincronização, sem depender de coordenadas fixas do layout.

O relatório inclui App, Graph, Minimap, layout, navigation e o validador; exclui apenas o bootstrap `main.tsx`. JSON editorial é validado semanticamente, não contado como código executável. Limiares mínimos: 85% linhas/instruções/funções e 75% branches. A cobertura não substitui avaliação visual nem comprova veracidade histórica: a verificação das fontes é editorial.

`docs/performance.json` registra uma execução local com os dados reais. O benchmark headless mede cálculo e mudanças de destaque, não rasterização em navegador, taxa de quadros ou latência de gestos em um aparelho físico. As verificações de tempo automatizadas têm limites generosos para detectar regressões grandes sem depender da velocidade da máquina. Layout é calculado apenas quando os dados mudam; seleção, filtros, zoom e pan reutilizam a instância e as posições.

## Resultado desta revisão

Em 2 de novembro de 2026: **64 testes aprovados em seis arquivos**. Cobertura V8: **100% linhas, 100% instruções, 100% funções e 93,53% branches**, no escopo descrito acima. `npm test`, `npm run test:coverage` e `npm run build` passaram. O build mantém um aviso de chunk superior a 500 kB; ele não impede a geração do bundle.
