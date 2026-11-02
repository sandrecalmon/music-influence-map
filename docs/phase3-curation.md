# Fase 3 — lote brasileiro e continuação internacional

## Entrega e limite da meta

**329 artistas, 53 brasileiros, 436 relações (434 verificadas e duas pendentes legadas).** Os 200 artistas e 276 relações da fase anterior foram preservados com seus campos editoriais; novas fixtures e um teste específico garantem essa preservação. Foram acrescentados 129 artistas e 160 relações com fonte. Todos pertencem ao componente conectado da rede inicial, sem inclusão de artistas isolados para atingir uma quota.

**Não foram atingidos 1.000 artistas. Faltam 671 para a meta.** Não há 671 nomes pré-cadastrados ou relações inferidas esperando aprovação: a continuação depende de revisar evidências individualizadas em novos lotes. Há espaço para aprofundar punk/indie brasileiro, Norte e Centro-Oeste, mulheres da bossa nova e samba, compositores regionais e interlocuções latino-americanas. Esses são eixos de pesquisa, não relações já afirmadas.

## Lotes verificáveis

`src/data/evidence.json` contém, para cada relação nova, URL, descrição curta do trecho, natureza da evidência e o lote (`fase-3-brasil` ou `fase-3-internacional`). As entradas da fase anterior foram mantidas.

- **Continuação internacional:** nomes e relações das seções *Influences*/*Influenced* do Rock Hall que ficaram fora do limite de 200 na fase anterior; inclui Kate Bush, Prince, Sheryl Crow, reggae e seus desdobramentos. Natureza secundária, confiança média.
- **Bossa nova, MPB e tropicalismo:** biografia oficial de Gilberto Gil; entrevistas de Caetano publicadas pela Nonesuch; entrevista de Gal à Noize; pesquisa e reportagem da Revista Continente e Rádio USP para a influência de João Gilberto e Johnny Alf. País atribuído apenas quando identificado com segurança; datas não foram inferidas.
- **Samba e formação vocal:** entrevistas de Paulinho da Viola ao Extra Classe e Marisa Monte à BBMag. A nota de Marisa delimita o contexto de formação familiar, sem usar colaborações como prova de influência.
- **Rock brasileiro e mangue:** especial Chico Science da EBC; entrevistas/reportagens sobre Sepultura, Renato Russo, Legião Urbana, Paralamas e Titãs. A relação Renato Russo e suas referências não foi automaticamente transferida para Legião Urbana. A influência de The Police em João Barone foi delimitada na nota da banda.
- **Novas gerações e música negra:** Liniker, Luedji Luna, Duda Beat e Emicida, por entrevistas e reportagens identificadas; os elos internacionais usam evidências específicas (por exemplo, a influência de Public Enemy em Racionais), não a mera presença de samples.
- **Mutantes e Rita Lee:** entrevistas de Sérgio Dias e comentário de Roberto de Carvalho; a nota de Rita restringe a influência descrita à gênese de *Caso Sério*. A reportagem com Kamille Viola documenta o impacto de *África Brasil* em Nação Zumbi, Mano Brown, Marcelo D2 e BNegão.

## Critérios e exclusões

As falas explícitas dos artistas são classificadas como `artist-statement` e têm confiança alta; narrativas institucionais/jornalísticas e relatos de terceiros são `secondary`, com confiança média. Um relato em primeira pessoa reproduzido por veículo jornalístico é identificado como tal na nota. O nível não significa probabilidade estatística.

Semelhança sonora, cover, colaboração, participação na mesma banda/cena e elogio isolado não bastam para criar um elo. Em particular, **não foi cadastrada Louis Armstrong → Elza Soares**: entrevistas mostram que Elza negava essa derivação vocal. Também não foi inventado um elo Tom Zé → Stereolab apenas por associação estética. Ligação institucional conjunta ou músico solo não foi confundido com sua banda.

As duas pendências antigas continuam visíveis como pendências: Radiohead → Coldplay e a continuidade Nirvana → Foo Fighters. Todos os elos novos têm `verificationStatus: verified` e URL auditável. Fonte verificável não significa que a página jamais poderá mudar ou sair do ar.
