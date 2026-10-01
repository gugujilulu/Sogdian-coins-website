import {rangeSpaceDescription} from '@/lib/range-time';
import type {Map as GLMap,GeoJSONSource,Marker,Popup} from 'maplibre-gl';
import {rangeColor,rangeBounds,periodLabel,roleNames,type MapRange,type MapPlace,type PlaceClaim} from '@/lib/map-layers';
import {rangeBoundaryFeatures} from '@/lib/range-boundaries';
import {ensureRangeStyle} from '@/lib/map-layer-style';
import {symbolSvg} from '@/lib/map-symbols';
type GL=typeof import('maplibre-gl');
type Frame={ranges:MapRange[];places:{place:MapPlace;claims:PlaceClaim[]}[]};
export function installHistoricalMap(gl:GL,map:GLMap,onError:(message:string)=>void){
 let frame:Frame={ranges:[],places:[]},markers:Marker[]=[],popup:Popup|null=null;
 function ensure(){
  try{
   ensureRangeStyle(map);
  }catch{onError('历史图层未能加载。底图与目录仍可使用。')}
 }
 function show(at:[number,number],title:string,sections:{label:string;text:string;source?:string}[]){
  popup?.remove();const box=document.createElement('div');box.className='history-popup';const h=document.createElement('strong');h.textContent=title;box.appendChild(h);
  for(const s of sections){const p=document.createElement('p');p.textContent=`${s.label} · ${s.text}`;box.appendChild(p);if(s.source){for(const source of s.source.split('\n')){if(/^https?:\/\//.test(source)){const a=document.createElement('a');a.href=source;a.textContent='查看来源 ↗';a.target='_blank';a.rel='noreferrer';box.appendChild(a)}else{const small=document.createElement('small');small.textContent=source.startsWith('demo:')?'独立视觉夹具；不代表历史事实':source;box.appendChild(small)}}}}
  popup=new gl.Popup({maxWidth:'300px',closeOnClick:true}).setLngLat(at).setDOMContent(box).addTo(map);
 }
 function update(next:Frame){popup?.remove();popup=null;frame=next;ensure();const source=map.getSource('historical-ranges') as GeoJSONSource|undefined;
  source?.setData({type:'FeatureCollection',features:frame.ranges.map(r=>({type:'Feature',id:r.id,geometry:r.geometry!,properties:{id:r.id,color:rangeColor(r.objectId),kind:r.kind,precision:r.precision,opacity:r.display?.washOpacity??.22}}))});
  (map.getSource('historical-boundaries') as GeoJSONSource|undefined)?.setData(rangeBoundaryFeatures(frame.ranges));
  markers.forEach(m=>m.remove());markers=[];
  const nodes:{el:HTMLElement;position:[number,number];minZoom:number;priority:number;angle?:number}[]=[];
  for(const {place:p,claims} of frame.places){const el=document.createElement('button');el.className='history-place historical-label';const preferred=[...claims].sort((a,b)=>['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(a.role)-['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(b.role))[0];
   el.innerHTML=symbolSvg(preferred.role);const span=document.createElement('span');span.textContent=p.name;el.appendChild(span);el.setAttribute('aria-label',`${p.zh} · ${claims.map(c=>roleNames[c.role]).join('、')}`);el.onclick=()=>show(p.coordinates,`${p.zh} / ${p.name}`,claims.map(c=>({label:roleNames[c.role],text:`${periodLabel(c)}；${c.note}`,source:c.source})));
   markers.push(new gl.Marker({element:el,anchor:'top',offset:[0,-14]}).setLngLat(p.coordinates).addTo(map));nodes.push({el,position:p.coordinates,minZoom:p.minZoom,priority:0});
  }
  for(const r of frame.ranges){const bounds=rangeBounds([r]);if(!bounds)continue;const at=r.label||[(bounds[0][0]+bounds[1][0])/2,(bounds[0][1]+bounds[1][1])/2] as [number,number];const el=document.createElement('button');el.className='history-range-label';el.setAttribute('aria-label',r.title+' · '+periodLabel(r));el.style.color=rangeColor(r.objectId);const title=document.createElement('strong');title.textContent=r.labelTitle||r.title;const date=document.createElement('small');date.textContent=(r.labelLatin||periodLabel(r))+(r.presentation?.background?' · 历史背景':'');const block=document.createElement('span');block.className='range-name-block';block.style.transform=`rotate(${r.labelAngle||0}deg)`;block.appendChild(title);block.appendChild(date);el.appendChild(block);el.onclick=()=>show(at,r.title,[{label:r.kind==='polity'?'政权范围':'流通／空间背景',text:`${periodLabel(r)}；${rangeSpaceDescription(r)}；${r.presentation?.message||''}；${r.precision==='approximate'?'大致范围':'资料所绘范围'}；${r.note}`,source:r.source}]);markers.push(new gl.Marker({element:el}).setLngLat(at).addTo(map));nodes.push({el,position:at,minZoom:r.coverageEdge?3:4,priority:1,angle:r.labelAngle});}
  for(const r of frame.ranges){if(!r.coverageLabel)continue;const el=document.createElement('span');el.className='history-coverage-label';el.textContent=(r.coverage?.edgeLabel||'范围延伸至原图之外')+' ↗';markers.push(new gl.Marker({element:el,anchor:'right'}).setLngLat(r.coverageLabel).addTo(map));}
  layout=()=>{const used:DOMRect[]=[];const obstacles=Array.from(map.getContainer().parentElement?.querySelectorAll('.coin-map-marker,.map-toolbar,.history-controls,.preview-badge,.atlas-search-panel')||[]).filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect());
   const overlaps=(a:DOMRect,b:DOMRect)=>a.left<b.right+5&&a.right>b.left-5&&a.top<b.bottom+5&&a.bottom>b.top-5;
   for(const n of nodes.sort((a,b)=>a.priority-b.priority)){if(n.priority){const z=map.getZoom();n.el.style.fontSize=`${Math.max(14,Math.min(23,15+(z-4)*2.5))}px`;}
    const box=n.el.getBoundingClientRect();const hit=used.some(b=>overlaps(box,b))||(n.priority===1&&obstacles.some(b=>overlaps(box,b)));
    const show=map.getZoom()>=n.minZoom&&!hit;n.el.style.visibility=show?'visible':'hidden';if(show)used.push(box);
   }
  };layout();
 }
 let layout=()=>{};const move=()=>layout();map.on('move',move);map.on('idle',move);
 const click=(e:import('maplibre-gl').MapMouseEvent)=>{if(!map.getLayer('history-hit'))return;const f=map.queryRenderedFeatures(e.point,{layers:['history-hit']})[0];const r=frame.ranges.find(r=>r.id===f?.properties.id);if(r)show([e.lngLat.lng,e.lngLat.lat],r.title,[{label:r.kind==='polity'?'政权范围':'流通／空间背景',text:`${periodLabel(r)}；${rangeSpaceDescription(r)}；${r.presentation?.message||''}；${r.note}`,source:r.source}])};map.on('click',click);
 const reload=()=>update(frame);map.on('style.load',reload);ensure();
 return{update,retry:reload,destroy(){markers.forEach(m=>m.remove());popup?.remove();map.off('move',move);map.off('idle',move);map.off('click',click);map.off('style.load',reload)}};
}
