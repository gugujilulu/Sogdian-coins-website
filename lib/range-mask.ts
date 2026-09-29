import type {MapRange} from './map-layers';
const R=6378137;
export function project([lon,lat]:number[]){return [R*lon*Math.PI/180,R*Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))] as [number,number]}
export function unproject([x,y]:number[]){return [x/R*180/Math.PI,(2*Math.atan(Math.exp(y/R))-Math.PI/2)*180/Math.PI] as [number,number]}
/** A display-only mask envelope; the input polygon remains the hit-test/evidence geometry. */
export function maskLayout(range:MapRange,transitionKm=18){
 if(!range.geometry)return null;
 const rings=range.geometry.type==='Polygon'?range.geometry.coordinates:range.geometry.coordinates.flat();
 const points=rings.flat().map(project),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const latitude=points.reduce((n,p)=>n+unproject(p)[1],0)/points.length;
 const radius=transitionKm*1000/Math.cos(latitude*Math.PI/180),pad=radius*2;
 const minX=Math.min(...xs)-pad,maxX=Math.max(...xs)+pad,minY=Math.min(...ys)-pad,maxY=Math.max(...ys)+pad;
 const scale=1200/Math.max(maxX-minX,maxY-minY),width=Math.ceil((maxX-minX)*scale),height=Math.ceil((maxY-minY)*scale);
 return{width,height,blur:radius*scale/2,coordinates:[unproject([minX,maxY]),unproject([maxX,maxY]),unproject([maxX,minY]),unproject([minX,minY])] as [[number,number],[number,number],[number,number],[number,number]],rings:rings.map(r=>r.map(p=>{const [x,y]=project(p);return[(x-minX)*scale,(maxY-y)*scale]}))};
}
export function pointInRing(point:number[],ring:number[][]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
