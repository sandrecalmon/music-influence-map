import fs from 'node:fs';
import ts from 'typescript';
import cytoscape from 'cytoscape';
const load = async path => import('data:text/javascript;base64,' + Buffer.from(ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 })).toString('base64'));
const { networkPositions } = await load('src/components/layout.ts');
const {graphIndex,reveal}=await load('src/components/exploration.ts');
const { highlight } = await load('src/components/navigation.ts');
const artists = JSON.parse(fs.readFileSync('src/data/artists.json'));
const influences = JSON.parse(fs.readFileSync('src/data/influences.json'));
const start = performance.now();
const positions = networkPositions(artists, influences);
const layoutMs = performance.now() - start;
const index=graphIndex(artists,influences);
let discovered=reveal(new Set(),'rem',index);
const initialRendered=discovered.size;
const cy=cytoscape({headless:true,layout:{name:'preset'},elements:[]});
const before=performance.now();
for(const artist of artists){
 discovered=reveal(discovered,artist.id,index);
 cy.batch(()=>{
  for(const node of artists)if(discovered.has(node.id)&&cy.$id(node.id).empty())cy.add({data:{id:node.id},position:positions.get(node.id)});
  influences.forEach((edge,i)=>{const id=`edge${i}`;if(discovered.has(edge.source)&&discovered.has(edge.target)&&cy.$id(id).empty())cy.add({data:{...edge,id}})});
 });
 highlight(cy,artist.id,'both');
}
const explorationMs=performance.now()-before;
cy.destroy();
console.log(JSON.stringify({artists:artists.length,relations:influences.length,initialRendered,layoutMs:+layoutMs.toFixed(2),allExplorationStepsMs:+explorationMs.toFixed(2),environment:'Node headless; excludes browser painting and touch latency'},null,2));
