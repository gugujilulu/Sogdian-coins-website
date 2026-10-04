type Rect={left:number;right:number;top:number;bottom:number};
/** Small, fixed screen offsets preserve the geographic label anchor and avoid coins/controls. */
export function rangeLabelOffset(box:Rect,viewport:Rect,occupied:Rect[]):[number,number]|null{
 const candidates:[number,number][]=[[0,0],[0,-32],[0,32],[0,-60],[0,60],[0,-88],[0,88],[-48,-36],[48,-36],[-48,36],[48,36]];
 for(const [x,y] of candidates){const r={left:box.left+x,right:box.right+x,top:box.top+y,bottom:box.bottom+y};
  if(r.left<viewport.left+6||r.right>viewport.right-6||r.top<viewport.top+6||r.bottom>viewport.bottom-6)continue;
  if(!occupied.some(b=>r.left<b.right+5&&r.right>b.left-5&&r.top<b.bottom+5&&r.bottom>b.top-5))return[x,y];
 }
 return null;
}
