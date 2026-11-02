import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, ExternalLink, Focus, Search, X } from 'lucide-react';
import Graph from './components/Graph';
import artistData from './data/artists.json';
import influenceData from './data/influences.json';

type Artist = { id:string; name:string; year?:number; country?:string; genres?:string[] };
type Influence = {source:string;target:string;confidence:'high'|'medium'|'low';evidenceUrl:string;note:string;kind?:string};
const artists: Artist[] = artistData;
const influences: Influence[] = influenceData as Influence[];
const names = new Map(artists.map(a=>[a.id,a.name]));
const neighborhood=(id:string)=>[id,...influences.filter(e=>e.source===id||e.target===id).map(e=>e.source===id?e.target:e.source)];
const initial = new URLSearchParams(window.location.search).get('artist');
export default function App(){
 const [selected,setSelected]=useState(artists.some(a=>a.id===initial)?initial!:'rem');
 const [visible,setVisible]=useState<string[]>(()=>neighborhood(selected));
 const [search,setSearch]=useState('');
 const [mode,setMode]=useState<'both'|'past'|'future'>('both');
 const [edge,setEdge]=useState<Influence|null>(null);
 const current=artists.find(a=>a.id===selected)!;
 const incoming=influences.filter(e=>e.target===selected&&e.kind!=='continuity');
 const outgoing=influences.filter(e=>e.source===selected&&e.kind!=='continuity');
 const expand=(id:string,direction:'both'|'past'|'future'='both')=>{
   setVisible(old=>{
     const reached=new Set([id]);let changed=true;
     while(changed){changed=false;for(const e of influences){
       if(direction!=='future'&&reached.has(e.target)&&old.includes(e.source)&&!reached.has(e.source)){reached.add(e.source);changed=true}
       if(direction!=='past'&&reached.has(e.source)&&old.includes(e.target)&&!reached.has(e.target)){reached.add(e.target);changed=true}
     }}
     const adjacent=influences.filter(e=>(direction!=='future'&&reached.has(e.target))||(direction!=='past'&&reached.has(e.source))).flatMap(e=>[e.source,e.target]);
     return [...new Set([...old,id,...adjacent])];
   });setEdge(null);
 };
 const choose=(id:string)=>{setSelected(id);setVisible(neighborhood(id));setEdge(null);setSearch('')};
 useEffect(()=>{const url=new URL(window.location.href);url.searchParams.set('artist',selected);window.history.replaceState({},'',url)},[selected]);
 const displayed=useMemo(()=>{
   const available=influences.filter(e=>visible.includes(e.source)&&visible.includes(e.target));
   if(mode==='both')return available;
   const reached=new Set([selected]);
   let changed=true;
   while(changed){changed=false;for(const e of available){
     const from=mode==='past'?e.target:e.source, to=mode==='past'?e.source:e.target;
     if(reached.has(from)&&!reached.has(to)){reached.add(to);changed=true}
   }}
   return available.filter(e=>reached.has(e.source)&&reached.has(e.target));
 },[visible,mode,selected]);
 const graphArtists=useMemo(()=>artists.filter(a=>a.id===selected||displayed.some(e=>e.source===a.id||e.target===a.id)),[displayed,selected]);
 const results=artists.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())).slice(0,8);
 return <div className="app">
  <header><div className="brand"><div className="brand-icon">◉</div><div><strong>Music Influence Map</strong><small>Uma viagem pelas conexões da música</small></div></div><div className="header-right"><span className="version">PROTÓTIPO · 01</span><span className="count">{artists.length} artistas · {influences.length} relações</span></div></header>
  <main><aside className="sidebar">
    <div className="section-kicker">EXPLORAR</div><h1>Descubra de onde vem a música.</h1><p className="intro">Siga as influências que conectam artistas, gerações e movimentos.</p>
    <div className="searchbox"><Search size={18}/><input aria-label="Buscar artista" placeholder="Buscar artista..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Limpar busca" onClick={()=>setSearch('')}><X size={16}/></button>}</div>
    {search&&<div className="results">{results.length?results.map(a=><button key={a.id} onClick={()=>choose(a.id)}>{a.name}<ArrowRight size={15}/></button>):<p>Nenhum artista encontrado</p>}</div>}
    <div className="separator"/><div className="section-kicker">ARTISTA SELECIONADO</div><h2>{current.name}</h2><div className="metadata">{[current.country,current.year?`Desde ${current.year}`:null].filter(Boolean).join(' · ')}</div>
    <div className="statrow"><div><strong>{incoming.length}</strong><span>Influências recebidas</span></div><div><strong>{outgoing.length}</strong><span>Artistas influenciados</span></div></div>
    <div className="section-kicker">EXPANDIR CONEXÕES</div><div className="actions"><button onClick={()=>expand(selected,'past')}><ArrowLeft size={16}/> Origens</button><button onClick={()=>expand(selected,'future')}>Legado <ArrowRight size={16}/></button></div>
    <div className="section-kicker">DIREÇÃO DAS SETAS</div><div className="modes">{([['both','Todas'],['past','Passado'],['future','Futuro']] as const).map(([id,label])=><button className={mode===id?'active':''} onClick={()=>setMode(id)} key={id}>{label}</button>)}</div>
    <button className="reset" onClick={()=>{setVisible(neighborhood(selected));setEdge(null);setMode('both')}}><Focus size={16}/> Centralizar {current.name}</button>
    <div className="sidebar-note"><Compass size={18}/><span>Clique em um artista no mapa para descobrir seus caminhos. As setas apontam de quem influenciou para quem foi influenciado.</span></div>
  </aside><section className="grapharea"><div className="graph-top"><span><span className="live-dot"/> REDE DE INFLUÊNCIAS</span><span>{graphArtists.length} nós visíveis</span></div>
  <div className="graph-columns"><span>← Influências anteriores</span><strong>{current.name}</strong><span>Artistas influenciados →</span></div>
  <Graph artists={graphArtists} influences={displayed} selected={selected} onSelect={choose} onEdge={setEdge}/>
  <div className="legend"><span><i className="legend-dot center"/> Selecionado</span><span><i className="legend-dot"/> Artista</span><span>→ Influência</span></div>
  {edge&&<div className="evidence"><button className="close" onClick={()=>setEdge(null)} aria-label="Fechar"><X size={16}/></button><div className="section-kicker">CONEXÃO</div><h3>{names.get(edge.source)} <ArrowRight size={17}/> {names.get(edge.target)}</h3><p>{edge.note}</p><small>{edge.kind==='continuity'?'Continuidade artística':'Influência'} · Confiança {edge.confidence==='high'?'alta':edge.confidence==='medium'?'média':'baixa'}</small><a href={edge.evidenceUrl} target="_blank" rel="noopener noreferrer">Consultar fonte <ExternalLink size={14}/></a></div>}
  </section></main><footer>Um mapa em construção. Relações editoriais com fontes; algumas ainda precisam de verificação aprofundada.</footer>
 </div>
}
