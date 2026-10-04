import type {Map as GLMap} from 'maplibre-gl';
export function ensureRangeStyle(map:Pick<GLMap,'getSource'|'addSource'|'getLayer'|'addLayer'>){
 const empty={type:'FeatureCollection' as const,features:[]};
   if(!map.getSource('historical-ranges'))map.addSource('historical-ranges',{type:'geojson',data:empty});
   if(!map.getSource('historical-boundaries'))map.addSource('historical-boundaries',{type:'geojson',data:empty});
   const before=map.getLayer('coin-source-layout')?'coin-source-layout':undefined;
   const color=['get','color'] as ['get',string];
   if(!map.getLayer('history-wash'))map.addLayer({id:'history-wash',type:'fill',source:'historical-ranges',paint:{'fill-color':color,'fill-opacity':['coalesce',['get','opacity'],.22],'fill-antialias':true,'fill-outline-color':'rgba(0,0,0,0)'}},before);
   if(!map.getLayer('history-keyline'))map.addLayer({id:'history-keyline',type:'line',source:'historical-boundaries',filter:['==','precision','documented'],paint:{'line-color':color,'line-width':2.1,'line-opacity':.12}},before);
   if(!map.getLayer('history-ink'))map.addLayer({id:'history-ink',type:'line',source:'historical-boundaries',filter:['all',['==','kind','polity'],['==','precision','documented']],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,.55,9,.9],'line-opacity':.8}},before);
   if(!map.getLayer('history-approximate'))map.addLayer({id:'history-approximate',type:'line',source:'historical-boundaries',filter:['all',['==','kind','polity'],['==','precision','approximate']],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],4,.65,8,1.05],'line-dasharray':[3,2],'line-opacity':.85}},before);
   if(!map.getLayer('history-circulation'))map.addLayer({id:'history-circulation',type:'line',source:'historical-boundaries',filter:['==','kind','circulation'],paint:{'line-color':color,'line-width':1.4,'line-dasharray':[2,3],'line-opacity':.8}},before);
   if(!map.getLayer('history-context'))map.addLayer({id:'history-context',type:'line',source:'historical-boundaries',filter:['==','kind','context'],paint:{'line-color':color,'line-width':.8,'line-dasharray':[1,4],'line-opacity':.65}},before);
   if(!map.getLayer('history-hit'))map.addLayer({id:'history-hit',type:'fill',source:'historical-ranges',paint:{'fill-opacity':0}},before);
}
