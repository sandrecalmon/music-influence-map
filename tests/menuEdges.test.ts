import { it, expect } from 'vitest';
import { menuEdgePoints, menuEdgePath, MENU_COLUMN, MENU_ROW } from '../src/components/menuEdges';
it.each([
 [{column:0,row:0},{column:1,row:3}],
 [{column:1,row:3},{column:0,row:0}],
 [{column:0,row:0},{column:0,row:3}],
 [{column:0,row:0},{column:3,row:3}],
 [{column:3,row:3},{column:0,row:0}],
 [{column:-2,row:1},{column:1,row:1}],
])('routes %o to %o with only horizontal and vertical segments',(from,to)=>{
 const points=menuEdgePoints(from,to,-2,'source->target');
 for(let i=1;i<points.length;i++)expect(points[i].x===points[i-1].x||points[i].y===points[i-1].y).toBe(true);
 const path=menuEdgePath(points);
 expect(path).toMatch(/^M[-\d.,]+(?: [HV][-\d.]+)+$/);
 expect(path).not.toMatch(/[CQLASTZ]/);
 expect(menuEdgePoints(from,to,-2,'source->target')).toEqual(points);
});
it('keeps long connections outside intermediate card interiors',()=>{
 for(const [from,to] of [[{column:0,row:0},{column:3,row:2}],[{column:3,row:2},{column:0,row:0}]]){
  const points=menuEdgePoints(from,to,0,'long-link');
  for(let column=1;column<=2;column++)for(let row=0;row<4;row++){
   const left=column*MENU_COLUMN+40,right=column*MENU_COLUMN+200,top=(row+1)*MENU_ROW+18,bottom=top+60;
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    const crosses=a.x===b.x ? a.x>left&&a.x<right&&Math.max(a.y,b.y)>top&&Math.min(a.y,b.y)<bottom : a.y>top&&a.y<bottom&&Math.max(a.x,b.x)>left&&Math.min(a.x,b.x)<right;
    expect(crosses).toBe(false);
   }
  }
 }
});
it('spreads parallel links into stable lanes',()=>{
 const from={column:0,row:0},to={column:1,row:3};
 const paths=new Set(['a','b','c','d','e','f','g'].map(key=>menuEdgePath(menuEdgePoints(from,to,0,key))));
 expect(paths.size).toBe(7);
});
