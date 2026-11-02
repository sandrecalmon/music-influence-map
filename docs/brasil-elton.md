# MPB, samba, tropicalismo, música regional e Elton John

Revisão editorial: 2 de novembro de 2026.

| Medida | Antes | Depois | Adição |
| --- | ---: | ---: | ---: |
| Artistas | 352 | 556 | 204 |
| Artistas identificados como brasileiros | 53 | 231 | 178 |
| Relações | 470 | 827 | 357 |
| Relações verificadas | 468 | 825 | 357 |
| Pendências legadas | 2 | 2 | 0 |

Os objetos anteriores foram preservados integralmente. O [manifesto](brasil-elton-manifest.json) enumera os IDs e pares adicionados; `src/data/evidence.json` registra a URL, o local da evidência e a natureza de cada uma das 357 relações com o marcador `batch: "brasil-elton"`.

## Critério editorial

`source → target` significa que o primeiro influenciou o segundo. Entrevistas em que o próprio artista reconhece suas referências usam `artist-statement` e confiança `high`. Relatos editoriais, institucionais ou de terceiros usam `secondary` e confiança `medium`. São avaliações editoriais, não probabilidades.

As declarações podem estar reproduzidas em uma reportagem ou pesquisa; a classificação descreve quem faz a afirmação, não transforma o veículo em fonte primária original. Por exemplo, os depoimentos de *Two Rooms* são acessados por uma pesquisa da UFCG e essa mediação está identificada no localizador da evidência. A lembrança de Caleb Quaye sobre Elton é classificada como fonte secundária, pois não é uma declaração do próprio Elton.

Nenhuma relação foi deduzida apenas de colaboração, parentesco, cover, admiração genérica ou participação em um movimento. Nas entrevistas extensas, foram usados os trechos que respondem especificamente às perguntas sobre influências musicais, deixando de fora listas que apenas respondem quais artistas o entrevistado admira. Um músico solo e sua banda permanecem entidades distintas: as declarações de Jerry Cantrell e Axl Rose não foram automaticamente transferidas para Alice in Chains e Guns N' Roses. Tião Carreiro também permanece distinto da dupla Tião Carreiro e Pardinho.

A mesma referência pode chegar a diferentes destinos, e vários caminhos podem levar ao mesmo artista sem duplicação. Todos os novos artistas têm relações e pertencem ao componente conectado da rede anterior. Alguns possuem apenas influências recebidas ou apenas legado documentado; ausência de uma direção significa ausência de cadastro verificado, não inexistência histórica de influência.

Não foram atribuídos anos de início de carreira sem verificação específica. O campo opcional `year` não foi preenchido com datas de nascimento.

## Fontes e recortes

O Dicionário Cravo Albin, a UBC, a Rádio Câmara, a Rádio MEC, a ABL e a UFMG sustentam parte dos novos caminhos brasileiros. Entrevistas na Ritmo Melodia, Continente, Acessa e outros veículos documentam referências declaradas de diferentes gerações. Biografias oficiais de Zé Ramalho e Geraldo Azevedo conectam referências internacionais e regionais sem inferir influência a partir de apresentações conjuntas.

Há caminhos de samba e bossa nova, do tropicalismo e seus desdobramentos, do forró, da viola e da música instrumental, além de referências da formação de Gaby Amarantos e do tecnomelody. Nomes consolidados e artistas independentes entram pelas relações documentadas. O manifesto e o registro por par permitem revisar cada caminho sem depender de uma lista genérica de fontes.

Algumas grafias informais das entrevistas foram normalizadas para o nome artístico: “Demônio da Garoa” → Demônios da Garoa; “Sá e Guarabira” → Sá & Guarabyra; “Pena Branca e Xavantim” → Pena Branca e Xavantinho; “Aguinaldo Timóteo” → Agnaldo Timóteo; “Paralamas” → Os Paralamas do Sucesso. Menções ambíguas não foram transformadas em nós automaticamente. Um nome de integrante não foi convertido na banda por conveniência.

## Elton John

O lote documenta 26 conexões diretas: 11 referências recebidas e 15 destinos. O arquivo oficial de Elton, entrevistas, o Rock Hall e reportagens identificadas no registro de evidências sustentam esses vínculos.

O escopo específico permanece nas notas quando a evidência trata de uma obra: *Tumbleweed Connection*, *Out of the Game* ou *Nenhum Sinal do Sol*, por exemplo. Referências de atuação no palco também são identificadas como tal. Uma relação assim não pretende explicar toda a carreira do artista.

A seleção de participantes de *Revamp*, amizades e duetos não foram usados sozinhos como prova. Não foi incluída uma relação Beatles → Elton baseada apenas em uma lista genérica: sua influência exige contextualização por aspecto e período. “Todas as conexões possíveis” foi tratado como procurar vínculos documentáveis com a base existente e os novos nomes, sem alegar exaustividade histórica. Novos pares podem ser acrescentados quando houver evidência suficiente.

## Verificação e limites

A suíte compara hashes dos objetos anteriores, valida integridade, conectividade, pares únicos, URLs HTTPS e metadados, além do manifesto. Testes específicos verificam as direções brasileiras, fontes, distinção entre declaração e relato, prévia de Elton, confirmação para Guilherme Arantes, descoberta progressiva e ordenação estável. Eles não substituem a avaliação histórica humana nem garantem disponibilidade futura de sites externos.

O benchmark é headless e usa os 556 artistas reais. O layout completo é calculado inicialmente; a seleção continua reutilizando posições. Apenas a vizinhança descoberta é instanciada no Cytoscape. O resultado em `performance.json` não mede pintura em navegador ou latência em um celular físico.

A meta desta rodada de aproximadamente 200 novos artistas foi atendida. A expansão geral para 1.000 permanece aberta: faltam 444 artistas para esse teto, sempre condicionados a evidência verificável, com espaço para diversificar a cobertura regional e reduzir a concentração em determinados veículos. As duas relações antigas pendentes continuam explicitamente pendentes.
