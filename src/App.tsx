import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, ExternalLink, Focus, Search, X } from 'lucide-react';
import Graph from './components/Graph';
import ArtistMenu from './components/ArtistMenu';
import { expandMenu, menuNavigationIndex, type MenuSlots } from './components/menuMap';
import { graphIndex, reveal, nextMove, moveInMenu, isTyping, advanceTrail } from './components/exploration';
import type { NavigationSession, MoveKey, ExplorationStep, Side } from './components/exploration';
import artistData from './data/artists.json';
import influenceData from './data/influences.json';

type Artist = { id:string; name:string; year?:number; country?:string; genres?:string[] };
type Influence = {source:string;target:string;confidence:'high'|'medium'|'low';evidenceUrl:string;note:string;kind?:string;evidenceType?:string;verificationStatus?:string};
const artists: Artist[] = artistData;
const influences: Influence[] = influenceData as Influence[];
const index=graphIndex(artists,influences);
const names = new Map(artists.map(a=>[a.id,a.name]));
export default function App(){
 const [selected,setSelected]=useState(()=>{const initial=new URLSearchParams(window.location.search).get('artist');return artists.some(a=>a.id===initial)?initial!:'rem'});
 const [menuSlots,setMenuSlots]=useState<MenuSlots>(()=>expandMenu(new Map(),selected,index));
 const [trail,setTrail]=useState<ExplorationStep[]>(()=>[{id:selected}]);
 const [history,setHistory]=useState<string[]>(()=>[selected]);
 const previousArtist=history[history.length-2];
 const [view,setView]=useState<'menu'|'map'>('menu');
 const [detailsOpen,setDetailsOpen]=useState(false);
 const [startArtist]=useState(selected);
 const [discovered,setDiscovered]=useState(()=>reveal(new Set<string>(),selected,index));
 const [session,setSession]=useState<NavigationSession|null>(null);
 const [preview,setPreview]=useState<{origin:string;target:string}|null>(null);
 const [navigationMessage,setNavigationMessage]=useState('');
 const [padCollapsed,setPadCollapsed]=useState(false);
 const [focusRequest,setFocusRequest]=useState(0);
 const [search,setSearch]=useState('');
 const [mode,setMode]=useState<'both'|'past'|'future'>('both');
 const [edge,setEdge]=useState<Influence|null>(null);
 const navigation=menuNavigationIndex(index,menuSlots,selected);
 const current=artists.find(a=>a.id===selected)!;
 const incoming=influences.filter(e=>e.target===selected&&e.kind!=='continuity');
 const outgoing=influences.filter(e=>e.source===selected&&e.kind!=='continuity');
 const choose=(id:string,side?:Side)=>{if(!index.names.has(id))return;const nextTrail=advanceTrail(trail,id,index,side);setTrail(nextTrail);setHistory(path=>{
  const existing=path.lastIndexOf(id);
  return existing>=0?path.slice(0,existing+1):[...path,id];
 });setSelected(id);setDetailsOpen(false);setDiscovered(old=>reveal(old,id,index));setMenuSlots(old=>expandMenu(old,id,index));setSession(null);setPreview(null);setNavigationMessage('');setFocusRequest(n=>n+1);setEdge(null);setSearch('')};
 const pending=session?.candidates[session.index]??null;
 const pendingSource=pending&&session?influences.find(e=>(e.source===pending&&e.target===selected)||(e.source===selected&&e.target===pending))?.evidenceUrl:undefined;
 const stage=(id:string,side?:'past'|'future')=>{const direction=side??(index.past.get(selected)?.includes(id)?'past':'future');const choices=navigation[direction].get(selected)??[];const i=choices.indexOf(id);if(i<0)return;setSession({origin:selected,side:direction,candidates:choices,index:i});setPreview({origin:selected,target:id});setNavigationMessage(`${names.get(id)} em destaque. Pressione Selecionar para entrar.`)};
 const confirm=()=>{if(pending)choose(pending,session?.side)};
 const move=(key:MoveKey)=>{const result=view==='menu'?moveInMenu(selected,session,key,navigation,menuSlots,previousArtist):nextMove(selected,session,key,navigation);setSession(result.session);setPreview(result.empty?null:{origin:selected,target:result.candidate});setNavigationMessage(result.empty?'Nenhum artista nesta direção.':`${names.get(result.candidate)} em destaque · ${result.session.index+1} de ${result.session.candidates.length}. Pressione Selecionar para entrar.`)};

 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||isTyping(event.target))return;if(event.key==='Enter'&&!(event.target instanceof Element&&event.target.closest('button,a'))){event.preventDefault();confirm();return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();move(event.key as MoveKey)}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[selected,session,menuSlots,view,previousArtist,trail]);
 useEffect(()=>{const url=new URL(window.location.href);url.searchParams.set('artist',selected);window.history.replaceState({},'',url)},[selected]);
 useEffect(()=>{const restore=()=>{const id=new URLSearchParams(window.location.search).get('artist');choose(artists.some(a=>a.id===id)?id!:'rem')};window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore)},[trail,selected]);
 const candidates=session?.candidates??[];
 const initialChoices=[['past','Primeira influência',navigation.past.get(selected)?.[0]],['future','Primeiro influenciado',navigation.future.get(selected)?.[0]]] as const;
 const collapseExploration=()=>{setMenuSlots(expandMenu(new Map(),selected,index));setTrail([{id:selected}]);setHistory([selected]);setDiscovered(reveal(new Set(),selected,index));setSession(null);setPreview(null);setNavigationMessage('');setEdge(null);setFocusRequest(n=>n+1)};
 const results=artists.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())).slice(0,8);
 const chooseCandidate=(id:string,i:number)=>{if(!session)return;setSession({...session,index:i});setPreview({origin:session.origin,target:id});setNavigationMessage(`${names.get(id)} em destaque. Pressione Selecionar para entrar.`)};
 return <div className={`app tv-app ${detailsOpen?'details-open':''} ${padCollapsed?'pad-is-collapsed':''} view-${view}`}>
  <header><div className="brand"><div className="brand-icon">◉</div><div><strong>Music Influence Map</strong><small>Uma viagem pelas conexões da música</small></div></div><button className="mobile-details" aria-expanded={detailsOpen} aria-controls="artist-sidebar" onClick={()=>setDetailsOpen(value=>!value)}>{detailsOpen?'Fechar detalhes':'Busca e detalhes'}</button><div className="header-right"><span className="version">PROTÓTIPO · 01</span><span className="count">{artists.length} artistas · {influences.length} relações</span></div></header>
  <main><aside id="artist-sidebar" className="sidebar">
    <div className="section-kicker">EXPLORAR</div><h1>Descubra de onde vem a música.</h1><p className="intro">Siga as influências que conectam artistas, gerações e movimentos.</p>
    <div className="searchbox"><Search size={18}/><input aria-label="Buscar artista" placeholder="Buscar artista..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Limpar busca" onClick={()=>setSearch('')}><X size={16}/></button>}</div>
    {search&&<div className="results" role="region" aria-label="Resultados da busca">{results.length?results.map(a=><button key={a.id} onClick={()=>choose(a.id)}>{a.name}<ArrowRight size={15}/></button>):<p>Nenhum artista encontrado</p>}</div>}
    <div className="separator"/><div className="section-kicker">ARTISTA SELECIONADO</div><h2>{current.name}</h2><div className="metadata">{[current.country,current.year?`Desde ${current.year}`:null].filter(Boolean).join(' · ')}</div>
    <div className="statrow"><div><strong>{incoming.length}</strong><span>Influências recebidas</span></div><div><strong>{outgoing.length}</strong><span>Artistas influenciados</span></div></div>
    <div className="section-kicker">EXPLORAR CONEXÕES</div><div className="actions"><button onClick={()=>setMode('past')}><ArrowLeft size={16}/> Origens</button><button onClick={()=>setMode('future')}>Legado <ArrowRight size={16}/></button></div>
    <div className="section-kicker">DESTACAR CONEXÕES</div><div className="modes">{([['both','Todas'],['past','Passado'],['future','Futuro']] as const).map(([id,label])=><button className={mode===id?'active':''} onClick={()=>setMode(id)} key={id}>{label}</button>)}</div>
    <button className="reset" onClick={()=>{setFocusRequest(n=>n+1);setEdge(null)}}><Focus size={16}/> Centralizar {current.name}</button>
    <div className="exploration-actions"><button onClick={()=>{choose(startArtist);setMenuSlots(expandMenu(new Map(),startArtist,index));setTrail([{id:startArtist}]);setHistory([startArtist]);setDiscovered(reveal(new Set(),startArtist,index))}}>Reiniciar exploração</button><button onClick={collapseExploration}>Recolher ramos distantes</button></div>
    <p className="keyboard-help">← origens · → legado · ↑↓ mudam o destaque. Selecionar ou Enter confirma e muda o artista central.</p>
    <div role="status" aria-label="Estado da navegação" aria-live="polite">{navigationMessage}</div>
    <div className="preview-choices" aria-label="Próximas conexões">{initialChoices.map(([side,label,id])=><button key={side} disabled={!id} onMouseEnter={()=>id&&stage(id,side)} onFocus={()=>id&&stage(id,side)} onClick={()=>move(side==='past'?'ArrowLeft':'ArrowRight')}>{label}: {id?names.get(id):'nenhum'}</button>)}</div>
    {session&&<div className="candidate-list" aria-label="Opções de navegação"><strong>{view==='menu'?'Opções no mapa ·':session.side==='past'?'Influências de':'Influenciados por'} {names.get(session.origin)}</strong>{candidates.length?candidates.map((id,i)=><button key={id} aria-current={pending===id?'true':undefined} onMouseEnter={()=>chooseCandidate(id,i)} onFocus={()=>chooseCandidate(id,i)} onClick={()=>chooseCandidate(id,i)}>{names.get(id)}</button>):<p>Nenhum artista nesta direção.</p>}</div>}
    <div className="sidebar-note"><Compass size={18}/><span>Clique em um artista no mapa para descobrir seus caminhos. As setas apontam de quem influenciou para quem foi influenciado.</span></div>
  </aside><section className="grapharea"><div className="graph-top"><span><span className="live-dot"/> REDE DE INFLUÊNCIAS</span><span>{discovered.size} de {artists.length} artistas descobertos</span></div>
  <div className="view-switch" role="group" aria-label="Visualização"><button aria-pressed={view==='menu'} onClick={()=>setView('menu')}>Menu de artistas</button><button aria-pressed={view==='map'} onClick={()=>setView('map')}>Mapa descoberto</button>{previousArtist && <button aria-label={`Voltar para ${names.get(previousArtist)}`} onClick={()=>choose(previousArtist)}>Voltar</button>}</div>
  <div className="graph-columns"><span>Influências anteriores →</span><strong>Exploração · {current.name}</strong><span>Artistas influenciados →</span></div>
  {view==='menu'?<ArtistMenu slots={menuSlots} links={influences} trail={trail} onReturn={choose} focusRequest={focusRequest} sourceUrl={pendingSource} index={navigation} selected={selected} session={session} mode={mode} onHighlight={stage} onConfirm={id=>choose(id,session?.side)}/>:<Graph discovered={discovered} preview={preview} artists={artists} influences={influences} mode={mode} focusRequest={focusRequest} selected={selected} onSelect={choose} onEdge={setEdge}/>}
  <div className={`direction-pad ${padCollapsed?'collapsed':''}`}><button className="pad-toggle" onClick={()=>setPadCollapsed(value=>!value)} aria-expanded={!padCollapsed} aria-controls="pad-buttons">{padCollapsed?'Abrir controle':'Recolher controle'}</button>{!padCollapsed&&<div id="pad-buttons" className="pad-buttons" role="group" aria-label="Navegação direcional"><button className="pad-up" aria-label="Artista anterior na lista" onClick={()=>move('ArrowUp')}>↑</button><button className="pad-left" aria-label="Destacar primeira influência" onClick={()=>move('ArrowLeft')}>←</button><button className="pad-select" aria-label="Selecionar" title={pending?`Selecionar ${names.get(pending)}`:'Escolha um artista com as setas'} disabled={!pending} onClick={confirm}>Selecionar</button><button className="pad-right" aria-label="Destacar primeiro influenciado" onClick={()=>move('ArrowRight')}>→</button><button className="pad-down" aria-label="Próximo artista na lista" onClick={()=>move('ArrowDown')}>↓</button></div>}</div>
  <div className="legend"><span><i className="legend-dot center"/> Selecionado</span><span><i className="legend-dot"/> Artista</span><span>→ Influência</span></div>
  {edge&&<div className="evidence"><button className="close" onClick={()=>setEdge(null)} aria-label="Fechar"><X size={16}/></button><div className="section-kicker">CONEXÃO</div><h3>{names.get(edge.source)} <ArrowRight size={17}/> {names.get(edge.target)}</h3><p>{edge.note}</p><small>{edge.evidenceType==='artist-statement'?'Declaração do artista':edge.evidenceType==='secondary'?'Fonte secundária':edge.kind==='continuity'?'Continuidade artística (fonte pendente)':'Revisão editorial pendente'} · {edge.kind==='continuity'?'Continuidade artística':'Influência'} · Confiança {edge.confidence==='high'?'alta':edge.confidence==='medium'?'média':'baixa'}</small><a href={edge.evidenceUrl} target="_blank" rel="noopener noreferrer">Consultar fonte <ExternalLink size={14}/></a></div>}
  </section></main><footer>Um mapa em construção. Relações editoriais com fontes; algumas ainda precisam de verificação aprofundada.</footer>
 </div>
}
