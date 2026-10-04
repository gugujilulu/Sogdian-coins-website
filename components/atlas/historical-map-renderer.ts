import {tr,copyKnown} from '@/lib/i18n';
import {focusable,focusReturn} from '@/lib/keyboard';
import {rangeSpaceDescription} from '@/lib/range-time';
import type {Map as GLMap,GeoJSONSource,Marker,Popup} from 'maplibre-gl';
import {rangeColor,rangeBounds,periodLabel,roleNames,type MapRange,type MapPlace,type PlaceClaim} from '@/lib/map-layers';
import {rangeBoundaryFeatures} from '@/lib/range-boundaries';
import {ensureRangeStyle} from '@/lib/map-layer-style';
import {symbolUrl} from '@/lib/map-symbols';
type GL=typeof import('maplibre-gl');
type Frame={ranges:MapRange[];places:{place:MapPlace;claims:PlaceClaim[]}[]};
export function installHistoricalMap(gl:GL,map:GLMap,onError:(message:string)=>void){
 let restoring=true;
 const removePopup=()=>{restoring=false;popup?.remove();restoring=true};
 let frame:Frame={ranges:[],places:[]},markers:Marker[]=[],popup:Popup|null=null;
 const attribution=map.getContainer().querySelector<HTMLDetailsElement>('.maplibregl-ctrl-attrib');
 let phoneAttributionInitialized=false,attributionFrame=0;
 const attributionObserver=new ResizeObserver(()=>{
  cancelAnimationFrame(attributionFrame);attributionFrame=requestAnimationFrame(()=>{
  if(!phoneAttributionInitialized&&attribution?.classList.contains('maplibregl-compact')&&window.matchMedia('(max-width:760px),(max-width:1000px) and (max-height:500px)').matches){
   phoneAttributionInitialized=true;attribution.classList.remove('maplibregl-compact-show');attribution.open=false;
  }
  layout();
  });
 });
 if(attribution)attributionObserver.observe(attribution);
 function ensure(){
  try{
   ensureRangeStyle(map);
  }catch{onError('历史图层未能加载。底图与目录仍可使用。')}
 }
 function show(at:[number,number],title:string,sections:{label:string;text:string;source?:string;method?:string}[]){
  const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;removePopup();const box=document.createElement('div');box.className='history-popup';const h=document.createElement('strong');h.textContent=title;box.appendChild(h);
  for(const s of sections){const p=document.createElement('p');p.dataset.copyLabel=s.label;p.dataset.copyText=s.text;p.textContent=`${copyKnown(s.label)} · ${s.text}`;box.appendChild(p);if(s.method||s.source){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=tr('资料与方法');details.appendChild(summary);box.appendChild(details);if(s.method){const method=document.createElement('p');method.textContent=s.method;details.appendChild(method)}for(const source of (s.source||'').split('\n')){if(/^https?:\/\//.test(source)){const a=document.createElement('a');a.href=source;a.textContent=tr('查看来源 ↗');a.target='_blank';a.rel='noreferrer';details.appendChild(a)}else{const small=document.createElement('small');small.textContent=source.startsWith('demo:')?'独立视觉夹具；不代表历史事实':source;details.appendChild(small)}}}}
  popup=new gl.Popup({maxWidth:'300px',closeOnClick:true,className:'historical-info-popup'}).setLngLat(at).setDOMContent(box).addTo(map);
  popup.getElement().querySelector('.maplibregl-popup-close-button')?.setAttribute('aria-label',tr('Close popup'));popup.on('close',()=>{if(restoring&&box.contains(document.activeElement))focusReturn(opener)});
  popup.getElement().querySelector<HTMLButtonElement>('.maplibregl-popup-close-button')?.addEventListener('click',()=>queueMicrotask(()=>focusReturn(opener)));
 }
 function update(next:Frame,preservePopup=false){const focused=document.activeElement instanceof HTMLElement?document.activeElement:null;const focusKey=focused?.dataset.historyKey;if(!preservePopup){removePopup();popup=null}frame=next;if(preservePopup&&popup?.isOpen()){popup.getElement().querySelector('.maplibregl-popup-close-button')?.setAttribute('aria-label',tr('Close popup'));popup.getElement().querySelectorAll<HTMLElement>('[data-copy-label]').forEach(el=>{el.textContent=`${copyKnown(el.dataset.copyLabel||'')} · ${el.dataset.copyText||''}`});popup.getElement().querySelectorAll('summary').forEach(el=>el.textContent=tr('资料与方法'));popup.getElement().querySelectorAll('a').forEach(el=>el.textContent=tr('查看来源 ↗'))}ensure();const source=map.getSource('historical-ranges') as GeoJSONSource|undefined;
  source?.setData({type:'FeatureCollection',features:frame.ranges.map(r=>({type:'Feature',id:r.id,geometry:r.geometry!,properties:{id:r.id,color:rangeColor(r.objectId),kind:r.kind,precision:r.precision,opacity:r.display?.washOpacity??.22}}))});
  (map.getSource('historical-boundaries') as GeoJSONSource|undefined)?.setData(rangeBoundaryFeatures(frame.ranges));
  markers.forEach(m=>m.remove());markers=[];
  const nodes:{el:HTMLElement;position:[number,number];minZoom:number;priority:number;angle?:number}[]=[];
  for(const {place:p,claims} of frame.places){const el=document.createElement('button');el.className='history-place historical-label';const preferred=[...claims].sort((a,b)=>['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(a.role)-['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(b.role))[0];
   el.dataset.placeRole=preferred.role;const icon=document.createElement('img');icon.src=symbolUrl(preferred.role);icon.alt='';icon.setAttribute('aria-hidden','true');icon.draggable=false;el.appendChild(icon);const span=document.createElement('span');span.textContent=p.name;el.appendChild(span);el.setAttribute('aria-label',`${p.zh} · ${claims.map(c=>copyKnown(roleNames[c.role])).join('、')}`);el.dataset.historyKey='place:'+p.id;el.onclick=e=>{e.stopPropagation();show(p.coordinates,`${p.zh} / ${p.name}`,claims.map(c=>({label:roleNames[c.role],text:`${periodLabel(c)}；${c.note}`,source:c.source})));};
   markers.push(new gl.Marker({element:el,anchor:'top',offset:[0,-14]}).setLngLat(p.coordinates).addTo(map));nodes.push({el,position:p.coordinates,minZoom:p.minZoom,priority:0});
  }
  for(const r of frame.ranges){const bounds=rangeBounds([r]);if(!bounds)continue;const at=r.label||[(bounds[0][0]+bounds[1][0])/2,(bounds[0][1]+bounds[1][1])/2] as [number,number];const el=document.createElement('button');el.className='history-range-label';el.setAttribute('aria-label',r.title+' · '+periodLabel(r));el.style.color=rangeColor(r.objectId);const title=document.createElement('strong');title.textContent=r.labelTitle||r.title;const date=document.createElement('small');date.textContent=(r.labelLatin||periodLabel(r))+(r.presentation?.background?' · '+tr('历史背景'):'');const block=document.createElement('span');block.className='range-name-block';block.style.transform=`rotate(${r.labelAngle||0}deg)`;block.appendChild(title);block.appendChild(date);el.appendChild(block);el.dataset.historyKey='range:'+r.id;el.onclick=e=>{e.stopPropagation();show(at,r.title,[{label:r.kind==='polity'?'政权范围':r.kind==='context'?'地域背景':'钱币流通范围',text:`${periodLabel(r)} · ${r.precision==='approximate'?tr('大致范围'):tr('资料所绘范围')}${r.presentation?.background?' · '+tr('历史背景'):''}`,method:`${rangeSpaceDescription(r)}；${r.note}`,source:r.source}]);};markers.push(new gl.Marker({element:el}).setLngLat(at).addTo(map));nodes.push({el,position:at,minZoom:r.coverageEdge?3:4,priority:1,angle:r.labelAngle});}
  for(const r of frame.ranges){if(!r.coverageLabel)continue;const el=document.createElement('span');el.className='history-coverage-label';el.textContent=copyKnown(r.coverage?.edgeLabel||'范围延伸至原图之外')+' ↗';el.setAttribute('aria-label',r.title+' · '+copyKnown(r.coverage?.edgeLabel||'范围延伸至原图之外'));markers.push(new gl.Marker({element:el,anchor:'right'}).setLngLat(r.coverageLabel).addTo(map));el.setAttribute('role','note');el.setAttribute('aria-label',r.title+' · '+copyKnown(r.coverage?.edgeLabel||'范围延伸至原图之外'));}
  layout=()=>{const used:DOMRect[]=[];const obstacles=Array.from(map.getContainer().parentElement?.querySelectorAll('.coin-map-marker,.map-toolbar,.history-controls,.preview-badge,.atlas-search-panel')||[]).filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect());
   const overlaps=(a:DOMRect,b:DOMRect)=>a.left<b.right+5&&a.right>b.left-5&&a.top<b.bottom+5&&a.bottom>b.top-5;
   for(const n of nodes.sort((a,b)=>a.priority-b.priority)){if(n.priority){const z=map.getZoom();n.el.style.fontSize=`${Math.max(14,Math.min(23,15+(z-4)*2.5))}px`;}
    const caption=n.priority===0?n.el.querySelector<HTMLElement>('span'):null;
    if(caption){caption.style.translate='';if(window.matchMedia('(max-width:760px),(max-width:1000px) and (max-height:500px)').matches&&attribution?.classList.contains('maplibregl-compact-show')){
     const label=caption.getBoundingClientRect(),cover=attribution.getBoundingClientRect(),viewport=map.getContainer().getBoundingClientRect();
     if(overlaps(label,cover)){const dx=cover.left-label.right-8;caption.style.translate=label.left+dx>=viewport.left+8?`${dx}px 0px`:`0px ${cover.top-label.bottom-8}px`;}
    }}
    const box=n.el.getBoundingClientRect();const hit=used.some(b=>overlaps(box,b))||(n.priority===1&&obstacles.some(b=>overlaps(box,b)));
    const show=map.getZoom()>=n.minZoom&&!hit;n.el.style.visibility=show?'visible':'hidden';if(show)used.push(box);
   }
  };layout();if(focusKey){const target=nodes.find(n=>n.el.dataset.historyKey===focusKey)?.el;focusReturn(target&&focusable(target)?target:map.getCanvas())};
 }
 let layout=()=>{};const move=()=>layout();map.on('move',move);map.on('idle',move);
 const click=(e:import('maplibre-gl').MapMouseEvent)=>{if(!map.getLayer('history-hit'))return;const f=map.queryRenderedFeatures(e.point,{layers:['history-hit']})[0];const r=frame.ranges.find(r=>r.id===f?.properties.id);if(r)show([e.lngLat.lng,e.lngLat.lat],r.title,[{label:r.kind==='polity'?'政权范围':r.kind==='context'?'地域背景':'钱币流通范围',text:`${periodLabel(r)} · ${r.precision==='approximate'?tr('大致范围'):tr('资料所绘范围')}`,method:`${rangeSpaceDescription(r)}；${r.note}`,source:r.source}])};map.on('click',click);
 const reload=()=>update(frame);map.on('style.load',reload);ensure();
 return{update,retry:reload,destroy(){attributionObserver.disconnect();cancelAnimationFrame(attributionFrame);restoring=false;markers.forEach(m=>m.remove());popup?.remove();map.off('move',move);map.off('idle',move);map.off('click',click);map.off('style.load',reload)}};
}
