# Revisão editorial — 2 de novembro de 2026

A base contém **200 artistas e 276 relações**, preservando os 19 artistas e as 20 relações originais. Os testes comparam todos os campos editoriais originais com fixtures, além de verificar IDs, duplicatas, confiança e referências.

**274 relações verificadas nesta revisão**: 273 documentadas pela curadoria secundária do Rock & Roll Hall of Fame e uma declaração do artista. A relação Pixies → Nirvana usa a entrevista de Kurt Cobain a David Fricke, republicada pela Rolling Stone britânica; a declaração trata especificamente da composição/dinâmica de *Smells Like Teen Spirit*, não de toda a obra da banda.

O arquivo `src/data/evidence.json` identifica a página e a seção de cada constatação. Nas páginas do Rock Hall, `Influences` significa artista listado → artista da página; `Influenced` significa artista da página → artista listado. Não foram inferidas relações a partir de participações, semelhança sonora, covers, datas ou da mesma cena musical. As relações novas de curadoria institucional usam confiança média. As classificações preexistentes foram preservadas.

## Limitações e pendências preservadas

- Radiohead → Coldplay: relação antiga com fonte Wikipedia e nota já solicitando uma fonte primária mais específica. Preservada com `verificationStatus: pending` e `evidenceType: legacy-unreviewed`.
- Nirvana → Foo Fighters: relação antiga de **continuidade artística**, com a página inicial do Foo Fighters como referência insuficiente para uma verificação individual. Mantida tracejada, separada de influência musical, com `verificationStatus: pending`.
- Uma página institucional é evidência de uma atribuição editorial, não comprovação de declaração direta do artista. Nenhuma lista institucional foi promovida a declaração direta.
- Anos, países e gêneros dos novos artistas não foram preenchidos por inferência. São opcionais na interface e podem ser enriquecidos após revisão específica.
- Foram normalizadas grafias de nomes presentes nas fontes, como Lana Del Rey, Motörhead, St. Vincent, Twenty One Pilots e The Black Crowes. Florence Welch e Big Boi são artistas solo; não foram confundidos com seus grupos. Excluídas referências literárias como Arthur Rimbaud e Emily Brontë e a entrada institucional conjunta Small Faces/Faces, cuja separação exigiria análise adicional.
- A expansão manteve um único componente conectado a R.E.M.; não há artistas adicionados isoladamente. A abertura para blues, soul, funk, jazz, country e pop acompanha conexões documentadas com o rock. O limite de 200 interrompe a inclusão de novos nomes, não inventa conexões para preencher uma quota.
- Há dependência importante de uma única instituição. Uma próxima revisão deve diversificar a bibliografia com entrevistas e fontes primárias, além de resolver as duas pendências antigas.

## Critério de confiança

`high`, `medium` e `low` continuam sendo graus editoriais, não probabilidades. `evidenceType` descreve a natureza da fonte; `verificationStatus` indica se a relação foi checada nesta revisão. Os campos são independentes: uma confiança antiga alta não transforma uma relação pendente em verificada.
