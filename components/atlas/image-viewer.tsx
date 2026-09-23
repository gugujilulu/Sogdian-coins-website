'use client';
import {useEffect,useRef,useState} from 'react';
import {boundTransform,fitImage,gestureImage,validSize,zoomImage,type Point,type Size,type Transform} from '@/lib/image-viewer';
export type ViewableImage={id:string;path:string;width?:number|null;height?:number|null};
function ImageViewport({image}:{image:ViewableImage}){
 const stage=useRef<HTMLDivElement>(null),photo=useRef<HTMLImageElement>(null);
 const [viewport,setViewport]=useState<Size>({width:0,height:0}),[natural,setNatural]=useState<Size>({width:0,height:0});
 const [transform,setTransform]=useState<Transform>({scale:1,x:0,y:0}),[mode,setMode]=useState<'fit'|'custom'>('fit');
 const [status,setStatus]=useState<'loading'|'ready'|'failed'>('loading'),[attempt,setAttempt]=useState(0);
 const pointers=useRef(new Map<number,Point>());
 const current=useRef({viewport,natural,transform,status});current.current={viewport,natural,transform,status};
 const commit=(value:Transform)=>{current.current.transform=value;setTransform(value)};
 useEffect(()=>{const el=stage.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setViewport({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(el);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(validSize(natural)&&validSize(viewport))commit(mode==='fit'?fitImage(natural,viewport):boundTransform(current.current.transform,natural,viewport))},[viewport,natural,mode]);
 useEffect(()=>{const el=stage.current;if(!el)return;const wheel=(event:WheelEvent)=>{event.preventDefault();const c=current.current;if(c.status!=='ready')return;const rect=el.getBoundingClientRect(),point={x:event.clientX-rect.left,y:event.clientY-rect.top};const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?c.viewport.height:1);setMode('custom');commit(zoomImage(c.transform,c.transform.scale*Math.exp(-Math.max(-300,Math.min(300,delta))*.002),point,point,c.natural,c.viewport))};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel)},[]);
 const loaded=(el:HTMLImageElement)=>{const size={width:el.naturalWidth,height:el.naturalHeight};if(!validSize(size)){setStatus('failed');return}setNatural(size);setStatus('ready');setMode('fit');commit(fitImage(size,current.current.viewport))};
 const zoom=(scale:number)=>{const c=current.current,center={x:c.viewport.width/2,y:c.viewport.height/2};setMode('custom');commit(zoomImage(c.transform,scale,center,center,c.natural,c.viewport))};
 const point=(event:React.PointerEvent)=>{const rect=event.currentTarget.getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top}};
 return <div className="hires-viewer">
  <div className="image-toolbar" aria-label="图片缩放"><button disabled={status!=='ready'} onClick={()=>zoom(transform.scale/1.5)}>缩小</button><button disabled={status!=='ready'} onClick={()=>zoom(transform.scale*1.5)}>放大</button><button disabled={status!=='ready'} onClick={()=>{pointers.current.clear();setMode('fit');commit(fitImage(natural,viewport))}}>适应窗口</button><button disabled={status!=='ready'} onClick={()=>zoom(1)}>原尺寸 100%</button><output aria-label="当前图片缩放">{status==='ready'?`${(transform.scale*100).toFixed(1)}%${mode==='fit'?' · 适应窗口':''}`:'—'}</output></div>
  <div ref={stage} className="image-viewport" tabIndex={0} aria-label="图片视口：滚轮或双指缩放，方向键或拖动平移" onKeyDown={e=>{if(status!=='ready')return;const delta:Record<string,Point>={ArrowLeft:{x:40,y:0},ArrowRight:{x:-40,y:0},ArrowUp:{x:0,y:40},ArrowDown:{x:0,y:-40}};if(delta[e.key]){e.preventDefault();setMode('custom');commit(boundTransform({...transform,x:transform.x+delta[e.key].x,y:transform.y+delta[e.key].y},natural,viewport))}}} onPointerDown={e=>{if(status!=='ready'||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,point(e))}} onPointerMove={e=>{if(!pointers.current.has(e.pointerId))return;const before=[...pointers.current.values()];pointers.current.set(e.pointerId,point(e));const c=current.current;setMode('custom');commit(gestureImage(c.transform,before,[...pointers.current.values()],c.natural,c.viewport))}} onPointerUp={e=>pointers.current.delete(e.pointerId)} onPointerCancel={e=>pointers.current.delete(e.pointerId)} onLostPointerCapture={e=>pointers.current.delete(e.pointerId)}>
   {status!=='failed'&&<img key={attempt} ref={photo} src={image.path} alt="当前完整原图" draggable={false} onLoad={e=>loaded(e.currentTarget)} onError={()=>setStatus('failed')} style={{width:natural.width||image.width||1,height:natural.height||image.height||1,visibility:status==='ready'?'visible':'hidden',transform:`translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`}}/>}
   {status==='loading'&&<p role="status">正在加载原图…</p>}{status==='failed'&&<div role="status"><p>图片加载失败；记录和来源仍可阅读。</p><button disabled={attempt>=2} onClick={()=>{pointers.current.clear();setNatural({width:0,height:0});setTransform({scale:1,x:0,y:0});setMode('fit');setStatus('loading');setAttempt(n=>n+1)}}>{attempt>=2?'已达两次重试上限':'重试图片'}</button></div>}
  </div>
  <p className="image-help">{status==='ready'?`${natural.width} × ${natural.height} px；100% = 1图片像素 / 1 CSS像素。`:'尺寸待图片加载确认。'} 滚轮／双指缩放，放大后拖动。<a href={image.path} target="_blank" rel="noreferrer">新标签页打开本地原图 ↗</a></p>
 </div>;
}
export default function ImageViewer({images,imageId,onSelect}:{images:readonly ViewableImage[];imageId:string|null;onSelect:(id:string)=>void}){
 const index=imageId===null?0:images.findIndex(image=>image.id===imageId),image=images[index];
 return <div className="detail-image-panel"><div className="image-pagination"><button disabled={index<=0} onClick={()=>onSelect(images[index-1].id)}>上一张</button><span>{image?index+1:0} / {images.length} 张</span><button disabled={index<0||index>=images.length-1} onClick={()=>onSelect(images[index+1].id)}>下一张</button></div>{image?<ImageViewport key={image.id+'|'+image.path} image={image}/>:<p role="status">暂无可用图片；记录与来源仍可阅读。</p>}</div>;
}
