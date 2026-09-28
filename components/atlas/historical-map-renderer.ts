import type {Map as GLMap,GeoJSONSource,Marker,Popup} from 'maplibre-gl';
import {rangeColor,rangeBounds,periodLabel,roleNames,type MapRange,type MapPlace,type PlaceClaim} from '@/lib/map-layers';
import {symbolSvg} from '@/lib/map-symbols';
type GL=typeof import('maplibre-gl');
type Frame={ranges:MapRange[];places:{place:MapPlace;claims:PlaceClaim[]}[]};
export function installHistoricalMap(gl:GL,map:GLMap,onError:(message:string)=>void){
 let frame:Frame={ranges:[],places:[]},markers:Marker[]=[],popup:Popup|null=null;
 const empty={type:'FeatureCollection' as const,features:[]};
 function ensure(){
  try{
   if(!map.getSource('historical-ranges'))map.addSource('historical-ranges',{type:'geojson',data:empty});
   const before=map.getLayer('coin-source-layout')?'coin-source-layout':undefined;
   const color=['get','color'] as ['get',string];
   if(!map.getLayer('history-wash'))map.addLayer({id:'history-wash',type:'fill',source:'historical-ranges',paint:{'fill-color':color,'fill-opacity':.09}},before);
   if(!map.getLayer('history-soft-edge'))map.addLayer({id:'history-soft-edge',type:'line',source:'historical-ranges',filter:['==','precision','approximate'],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,3,8,7,13,9],'line-blur':3,'line-opacity':.32}},before);
   if(!map.getLayer('history-keyline'))map.addLayer({id:'history-keyline',type:'line',source:'historical-ranges',filter:['==','precision','documented'],paint:{'line-color':'#fff7dc','line-width':3,'line-opacity':.65}},before);
   if(!map.getLayer('history-ink'))map.addLayer({id:'history-ink',type:'line',source:'historical-ranges',filter:['==','kind','polity'],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,.7,9,1.25],'line-opacity':['case',['==',['get','precision'],'approximate'],.4,.85]}},before);
   if(!map.getLayer('history-circulation'))map.addLayer({id:'history-circulation',type:'line',source:'historical-ranges',filter:['!=','kind','polity'],paint:{'line-color':color,'line-width':1.4,'line-dasharray':[2,3],'line-opacity':.8}},before);
   if(!map.getLayer('history-hit'))map.addLayer({id:'history-hit',type:'fill',source:'historical-ranges',paint:{'fill-opacity':0}},before);
  }catch{onError('历史图层未能加载。底图与目录仍可使用。')}
 }
 function show(at:[number,number],title:string,sections:{label:string;text:string;source?:string}[]){
  popup?.remove();const box=document.createElement('div');box.className='history-popup';const h=document.createElement('strong');h.textContent=title;box.appendChild(h);
  for(const s of sections){const p=document.createElement('p');p.textContent=`${s.label} · ${s.text}`;box.appendChild(p);if(s.source){for(const source of s.source.split('\n')){if(/^https?:\/\//.test(source)){const a=document.createElement('a');a.href=source;a.textContent='查看来源 ↗';a.target='_blank';a.rel='noreferrer';box.appendChild(a)}else{const small=document.createElement('small');small.textContent=source.startsWith('demo:')?'独立视觉夹具；不代表历史事实':'现有 Atlas 字段／研究索引';box.appendChild(small)}}}}
  popup=new gl.Popup({maxWidth:'300px',closeOnClick:true}).setLngLat(at).setDOMContent(box).addTo(map);
 }
 function update(next:Frame){frame=next;ensure();const source=map.getSource('historical-ranges') as GeoJSONSource|undefined;
  source?.setData({type:'FeatureCollection',features:frame.ranges.map(r=>({type:'Feature',id:r.id,geometry:r.geometry!,properties:{id:r.id,color:rangeColor(r.objectId),kind:r.kind,precision:r.precision}}))});
  markers.forEach(m=>m.remove());markers=[];
  const nodes:{el:HTMLElement;position:[number,number];minZoom:number;priority:number}[]=[];
  for(const {place:p,claims} of frame.places){const el=document.createElement('button');el.className='history-place historical-label';const preferred=[...claims].sort((a,b)=>['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(a.role)-['center','hoard','findspot','mint','mint-candidate','site','city'].indexOf(b.role))[0];
   el.innerHTML=symbolSvg(preferred.role);const span=document.createElement('span');span.textContent=p.name;el.appendChild(span);el.setAttribute('aria-label',`${p.zh} · ${claims.map(c=>roleNames[c.role]).join('、')}`);el.onclick=()=>show(p.coordinates,`${p.zh} / ${p.name}`,claims.map(c=>({label:roleNames[c.role],text:`${periodLabel(c)}；${c.note}`,source:c.source})));
   markers.push(new gl.Marker({element:el,anchor:'top',offset:[0,-14]}).setLngLat(p.coordinates).addTo(map));nodes.push({el,position:p.coordinates,minZoom:p.minZoom,priority:0});
  }
  for(const r of frame.ranges){const bounds=rangeBounds([r]);if(!bounds)continue;const at=r.label||[(bounds[0][0]+bounds[1][0])/2,(bounds[0][1]+bounds[1][1])/2] as [number,number];const el=document.createElement('button');el.className='history-range-label';el.setAttribute('aria-label',r.title+' · '+periodLabel(r));el.style.color=rangeColor(r.objectId);const title=document.createElement('strong');title.textContent=r.title;const date=document.createElement('small');date.textContent=periodLabel(r);el.appendChild(title);el.appendChild(date);el.onclick=()=>show(at,r.title,[{label:r.kind==='polity'?'政权范围':'流通／空间背景',text:`${periodLabel(r)}；${r.precision==='approximate'?'大致范围':'资料所绘范围'}；${r.note}`,source:r.source}]);markers.push(new gl.Marker({element:el}).setLngLat(at).addTo(map));nodes.push({el,position:at,minZoom:4,priority:1});}
  layout=()=>{const used:{x:number;y:number;w:number;h:number}[]=[];for(const n of nodes.sort((a,b)=>a.priority-b.priority)){const p=map.project(n.position),w=n.el.offsetWidth||120,h=n.el.offsetHeight||32;const hit=used.some(b=>Math.abs(b.x-p.x)<(b.w+w)/2+8&&Math.abs(b.y-p.y)<(b.h+h)/2+4);const show=map.getZoom()>=n.minZoom&&!hit;n.el.style.visibility=show?'visible':'hidden';if(show)used.push({x:p.x,y:p.y,w,h})}};layout();
 }
 let layout=()=>{};const move=()=>layout();map.on('move',move);
 const click=(e:import('maplibre-gl').MapMouseEvent)=>{if(!map.getLayer('history-hit'))return;const f=map.queryRenderedFeatures(e.point,{layers:['history-hit']})[0];const r=frame.ranges.find(r=>r.id===f?.properties.id);if(r)show([e.lngLat.lng,e.lngLat.lat],r.title,[{label:r.kind==='polity'?'政权范围':'流通／空间背景',text:`${periodLabel(r)}；${r.note}`,source:r.source}])};map.on('click',click);
 const reload=()=>update(frame);map.on('style.load',reload);ensure();
 return{update,retry:reload,destroy(){markers.forEach(m=>m.remove());popup?.remove();map.off('move',move);map.off('click',click);map.off('style.load',reload)}};
}
