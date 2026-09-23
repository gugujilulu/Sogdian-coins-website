export type Size={width:number;height:number};
export type Point={x:number;y:number};
export type Transform=Point&{scale:number};
export function validSize(size:Size){return Number.isFinite(size.width)&&Number.isFinite(size.height)&&size.width>0&&size.height>0}
export function fitScale(image:Size,viewport:Size){return validSize(image)&&validSize(viewport)?Math.min(1,viewport.width/image.width,viewport.height/image.height):1}
export function fitImage(image:Size,viewport:Size):Transform{return {scale:fitScale(image,viewport),x:0,y:0}}
export function boundTransform(t:Transform,image:Size,viewport:Size):Transform{
 const scale=Math.min(8,Math.max(Math.min(fitScale(image,viewport),1)/2,Number.isFinite(t.scale)?t.scale:1));
 const xLimit=Math.max(0,(image.width*scale-viewport.width)/2),yLimit=Math.max(0,(image.height*scale-viewport.height)/2);
 return {scale,x:Math.max(-xLimit,Math.min(xLimit,Number.isFinite(t.x)?t.x:0)),y:Math.max(-yLimit,Math.min(yLimit,Number.isFinite(t.y)?t.y:0))};
}
/** from/to are viewport-relative pointer or pinch midpoints; 1 = one image pixel per CSS pixel. */
export function zoomImage(t:Transform,scale:number,from:Point,to:Point,image:Size,viewport:Size):Transform{
 const next=boundTransform({...t,scale},image,viewport).scale,ratio=next/t.scale;
 return boundTransform({scale:next,x:to.x-viewport.width/2-(from.x-viewport.width/2-t.x)*ratio,y:to.y-viewport.height/2-(from.y-viewport.height/2-t.y)*ratio},image,viewport);
}
export function gestureImage(t:Transform,before:readonly Point[],after:readonly Point[],image:Size,viewport:Size):Transform{
 if(!before.length||before.length!==after.length)return t;
 if(before.length===1)return boundTransform({...t,x:t.x+after[0].x-before[0].x,y:t.y+after[0].y-before[0].y},image,viewport);
 const midpoint=(p:readonly Point[])=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2});
 const distance=(p:readonly Point[])=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
 const d=distance(before);return d>0?zoomImage(t,t.scale*distance(after)/d,midpoint(before),midpoint(after),image,viewport):t;
}
export function selectedImage<T extends {id:string}>(images:readonly T[],id:string|null){return id===null?images[0]:images.find(image=>image.id===id)}
