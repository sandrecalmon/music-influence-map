import { render as rtlRender, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import App from '../src/App';
import artistData from '../src/data/artists.json';
import influenceData from '../src/data/influences.json';
function render(ui:React.ReactElement){const result=rtlRender(ui);fireEvent.click(screen.getByRole('button',{name:'Mapa descoberto',exact:true}));return result}
vi.mock('../src/components/Graph',()=>({default:({onSelect,onEdge,mode,selected,focusRequest,artists,influences,discovered}:any)=><div aria-label="Mapa de teste"><output data-testid="mode">{mode}</output><output data-testid="focus">{focusRequest}</output><output data-testid="selected">{selected}</output><output data-testid="discovered">{discovered.size}</output><output data-testid="nodes">{artists.length}</output><output data-testid="edges">{influences.length}</output><button onClick={()=>onSelect('radiohead')}>Mapa: Radiohead</button><button onClick={()=>onSelect('nirvana')}>Mapa: Nirvana</button><button onClick={()=>onEdge(influences.find((e:any)=>e.source==='pixies'&&e.target==='nirvana'))}>Relação declarada</button><button onClick={()=>onEdge(influences.find((e:any)=>e.source==='rem'&&e.target==='radiohead'))}>Relação secundária</button><button onClick={()=>onEdge(influences.find((e:any)=>e.kind==='continuity'))}>Relação continuidade</button><button onClick={()=>onEdge(influences.find((e:any)=>e.verificationStatus==='pending'&&!e.kind))}>Relação pendente</button></div>}));
it('starts with R.E.M. while retaining the complete catalog for search',()=>{render(<App/>);expect(screen.getByRole('heading',{name:'R.E.M.'})).toBeInTheDocument();expect(screen.getByTestId('nodes')).toHaveTextContent(String(artistData.length));expect(Number(screen.getByTestId('edges').textContent)).toBeGreaterThan(200)});
it('opens a valid URL selection',()=>{history.replaceState({},'','/?artist=radiohead');render(<App/>);expect(screen.getByRole('heading',{name:'Radiohead'})).toBeInTheDocument()});
it.each(['unknown','','__proto__'])('falls back for nonexistent artist %s',id=>{history.replaceState({},'',`/?artist=${id}`);render(<App/>);expect(screen.getByRole('heading',{name:'R.E.M.'})).toBeInTheDocument();expect(location.search).toBe('?artist=rem')});
it('updates artist details and URL on graph navigation',async()=>{render(<App/>);await userEvent.click(screen.getByRole('button',{name:'Mapa: Radiohead'}));expect(screen.getByRole('heading',{name:'Radiohead'})).toBeInTheDocument();expect(screen.getByText('Reino Unido · Desde 1985')).toBeInTheDocument();expect(location.search).toBe('?artist=radiohead');await userEvent.click(screen.getByRole('button',{name:'Mapa: Nirvana'}));expect(location.search).toBe('?artist=nirvana')});
it('searches case insensitively and selects an artist',async()=>{render(<App/>);await userEvent.type(screen.getByLabelText('Buscar artista'),'rAdIo');await userEvent.click(screen.getByRole('button',{name:'Radiohead',exact:true}));expect(screen.getByRole('heading',{name:'Radiohead'})).toBeInTheDocument();expect(screen.getByLabelText('Buscar artista')).toHaveValue('')});
it('reports empty search results and clears the query',async()=>{render(<App/>);await userEvent.type(screen.getByLabelText('Buscar artista'),'zzzzzz');expect(screen.getByText('Nenhum artista encontrado')).toBeInTheDocument();await userEvent.click(screen.getByRole('button',{name:'Limpar busca'}));expect(screen.getByLabelText('Buscar artista')).toHaveValue('')});
it.each([['Passado','past'],['Futuro','future'],['Todas','both'],['Origens','past'],['Legado','future']])('passes %s filter without removing artists',async(label,mode)=>{render(<App/>);await userEvent.click(screen.getByRole('button',{name:label,exact:true}));expect(screen.getByTestId('mode')).toHaveTextContent(mode);expect(screen.getByTestId('nodes')).toHaveTextContent(String(artistData.length))});
it('recenters current artist without resetting selection',async()=>{render(<App/>);await userEvent.click(screen.getByRole('button',{name:'Mapa: Radiohead'}));const before=Number(screen.getByTestId('focus').textContent);await userEvent.click(screen.getByRole('button',{name:'Centralizar Radiohead'}));expect(Number(screen.getByTestId('focus').textContent)).toBeGreaterThan(before);expect(screen.getByTestId('selected')).toHaveTextContent('radiohead')});
it('restores selection on history navigation including invalid IDs',()=>{render(<App/>);history.replaceState({},'','/?artist=nirvana');fireEvent(window,new PopStateEvent('popstate'));expect(screen.getByRole('heading',{name:'Nirvana'})).toBeInTheDocument();history.replaceState({},'','/?artist=missing');fireEvent(window,new PopStateEvent('popstate'));expect(screen.getByRole('heading',{name:'R.E.M.'})).toBeInTheDocument()});
it.each([['Relação declarada','Declaração do artista'],['Relação secundária','Fonte secundária'],['Relação continuidade','Continuidade artística'],['Relação pendente','Revisão editorial pendente']])('displays source classification for %s',async(label,text)=>{render(<App/>);await userEvent.click(screen.getByRole('button',{name:label}));expect(screen.getByText(new RegExp(text))).toBeInTheDocument();expect(screen.getByRole('link',{name:'Consultar fonte'})).toHaveAttribute('target','_blank');await userEvent.click(screen.getByRole('button',{name:'Fechar',exact:true}));expect(screen.queryByRole('link',{name:'Consultar fonte'})).not.toBeInTheDocument()});

it('starts with a small neighborhood and preserves discovered artists through exploration',async()=>{render(<App/>);const initial=Number(screen.getByTestId('discovered').textContent);expect(initial).toBeLessThan(artistData.length);await userEvent.click(screen.getByRole('button',{name:'Mapa: Radiohead'}));expect(Number(screen.getByTestId('discovered').textContent)).toBeGreaterThanOrEqual(initial);await userEvent.click(screen.getByRole('button',{name:'Mapa: Nirvana'}));expect(Number(screen.getByTestId('discovered').textContent)).toBeGreaterThan(initial)});
it('uses all four directions to preview with the keyboard and D-pad, confirming separately',()=>{render(<App/>);const before=screen.getByTestId('discovered').textContent;fireEvent.keyDown(window,{key:'ArrowLeft'});const first=screen.getByRole('button',{name:'Selecionar',exact:true}).getAttribute('title');fireEvent.keyDown(window,{key:'ArrowDown'});expect(screen.getByRole('button',{name:'Selecionar',exact:true}).getAttribute('title')).not.toBe(first);fireEvent.keyDown(window,{key:'ArrowUp'});expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title',first!);expect(screen.getByTestId('selected')).toHaveTextContent('rem');expect(screen.getByTestId('discovered').textContent).toBe(before);expect(location.search).toBe('?artist=rem');fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));expect(screen.getByTestId('selected').textContent).not.toBe('rem');fireEvent.click(screen.getByRole('button',{name:'Reiniciar exploração'}));fireEvent.click(screen.getByRole('button',{name:'Destacar primeira influência'}));expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title',first!);fireEvent.click(screen.getByRole('button',{name:'Próximo artista na lista'}));fireEvent.click(screen.getByRole('button',{name:'Artista anterior na lista'}));expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title',first!);fireEvent.click(screen.getByRole('button',{name:'Destacar primeiro influenciado'}));expect(screen.getByTestId('selected')).toHaveTextContent('rem')});
it('does not intercept typing, contenteditable fields, prevented or modified keys',()=>{render(<App/>);const input=screen.getByLabelText('Buscar artista');for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'])fireEvent.keyDown(input,{key});expect(screen.getByTestId('selected')).toHaveTextContent('rem');fireEvent.keyDown(window,{key:'ArrowRight',ctrlKey:true});fireEvent.keyDown(window,{key:'Enter'});expect(screen.getByTestId('selected')).toHaveTextContent('rem')});
it('collapses discovered branches and restarts at the initial URL artist',async()=>{history.replaceState({},'','/?artist=radiohead');render(<App/>);await userEvent.click(screen.getByRole('button',{name:'Mapa: Nirvana'}));const before=Number(screen.getByTestId('discovered').textContent);await userEvent.click(screen.getByRole('button',{name:'Recolher ramos distantes'}));expect(Number(screen.getByTestId('discovered').textContent)).toBeLessThanOrEqual(before);await userEvent.click(screen.getByRole('button',{name:'Reiniciar exploração'}));expect(screen.getByTestId('selected')).toHaveTextContent('radiohead')});
it('can collapse mobile controls and preview a candidate before clicking it',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Recolher controle'}));expect(screen.queryByRole('group',{name:'Navegação direcional'})).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Abrir controle'}));fireEvent.click(screen.getByRole('button',{name:'Destacar primeira influência'}));const list=screen.getByLabelText('Opções de navegação');const buttons=list.querySelectorAll('button');fireEvent.mouseEnter(buttons[1]);fireEvent.focus(buttons[1]);fireEvent.click(buttons[1]);expect(buttons[1]).toHaveAttribute('aria-current','true')});

it('searches for an undiscovered Brazilian artist and reveals its neighborhood',async()=>{render(<App/>);const before=Number(screen.getByTestId('discovered').textContent);await userEvent.type(screen.getByLabelText('Buscar artista'),'Caetano Veloso');await userEvent.click(screen.getByRole('button',{name:'Caetano Veloso',exact:true}));expect(screen.getByRole('heading',{name:'Caetano Veloso'})).toBeInTheDocument();expect(location.search).toBe('?artist=caetano-veloso');expect(Number(screen.getByTestId('discovered').textContent)).toBeGreaterThan(before)});
it('reports an empty direction without changing selection',async()=>{
 const root=artistData.find(a=>!influenceData.some(e=>e.target===a.id&&e.kind!=='continuity'))!;
 expect(root).toBeDefined();
 history.replaceState({},'',`/?artist=${root.id}`);
 render(<App/>);
 fireEvent.keyDown(window,{key:'ArrowLeft'});
 expect(screen.getByTestId('selected')).toHaveTextContent(root.id);
 expect(screen.getByRole('status',{name:'Estado da navegação'})).toHaveTextContent('Nenhum artista nesta direção.');
});

it('previews a connection before following it',()=>{render(<App/>);const options=screen.getByLabelText('Próximas conexões');const button=options.querySelector('button')!;fireEvent.mouseEnter(button);fireEvent.focus(button);expect(screen.getByTestId('selected')).toHaveTextContent('rem');fireEvent.click(button);expect(screen.getByTestId('selected')).toHaveTextContent('rem');fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));expect(screen.getByTestId('selected').textContent).not.toBe('rem')});

it('starts in television menu mode and keeps the same selection when switching views',()=>{rtlRender(<App/>);expect(screen.getByLabelText('Menu de artistas')).toBeInTheDocument();expect(screen.getByRole('button',{name:'Menu de artistas',exact:true})).toHaveAttribute('aria-pressed','true');fireEvent.click(screen.getByRole('button',{name:'Destacar primeira influência'}));const name=screen.getByLabelText('Artista atual').querySelector('strong')!.textContent;fireEvent.click(screen.getByRole('button',{name:'Mapa descoberto',exact:true}));expect(screen.getByRole('heading',{name:name!,exact:true})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Menu de artistas',exact:true}));expect(screen.getByLabelText('Artista atual')).toHaveTextContent(name!)});
it('opens and closes mobile search/details without resetting exploration',()=>{rtlRender(<App/>);const button=screen.getByRole('button',{name:'Busca e detalhes'});fireEvent.click(button);expect(screen.getByRole('button',{name:'Fechar detalhes'})).toHaveAttribute('aria-expanded','true');fireEvent.change(screen.getByLabelText('Buscar artista'),{target:{value:'Radiohead'}});fireEvent.click(within(screen.getByRole('region',{name:'Resultados da busca'})).getByRole('button',{name:'Radiohead',exact:true}));expect(screen.getByRole('button',{name:'Busca e detalhes'})).toHaveAttribute('aria-expanded','false');expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Radiohead')});

it('keeps The Beatles centered until Bob Dylan is confirmed with Enter',()=>{history.replaceState({},'','/?artist=the-beatles');render(<App/>);expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toBeDisabled();fireEvent.keyDown(window,{key:'ArrowRight'});expect(screen.getByRole('heading',{name:'The Beatles',exact:true})).toBeInTheDocument();expect(location.search).toBe('?artist=the-beatles');expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title','Selecionar Bob Dylan');fireEvent.keyDown(window,{key:'Enter'});expect(screen.getByRole('heading',{name:'Bob Dylan',exact:true})).toBeInTheDocument();expect(location.search).toBe('?artist=dylan');expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toBeDisabled()});
it('does not confirm a pending artist by Enter while typing in search',()=>{render(<App/>);fireEvent.keyDown(window,{key:'ArrowRight'});fireEvent.keyDown(screen.getByLabelText('Buscar artista'),{key:'Enter'});expect(screen.getByTestId('selected')).toHaveTextContent('rem')});
it('does not intercept native Enter activation of unrelated buttons',()=>{render(<App/>);fireEvent.keyDown(window,{key:'ArrowRight'});fireEvent.keyDown(screen.getByRole('button',{name:'Busca e detalhes'}),{key:'Enter'});expect(screen.getByTestId('selected')).toHaveTextContent('rem')});
it('shows counts and the correct source for a pending Beatles to Dylan connection',()=>{history.replaceState({},'','/?artist=the-beatles');rtlRender(<App/>);fireEvent.keyDown(window,{key:'ArrowRight'});expect(screen.getByRole('heading',{name:'The Beatles',exact:true})).toBeInTheDocument();expect(screen.getByLabelText('Fonte da conexão').querySelector('a')).toHaveAttribute('href','https://rockhall.com/inductees/beatles/');expect(screen.getByRole('status',{name:'Artista destacado'}).textContent).toMatch(/\d+\/\d+/);expect(location.search).toBe('?artist=the-beatles')});
it('uses the incoming connection source when previewing Woody from Dylan',()=>{history.replaceState({},'','/?artist=dylan');rtlRender(<App/>);const column=screen.getByLabelText('Influências');fireEvent.click(within(column).getByRole('button',{name:'Woody Guthrie',exact:true}));expect(screen.getByLabelText('Fonte da conexão').querySelector('a')).toHaveAttribute('href','https://folkways.si.edu/artists/woody-guthrie');expect(screen.getByRole('heading',{name:'Bob Dylan',exact:true})).toBeInTheDocument()});

it('opens Elton from a direct link and confirms a Brazilian connection with its source',()=>{
 history.replaceState({},'','/?artist=elton-john');
 rtlRender(<App/>);
 expect(screen.getByRole('heading',{name:'Elton John',exact:true})).toBeInTheDocument();
 const future=screen.getByLabelText('Influenciados');
 fireEvent.click(within(future).getByRole('button',{name:'Guilherme Arantes',exact:true}));
 expect(screen.getByRole('heading',{name:'Elton John',exact:true})).toBeInTheDocument();
 expect(location.search).toBe('?artist=elton-john');
 expect(screen.getByLabelText('Fonte da conexão').querySelector('a')).toHaveAttribute('href','https://screamyell.com.br/site/2021/08/12/entrevista-guilherme-arantes-fala-sobre-vida-universo-carreira-e-seu-novo-disco-a-desordem-dos-templarios/');
 fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));
 expect(location.search).toBe('?artist=guilherme-arantes');
 expect(screen.getByRole('heading',{name:'Guilherme Arantes',exact:true})).toBeInTheDocument();
});

it('keeps revealed cards fixed, highlights only the current path and resets explicitly',()=>{
 history.replaceState({},'','/?artist=rem');rtlRender(<App/>);
 const board=within(screen.getByLabelText('Região explorada'));
 const enter=(name:string)=>{
  fireEvent.click(board.getByRole('button',{name,exact:true}));
  fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));
 };
 enter('Radiohead');enter('Coldplay');
 const coldplay=board.getByRole('button',{name:'Coldplay',exact:true});
 expect(coldplay).toHaveClass('current-card');
 const radiohead=board.getByRole('button',{name:'Radiohead',exact:true});
 const column=radiohead.getAttribute('data-column'),row=radiohead.getAttribute('data-row');
 fireEvent.click(within(screen.getByLabelText('Caminho da exploração')).getByRole('button',{name:'Radiohead',exact:true}));
 expect(location.search).toBe('?artist=radiohead');
 expect(board.getByRole('button',{name:'Coldplay',exact:true})).toBe(coldplay);
 expect(coldplay).toHaveClass('context-card');
 expect(radiohead).toHaveAttribute('data-column',column);expect(radiohead).toHaveAttribute('data-row',row);
 fireEvent.click(within(screen.getByLabelText('Caminho da exploração')).getByRole('button',{name:'R.E.M.',exact:true}));
 enter('Nirvana');
 expect(screen.getByLabelText('Caminho da exploração')).not.toHaveTextContent('Coldplay');
 expect(coldplay).toHaveClass('context-card');
 expect(screen.getByLabelText('Artista atual')).toHaveTextContent('Nirvana');
 fireEvent.click(screen.getByRole('button',{name:'Reiniciar exploração'}));
 expect(screen.getByLabelText('Artista atual')).toHaveTextContent('R.E.M.');
 expect(screen.queryByLabelText('Caminho da exploração')).not.toBeInTheDocument();
});

it('can preview REM again from Led Zeppelin before entering Aerosmith and dimming REM',()=>{
 history.replaceState({},'','/?artist=rem');rtlRender(<App/>);
 const board=within(screen.getByLabelText('Região explorada'));
 const rem=board.getByRole('button',{name:'R.E.M.',exact:true});
 fireEvent.click(board.getByRole('button',{name:'Led Zeppelin',exact:true}));
 fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));
 expect(location.search).toBe('?artist=led-zeppelin');
 fireEvent.click(screen.getByRole('button',{name:'Destacar primeiro influenciado'}));
 expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title','Selecionar R.E.M.');
 expect(location.search).toBe('?artist=led-zeppelin');
 fireEvent.click(screen.getByRole('button',{name:'Próximo artista na lista'}));
 expect(screen.getByRole('button',{name:'Selecionar',exact:true})).toHaveAttribute('title','Selecionar Aerosmith');
 fireEvent.click(screen.getByRole('button',{name:'Selecionar',exact:true}));
 expect(location.search).toBe('?artist=aerosmith');
 expect(rem).toHaveClass('context-card');expect(rem).toHaveAttribute('data-route','false');
 expect(board.getByRole('button',{name:'Led Zeppelin',exact:true})).toHaveClass('route-card');
});
