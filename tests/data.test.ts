import { describe, it, expect } from 'vitest';
import artists from '../src/data/artists.json';
import influences from '../src/data/influences.json';
import evidence from '../src/data/evidence.json';
import originalArtists from './fixtures/original-artists.json';
import originalInfluences from './fixtures/original-influences.json';
import { validateData } from '../src/data/validate';
const a = [{id:'a',name:'A'},{id:'b',name:'B',year:1980}];
const e = {source:'a',target:'b',confidence:'medium',evidenceUrl:'https://example.org/',note:'Test fixture',evidenceType:'secondary',verificationStatus:'verified'};
describe('editorial integrity',()=>{
 it('validates all 200 artists and their relations',()=>{expect(artists).toHaveLength(200);expect(validateData(artists,influences)).toEqual([])});
 it('preserves the 19 original IDs',()=>{for(const id of ['rem','velvet','patti','bigstar','young','television','b52','dylan','nirvana','radiohead','pixies','pearljam','coldplay','foo','cranberries','pumpkins','killers','u2','smiths'])expect(artists.some(a=>a.id===id)).toBe(true)});
 it('connects every artist back to the original network',()=>{const reached=new Set(['rem']);let changed=true;while(changed){changed=false;for(const e of influences)if(reached.has(e.source)||reached.has(e.target))for(const id of [e.source,e.target])if(!reached.has(id)){reached.add(id);changed=true}}expect(reached.size).toBe(artists.length)});
 it('provides an auditable source for every verified relation',()=>{for(const e of influences.filter(e=>e.verificationStatus==='verified'))expect(evidence.some(s=>s.source===e.source&&s.target===e.target)).toBe(true)});
 it('preserves every original artist and relation including editorial fields',()=>{for(const artist of originalArtists)expect(artists.find(a=>a.id===artist.id)).toMatchObject(artist);for(const edge of originalInfluences)expect(influences.find(e=>e.source===edge.source&&e.target===edge.target)).toMatchObject(edge)});
 it('preserves continuity separately from influence',()=>{expect(influences.find(e=>e.source==='nirvana'&&e.target==='foo')?.kind).toBe('continuity')});
 it.each([
  ['ID duplicado',[...a,a[0]],[e]],['Artista sem id',[{id:'',name:''}],[]],['Ano inválido',[{...a[0],year:1}],[]],
  ['Referência inválida',a,[{...e,target:'missing'}]],['Autorrelação',a,[{...e,target:'a'}]],['Relação duplicada',a,[e,e]],
  ['Confiança inválida',a,[{...e,confidence:'certain'}]],['URL inválida',a,[{...e,evidenceUrl:'not-url'}]],['URL inválida',a,[{...e,evidenceUrl:'http://example.org'}]],
  ['Nota ausente',a,[{...e,note:''}]],['Tipo de evidência inválido',a,[{...e,evidenceType:undefined}]],['Verificação inválida',a,[{...e,verificationStatus:undefined}]],['Tipo de relação inválido',a,[{...e,kind:'similar'}]]
 ] as const)('rejects %s',(message,nodes,edges)=>{expect(validateData([...nodes],[...edges]).join(' ')).toContain(message)});
 it('accepts the three confidence grades',()=>{for(const confidence of ['low','medium','high'])expect(validateData(a,[{...e,confidence}])).toEqual([])});
});
