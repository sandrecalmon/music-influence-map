import { it,expect } from 'vitest';
import artists from '../src/data/artists.json';
import edges from '../src/data/influences.json';
import evidence from '../src/data/evidence.json';
import { graphIndex, reveal } from '../src/components/exploration';
it('includes Woody Guthrie as a declared influence of Bob Dylan with a source',()=>{const woody=artists.find(a=>a.name==='Woody Guthrie')!;expect(woody.id).toBe('woody-guthrie');expect(edges.find(e=>e.source===woody.id&&e.target==='dylan')).toMatchObject({evidenceType:'artist-statement',verificationStatus:'verified',confidence:'high',evidenceUrl:'https://folkways.si.edu/artists/woody-guthrie'})});
it('reveals Woody in the Dylan menu and Dylan when exploring Woody',()=>{const index=graphIndex(artists,edges);expect(index.past.get('dylan')).toContain('woody-guthrie');expect(index.future.get('woody-guthrie')).toContain('dylan');expect(reveal(new Set(),'dylan',index).has('woody-guthrie')).toBe(true)});
it('keeps historical folk sources and distinct Pete Seeger/Odetta paths',()=>{expect(edges.some(e=>e.source==='lead-belly'&&e.target==='woody-guthrie')).toBe(true);expect(edges.some(e=>e.source==='pete-seeger'&&e.target==='dylan')).toBe(true);expect(edges.some(e=>e.source==='odetta'&&e.target==='dylan')).toBe(true)});
it('provides evidence and valid endpoints for every relation in the folk batch',()=>{const batch=evidence.filter(e=>e.batch==='folk-norte-americano');expect(batch.length).toBeGreaterThan(20);const ids=new Set(artists.map(a=>a.id));for(const item of batch){expect(ids.has(item.source)&&ids.has(item.target)).toBe(true);expect(edges.some(e=>e.source===item.source&&e.target===item.target&&e.evidenceUrl===item.url&&e.verificationStatus==='verified')).toBe(true)}});
